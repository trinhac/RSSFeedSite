const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  url: String,
  guid: String,
  articlesCategory: String,
  title: String,
  description: String,
  pubDate: String,
  link: String,
  enclosure: Object,
  authors: [String],
  convertedAt: Date
});

module.exports = mongoose.model('News', newsSchema, 'test_json_xml');
