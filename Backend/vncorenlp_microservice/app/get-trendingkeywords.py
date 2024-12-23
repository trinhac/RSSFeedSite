import atexit
from flask import Flask, jsonify, request
import time
from pymongo import MongoClient
from vncorenlp import VnCoreNLP
from datetime import datetime, timedelta, timezone
from collections import defaultdict, Counter
from apscheduler.schedulers.background import BackgroundScheduler
from flask_cors import CORS
import os
import re

# Flask app setup
app = Flask(__name__)
CORS(app)

# MongoDB connection setup
client = MongoClient("mongodb://localhost:27017")
db = client["xml_rss"]  # Replace with your database name
collection = db["test_json_xml"]  # Replace with your collection name

# Collections for storing precomputed and categorized keywords
precomputed_collection = db["precomputed_keywords"]
categorized_keywords_collection = db["categorized_keywords"]

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
            parsed_date = datetime.strptime(base_date, "%a, %d %b %Y %H:%M:%S")
            offset_hours = int(offset)
            parsed_date += timedelta(hours=offset_hours)
            return parsed_date
        except ValueError:
            pass

    print(f"Failed to parse pubDate: {pub_date}")
    return None

def preprocess_text(text):
    """
    Preprocess text using VnCoreNLP to extract meaningful tokens.
    Handles server errors gracefully.
    """
    try:
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
    except KeyError as e:
        print(f"VnCoreNLP KeyError: {e}. Check the server or input text.")
        return []  # Return an empty list on failure
    except Exception as e:
        print(f"Unexpected error during preprocessing: {e}")
        return []


def extract_trending_keywords_by_time(time_interval="day"):
    documents = collection.find({}, {"title": 1, "pubDate": 1})
    keywords_by_time = defaultdict(Counter)

    for doc in documents:
        title = doc.get("title", "")
        pub_date = doc.get("pubDate", "")

        if not title or not pub_date:
            continue

        parsed_date = parse_pub_date(pub_date)
        if not parsed_date:
            continue

        if time_interval == "day":
            interval = parsed_date.date()
        elif time_interval == "week":
            interval = parsed_date - timedelta(days=parsed_date.weekday())
        else:
            raise ValueError(
                "Unsupported time interval: choose 'day' or 'week'.")

        keywords = preprocess_text(title)
        keywords_by_time[interval].update(keywords)

    return keywords_by_time

def identify_trending_keywords(keywords_by_time, recent_days=7):
    sorted_intervals = sorted(keywords_by_time.keys())
    recent_intervals = sorted_intervals[-recent_days:]
    recent_keywords = Counter()

    for interval in recent_intervals:
        recent_keywords.update(keywords_by_time[interval])

    historical_keywords = Counter()
    for interval in sorted_intervals[:-recent_days]:
        historical_keywords.update(keywords_by_time[interval])

    trending_keywords = {}
    for keyword, recent_count in recent_keywords.items():
        historical_count = historical_keywords.get(keyword, 0)
        if historical_count == 0:
            trending_keywords[keyword] = recent_count
        else:
            trending_keywords[keyword] = (
                recent_count - historical_count) / historical_count

    return sorted(trending_keywords.items(), key=lambda x: x[1], reverse=True)

def precompute_trending_keywords():
    """
    Precompute the top 2000 trending keywords and store them in a MongoDB collection.
    """
    print("Starting precomputation of trending keywords...")
    keywords_by_time = extract_trending_keywords_by_time(time_interval="day")
    trending_keywords = identify_trending_keywords(
        keywords_by_time, recent_days=7)

    # Get the top 2000 keywords
    top_keywords = trending_keywords[:2000]

    # Save to a new collection
    precomputed_collection.delete_many({})  # Clear old data
    precomputed_collection.insert_one({
        "timestamp": datetime.utcnow(),
        "keywords": top_keywords
    })
    print("Trending keywords precomputation completed.")

def categorize_keywords_by_arranged_category():
    """
    Categorize keywords from precomputed_keywords into arrangedCategory groups.
    Calculate trending scores for keywords similar to identify_trending_keywords.
    """
    start_time = time.time()  # Start timer
    print("Bắt đầu phân loại từ khóa vào từng danh mục...")

    # Fetch all documents from precomputed_keywords
    precomputed_data = precomputed_collection.find_one(sort=[("timestamp", -1)])
    if not precomputed_data:
        print("Không tìm thấy từ khóa precomputed_keywords để phân loại.")
        return

    top_keywords = {k[0] for k in precomputed_data["keywords"]}  # Chỉ lấy từ khóa top
    print(f"Số lượng từ khóa từ precomputed_keywords: {len(top_keywords)}")

    # Cắt ngưỡng thời gian cho bài viết gần đây và lịch sử
    recent_cutoff = datetime.now(timezone.utc) - timedelta(days=7)
    historical_cutoff = datetime.now(timezone.utc) - timedelta(days=14)

    # Lấy tất cả bài viết có `pubDate` và `arrangedCategory`
    documents = collection.find(
        {"pubDate": {"$exists": True}}, {"title": 1, "arrangedCategory": 1, "pubDate": 1}
    )

    # Khởi tạo bộ đếm từ khóa theo danh mục
    category_keywords_recent = defaultdict(Counter)
    category_keywords_historical = defaultdict(Counter)

    for doc in documents:
        title = doc.get("title", "")
        category = doc.get("arrangedCategory", "unknown")
        pub_date = doc.get("pubDate", "")

        if not title or not category or not pub_date:
            continue

        # Chuyển đổi pubDate sang datetime và kiểm tra thời gian
        parsed_date = parse_pub_date(pub_date)
        if parsed_date:
            parsed_date = parsed_date.replace(tzinfo=timezone.utc)  # Chuyển sang offset-aware datetime

        if not parsed_date:
            continue

        # Phân loại bài viết vào recent hoặc historical
        title_keywords = preprocess_text(title)
        filtered_keywords = {word for word in title_keywords if word in top_keywords}

        if parsed_date >= recent_cutoff:
            category_keywords_recent[category].update(filtered_keywords)
        elif historical_cutoff <= parsed_date < recent_cutoff:
            category_keywords_historical[category].update(filtered_keywords)

    # Tính toán trending score cho từng danh mục
    categorized_keywords_with_scores = {}
    for category in category_keywords_recent.keys():
        recent_keywords = category_keywords_recent[category]
        historical_keywords = category_keywords_historical.get(category, Counter())

        trending_scores = {}
        for keyword, recent_count in recent_keywords.items():
            historical_count = historical_keywords.get(keyword, 0)
            if historical_count == 0:
                trending_scores[keyword] = recent_count
            else:
                trending_scores[keyword] = (recent_count - historical_count) / (historical_count)

        # Sắp xếp từ khóa theo trending score
        sorted_keywords = sorted(trending_scores.items(), key=lambda x: x[1], reverse=True)
        categorized_keywords_with_scores[category] = sorted_keywords

    # Lưu vào MongoDB
    categorized_keywords_collection.delete_many({})
    for category, keywords in categorized_keywords_with_scores.items():
        categorized_keywords_collection.insert_one({
            "category": category,
            "timestamp": datetime.now(timezone.utc),
            "keywords": keywords[:500]  # Giới hạn top 500 từ khóa
        })

    elapsed_time = time.time() - start_time  # Tính thời gian hoàn tất
    print(f"Phân loại từ khóa vào danh mục hoàn tất trong {elapsed_time:.2f} giây.")


@app.route("/api/trending_keywords", methods=["GET"])
def get_trending_keywords():
    """
    Endpoint to get the top 2000 precomputed trending keywords.
    """
    latest_data = precomputed_collection.find_one(
        sort=[("timestamp", -1)])  # Get the latest entry

    if not latest_data:
        return jsonify({"error": "No precomputed keywords available."}), 404

    return jsonify({"timestamp": latest_data["timestamp"], "keywords": latest_data["keywords"]})

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

    result = categorized_keywords_collection.find_one({"category": category})
    if not result:
        return jsonify({"error": f"No keywords found for category: {category}."}), 404

    return jsonify({
        "category": result["category"],
        "timestamp": result["timestamp"],
        "keywords": result["keywords"]
    })

# Initialize and start the scheduler
# scheduler = BackgroundScheduler()
# scheduler.add_job(precompute_trending_keywords, 'interval', minutes=3)
# scheduler.add_job(categorize_keywords_by_arranged_category, 'interval', minutes=20)
# scheduler.start()

# # Ensure the scheduler shuts down gracefully
# atexit.register(lambda: scheduler.shutdown())
# precompute_trending_keywords()
categorize_keywords_by_arranged_category()
# Run the Flask app
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=9999)