const News = require("../models/News");

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
