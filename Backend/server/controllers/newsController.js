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

const CategorizedKeywords = mongoose.connection.collection("categorized_keywords");

exports.getKeywordsByCategory = async (req, res) => {
  try {
    const { category } = req.query;

    // Kiểm tra nếu category không được cung cấp
    if (!category) {
      return res.status(400).json({ message: "Category is required." });
    }

    // Truy vấn từ collection categorized_keywords
    const categoryData = await CategorizedKeywords.findOne({ category });

    // Nếu không tìm thấy dữ liệu
    if (!categoryData) {
      return res.status(404).json({ message: "No data found for this category." });
    }

    // Trả về dữ liệu của danh mục
    res.status(200).json({
      category: categoryData.category,
      timestamp: categoryData.timestamp,
      keywords: categoryData.keywords,
    });
  } catch (error) {
    console.error("Error fetching keywords by category:", error);
    res.status(500).json({ message: "Error fetching keywords by category" });
  }
};

exports.getTop5KeywordsByCategory = async (req, res) => {
  try {
    const { category } = req.query;

    // Kiểm tra nếu category không được cung cấp
    if (!category) {
      return res.status(400).json({ message: "Category is required." });
    }

    // Truy vấn từ collection categorized_keywords
    const categoryData = await CategorizedKeywords.findOne({ category });

    // Nếu không tìm thấy dữ liệu
    if (!categoryData) {
      return res.status(404).json({ message: "No data found for this category." });
    }

    // Lấy top 5 từ khóa dựa trên số lượng (thứ hai trong mảng)
    const top5Keywords = categoryData.keywords
      .sort((a, b) => b[1] - a[1]) // Sắp xếp giảm dần theo số lượng
      .slice(0, 5) // Lấy 5 từ khóa đầu tiên
      .map(([keyword, count]) => ({ keyword, count })); // Định dạng lại dữ liệu

    // Trả về dữ liệu
    res.status(200).json({
      category: categoryData.category,
      topKeywords: top5Keywords,
    });
  } catch (error) {
    console.error("Error fetching top 5 keywords by category:", error);
    res.status(500).json({ message: "Error fetching top 5 keywords by category" });
  }
};


exports.getTop20KeywordsByCategory = async (req, res) => {
  try {
    const { category } = req.query;

    // Kiểm tra nếu category không được cung cấp
    if (!category) {
      return res.status(400).json({ message: "Category is required." });
    }

    // Truy vấn từ collection categorized_keywords
    const categoryData = await CategorizedKeywords.findOne({ category });

    // Nếu không tìm thấy dữ liệu
    if (!categoryData) {
      return res.status(404).json({ message: "No data found for this category." });
    }

    // Lấy top 20 từ khóa dựa trên số lượng (thứ hai trong mảng)
    const top20Keywords = categoryData.keywords
      .sort((a, b) => b[1] - a[1]) // Sắp xếp giảm dần theo số lượng
      .slice(0, 20) // Lấy 20 từ khóa đầu tiên
      .map(([keyword, count]) => ({ keyword, count })); // Định dạng lại dữ liệu

    // Trả về dữ liệu
    res.status(200).json({
      category: categoryData.category,
      topKeywords: top20Keywords,
    });
  } catch (error) {
    console.error("Error fetching top 20 keywords by category:", error);
    res.status(500).json({ message: "Error fetching top 20 keywords by category" });
  }
};


exports.getArticlesByTopKeywords = async (req, res) => {
  try {
    const { category } = req.query;

    if (!category) {
      return res.status(400).json({ message: "Category is required." });
    }

    // Retrieve category data
    const categoryData = await CategorizedKeywords.findOne({ category });
    if (!categoryData) {
      return res.status(404).json({ message: "Category not found." });
    }

    // Normalize keywords
    const normalizedKeywords = normalizeKeywords(
      categoryData.keywords.map(([keyword]) => keyword)
    );

    const topKeywords = normalizedKeywords.slice(0, 5);

    let articlesWithKeywords = [];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    for (const keyword of topKeywords) {
      const relatedArticles = await News.find({
        title: { $regex: keyword, $options: "i" },
        pubDate: { $gte: sevenDaysAgo }, // Filter articles within the last 7 days
      })
        .limit(5)
        .lean();

      const articlesWithKeyword = relatedArticles.map((article) => ({
        ...article,
        keyword,
      }));

      articlesWithKeywords = articlesWithKeywords.concat(articlesWithKeyword);
    }

    // Sort articles by keyword rank
    articlesWithKeywords.sort((a, b) => {
      const rankA = topKeywords.findIndex((keyword) => keyword === a.keyword);
      const rankB = topKeywords.findIndex((keyword) => keyword === b.keyword);
      return rankA - rankB;
    });

    res.status(200).json({
      category: categoryData.category,
      topKeywords,
      articles: articlesWithKeywords,
    });
  } catch (error) {
    console.error("Error fetching articles by top keywords:", error);
    res.status(500).json({ message: "Error fetching articles by top keywords." });
  }
};

// Normalize keywords by replacing "_" with spaces
function normalizeKeywords(keywords) {
  return keywords.map((keyword) => keyword.replace(/_/g, ' '));
}


// Controller for fetching all data from categorized_keywords
// Controller for fetching all data from categorized_keywords

// API to fetch all data from the `categorized_keywords` collection
exports.getAllCategorizedKeywords = async (req, res) => {
  try {
    // Access the collection directly using mongoose.connection
    const categorizedKeywordsCollection = mongoose.connection.collection("categorized_keywords");

    // Fetch all documents in the collection
    const allData = await categorizedKeywordsCollection.find({}).toArray(); // Use `.toArray()` to fetch results

    // Check if there is any data in the collection
    if (!allData || allData.length === 0) {
      return res.status(404).json({ message: "No data found in categorized_keywords." });
    }

    // Return all fetched data
    res.status(200).json({
      message: "Data fetched successfully.",
      data: allData,
    });
  } catch (error) {
    console.error("Error fetching categorized keywords:", error);
    res.status(500).json({ message: "Error fetching categorized keywords." });
  }
};


