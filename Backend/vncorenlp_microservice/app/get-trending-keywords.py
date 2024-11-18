from flask import Flask, jsonify, request
from pymongo import MongoClient
from vncorenlp import VnCoreNLP
from datetime import datetime, timedelta
from collections import defaultdict, Counter
import os

# Flask app setup
app = Flask(__name__)

# MongoDB connection setup
client = MongoClient("mongodb://localhost:27017")
db = client["xml_rss"]  # Replace with your database name
collection = db["test_json_xml"]  # Replace with your collection name

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
    "%a, %d %b %Y %H:%M:%S %z",  # Format for vnexpress.net
    "%a, %d %b %y %H:%M:%S %z",  # Format for thanhnien.vn
    "%Y-%m-%d %H:%M:%S"          # Format for nhandan.vn
]

def parse_pub_date(pub_date):
    for date_format in DATE_FORMATS:
        try:
            return datetime.strptime(pub_date, date_format)
        except ValueError:
            continue
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
            raise ValueError("Unsupported time interval: choose 'day' or 'week'.")

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
            trending_keywords[keyword] = (recent_count - historical_count) / historical_count

    return sorted(trending_keywords.items(), key=lambda x: x[1], reverse=True)

# Flask endpoints
@app.route("/api/trending_keywords", methods=["GET"])
def get_trending_keywords():
    """
    Endpoint to get trending keywords based on time intervals.
    Query parameters:
        time_interval: "day" or "week" (default is "day")
        recent_days: Number of recent days to analyze (default is 7)
    """
    time_interval = request.args.get("time_interval", "day")
    recent_days = int(request.args.get("recent_days", 7))

    keywords_by_time = extract_trending_keywords_by_time(time_interval=time_interval)
    trending_keywords = identify_trending_keywords(keywords_by_time, recent_days=recent_days)

    return jsonify({"trending_keywords": trending_keywords})

@app.route("/api/keywords_by_time", methods=["GET"])
def get_keywords_by_time():
    """
    Endpoint to get all keywords grouped by time intervals.
    Query parameters:
        time_interval: "day" or "week" (default is "day")
    """
    time_interval = request.args.get("time_interval", "day")
    keywords_by_time = extract_trending_keywords_by_time(time_interval=time_interval)

    # Convert Counter objects to dict for JSON serialization
    keywords_by_time_serialized = {
        str(interval): dict(counter)
        for interval, counter in keywords_by_time.items()
    }

    return jsonify({"keywords_by_time": keywords_by_time_serialized})

@app.route("/api/top_10_keywords", methods=["GET"])
def get_top_keywords():
    """
    Endpoint to get the top 10 keywords based on time intervals.
    Query parameters:
        time_interval: "day" or "week" (default is "day")
        recent_days: Number of recent days to analyze (default is 7)
    """
    time_interval = request.args.get("time_interval", "day")
    recent_days = int(request.args.get("recent_days", 7))

    # Extract and identify trending keywords
    keywords_by_time = extract_trending_keywords_by_time(time_interval=time_interval)
    trending_keywords = identify_trending_keywords(keywords_by_time, recent_days=recent_days)

    # Get the top 10 keywords
    top_keywords = trending_keywords[:10]  # Get top 10 entries from sorted trending keywords

    return jsonify({"top_keywords": top_keywords})


# Run the Flask app
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
