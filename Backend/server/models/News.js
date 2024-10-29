const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema({
  url: String,
  guid: String,
  articlesCategory: String,
  title: String,
  description: String,
  pubDate: String,
  link: String,
  img: String,
  downloadedAt: Date,
});

module.exports = mongoose.model("News", newsSchema, "test_json_xml");
