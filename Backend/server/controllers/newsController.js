const News = require("../models/News");
const mongoose = require("mongoose");

exports.getTrendingKeywords = async (req, res) => {
  try {
    // Fetch the latest precomputed keywords
    const precomputedCollection = mongoose.connection.collection(
      "precomputed_keywords"
    );

    const latestData = await precomputedCollection.findOne(
      {},
      { sort: { timestamp: -1 } }
    );

    if (!latestData) {
      return res
        .status(404)
        .json({ message: "No precomputed keywords available." });
    }

    res.status(200).json({
      timestamp: latestData.timestamp,
      keywords: latestData.keywords,
    });
  } catch (error) {
    console.error("Error fetching trending keywords:", error);
    res.status(500).json({ message: "Error fetching trending keywords" });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await News.distinct("arrangedCategory");
    const allowedCategories = [
      "the-gioi",
      "thoi-su",
      "kinh-te",
      "giai-tri",
      "the-thao",
      "phap-luat-chinh-tri",
      "giao-duc",
      "suc-khoe-doi-song",
      "du-lich",
      "khoa-hoc-cong-nghe",
      "xe",
      "van-hoa",
      "doi-song",
    ];

    const filteredCategories = categories.filter((cat) =>
      allowedCategories.includes(cat)
    );

    res.json(filteredCategories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getNewsByCategory = async (req, res) => {
  try {
    const { category } = req.query; // Get the category from the query params
    const news = await News.find({ arrangedCategory: category });
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.searchNews = async (req, res) => {
  try {
    const keyword = req.query.q;

    if (!keyword) {
      return res.status(400).json({ message: "Missing search keyword" });
    }

    // Search for the keyword in `title`, `description`, and `authors`
    const results = await News.find({
      $or: [{ title: { $regex: keyword, $options: "i" } }],
    });

    res.status(200).json(results);
  } catch (error) {
    console.error("Error during search:", error);
    res.status(500).json({ message: "Error searching for news articles" });
  }
};

exports.getAllArticles = async (req, res) => {
  try {
    const articles = await News.find();
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTop10Keywords = async (req, res) => {
  try {
    const precomputedCollection = mongoose.connection.collection(
      "precomputed_keywords"
    );

    // Fetch the latest precomputed keywords
    const latestData = await precomputedCollection.findOne(
      {},
      { sort: { timestamp: -1 } }
    );

    if (!latestData) {
      return res
        .status(404)
        .json({ message: "No precomputed keywords available." });
    }

    // Extract the top 10 keywords
    const top10Keywords = latestData.keywords.slice(0, 10);

    res.status(200).json({
      timestamp: latestData.timestamp,
      top_10_keywords: top10Keywords,
    });
  } catch (error) {
    console.error("Error fetching top 10 keywords:", error);
    res.status(500).json({ message: "Error fetching top 10 keywords" });
  }
};

exports.getKeywordsByTime = async (req, res) => {
  try {
    const { time_interval = "day" } = req.query;

    // Validate the time interval
    if (!["day", "week"].includes(time_interval)) {
      return res
        .status(400)
        .json({ message: "Invalid time interval. Use 'day' or 'week'." });
    }

    // Extract keywords grouped by time intervals
    const keywordsByTime = extractTrendingKeywordsByTime(time_interval); // Replace with logic or adapt Python code.

    // Convert data into a format suitable for JSON response
    const keywordsByTimeSerialized = {};
    for (const [interval, counter] of Object.entries(keywordsByTime)) {
      keywordsByTimeSerialized[interval] = Object.fromEntries(counter);
    }

    res.status(200).json({ keywords_by_time: keywordsByTimeSerialized });
  } catch (error) {
    console.error("Error fetching keywords by time:", error);
    res.status(500).json({ message: "Error fetching keywords by time" });
  }
};
