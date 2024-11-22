const express = require("express");
const router = express.Router();
const newsController = require("../controllers/newsController");

// New category route
router.get("/category", newsController.getNewsByTopic);
router.get("/news/topic", newsController.getNewsByTopic);
// Existing routes
router.get("/news/date", newsController.getNewsByDate);
router.get("/news/topic", newsController.getNewsByTopic);
router.get("/news/keyword", newsController.getNewsByKeyword);
router.get("/news/all", newsController.getAllArticles);
router.get("/search", newsController.searchNews);
router.get("/articles-by-category", newsController.getArticlesByCategory);
module.exports = router;
