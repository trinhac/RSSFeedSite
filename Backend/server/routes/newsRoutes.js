const express = require("express");
const router = express.Router();
const newsController = require("../controllers/newsController");

router.get("/category", newsController.getNewsByCategory);
router.get("/news/all", newsController.getAllArticles);
router.get("/search", newsController.searchNews);
router.get("/all/categories", newsController.getCategories);
router.get("/trending-keywords", newsController.getTrendingKeywords);
router.get("/top-10-keywords", newsController.getTop10Keywords);
router.get("/keywords-by-time", newsController.getKeywordsByTime);

module.exports = router;
