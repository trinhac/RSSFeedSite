const News = require("../models/News");

exports.getNewsByDate = async (req, res) => {
  try {
    const { date } = req.query;
    const news = await News.find({ date: new Date(date) });
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getNewsByTopic = async (req, res) => {
  try {
    const { topic } = req.query;
    const news = await News.find({ topic });
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getNewsByKeyword = async (req, res) => {
  try {
    const { keyword } = req.query;
    const news = await News.find({ keywords: keyword });
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await News.distinct("arrangedCategory");
    const allowedCategories = [
      "the-gioi",
      "thoi-su",
      "kinh-te",
      "khoa-hoc-cong-nghe",
      "xe",
      "suc-khoe-doi-song",
      "the-thao",
      "phap-luat-chinh-tri",
      "giao-duc",
    ];

    const filteredCategories = categories.filter((cat) =>
      allowedCategories.includes(cat)
    );

    res.json(filteredCategories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getNewsByTopic = async (req, res) => {
  try {
    const { topic } = req.query; // Get the category from the query params
    const news = await News.find({ arrangedCategory: topic });
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
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { authors: { $in: [new RegExp(keyword, "i")] } },
      ],
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

exports.getArticlesByCategory = async (req, res) => {
  try {
    const { category } = req.query; // Lấy category từ query params

    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }

    const articles = await News.find({ arrangedCategory: category }); // Tìm kiếm bài viết theo arrangedCategory
    res.status(200).json(articles);
  } catch (error) {
    console.error("Error fetching articles by category:", error);
    res.status(500).json({ message: "Error fetching articles by category" });
  }
};
