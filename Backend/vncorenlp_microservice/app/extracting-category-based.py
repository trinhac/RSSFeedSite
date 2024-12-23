import atexit
from flask import Flask, jsonify
from pymongo import MongoClient
from vncorenlp import VnCoreNLP
from datetime import datetime, timedelta, timezone
from collections import defaultdict, Counter
from apscheduler.schedulers.background import BackgroundScheduler
import os
import re

# Flask app setup
app = Flask(__name__)

# MongoDB connection setup
client = MongoClient("mongodb://localhost:27017")
db = client["xml_rss"]  # Replace with your database name
collection = db["test_json_xml"]  # Replace with your collection name

# Collection for storing category-based keywords
category_keywords_collection = db["category_keywords"]

# VnCoreNLP setup
VNCORENLP_JAR_PATH = "VnCoreNLP/VnCoreNLP-1.1.1.jar"
annotator = VnCoreNLP(VNCORENLP_JAR_PATH, annotators="wseg,pos,ner", max_heap_size='-Xmx2g')

# Load Vietnamese stopwords
def load_stop_words(file_path="vietnamese_stopwords.txt"):
    full_path = os.path.join(os.path.dirname(__file__), file_path)
    with open(full_path, "r", encoding="utf-8") as f:
        return set(line.strip() for line in f)

STOP_WORDS = load_stop_words()

# Define supported date formats
DATE_FORMATS = [
    "%a, %d %b %Y %H:%M:%S %z",       # vnexpress.net, dantri
    "%a, %d %b %y %H:%M:%S %z",       # thanhnien.vn
    "%Y-%m-%d %H:%M:%S",              # nhandan.vn
    "%a, %d %b %Y %H:%M:%S GMT%z"     # tuoi tre
]

def parse_pub_date(pub_date):
    # Try to parse using predefined formats
    for date_format in DATE_FORMATS:
        try:
            return datetime.strptime(pub_date, date_format)
        except ValueError:
            continue

    # Handle special cases like "GMT+7"
    match = re.match(r"^(.*) GMT([+-]\d+)$", pub_date)
    if match:
        base_date, offset = match.groups()
        try:
            # Parse the base date without the offset
            parsed_date = datetime.strptime(base_date.strip(), "%a, %d %b %Y %H:%M:%S")
            # Adjust the time for the offset
            offset_hours = int(offset)
            parsed_date += timedelta(hours=offset_hours)
            return parsed_date
        except ValueError as e:
            print(f"Error parsing base date: {e}")
            pass

    print(f"Failed to parse pubDate: {pub_date}")
    return None

def preprocess_text(text):
    annotated_text = annotator.annotate(text)
    tokens = []

    for sentence in annotated_text['sentences']:
        for word_info in sentence:
            word = word_info['form']
            pos_tag = word_info['posTag']
            ner_label = word_info.get('nerLabel', 'O')

            if (ner_label != 'O' or pos_tag in ["N", "Np"]) and len(word) > 2:
                if word not in STOP_WORDS:
                    tokens.append(word)
    return tokens

def extract_keywords_by_category():
    """
    Extract keywords based on `arrangedCategory` for articles published in the last 7 days.
    Store them in a MongoDB collection grouped by category.
    """
    print("Starting keyword extraction by category...")

    # Calculate the cutoff date for the last 7 days (offset-aware datetime)
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=7)

    # Fetch documents filtered by `pubDate` and grouped by `arrangedCategory`
    documents = collection.find(
        {"pubDate": {"$exists": True}},  # Ensure pubDate exists
        {"title": 1, "arrangedCategory": 1, "pubDate": 1}
    )

    category_keywords = defaultdict(Counter)

    for doc in documents:
        title = doc.get("title", "")
        category = doc.get("arrangedCategory", "unknown")
        pub_date = doc.get("pubDate", "")

        if not title or not category or not pub_date:
            continue

        # Parse pubDate and ensure timezone-aware datetime comparison
        parsed_date = parse_pub_date(pub_date)
        if not parsed_date or parsed_date < cutoff_date:
            continue

        # Preprocess text and count keywords
        keywords = preprocess_text(title)
        category_keywords[category].update(keywords)

    # Save the keywords to the `category_keywords` collection
    category_keywords_collection.delete_many({"recent_days": 7})  # Clear old data for this time range
    for category, keywords in category_keywords.items():
        category_keywords_collection.insert_one({
            "category": category,
            "recent_days": 7,
            "timestamp": datetime.now(timezone.utc),  # Save offset-aware timestamp
            "keywords": keywords.most_common(500)  # Top 500 keywords per category
        })

    print("Keyword extraction by category completed.")

@app.route("/api/keywords_by_category", methods=["GET"])
def get_keywords_by_category():
    """
    Endpoint to fetch keywords for a specific category.
    Query parameters:
        category: Name of the category (e.g., "the-gioi").
    """
    category = request.args.get("category", None)

    if not category:
        return jsonify({"error": "Category parameter is required."}), 400

    result = category_keywords_collection.find_one({"category": category, "recent_days": 7})
    if not result:
        return jsonify({"error": f"No keywords found for category: {category} in the last 7 days."}), 404

    return jsonify({
        "category": result["category"],
        "recent_days": 7,
        "timestamp": result["timestamp"],
        "keywords": result["keywords"]
    })

# Initialize and start the scheduler
scheduler = BackgroundScheduler()
scheduler.add_job(extract_keywords_by_category, 'interval', minutes=2)
scheduler.start()

# Ensure the scheduler shuts down gracefully
atexit.register(lambda: scheduler.shutdown())

# Run the Flask app
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=7000)
