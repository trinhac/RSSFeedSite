const mongoose = require("mongoose");

const categorizedKeywordsSchema = new mongoose.Schema({
  category: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  keywords: [
    {
      keyword: { type: String, required: true },
      count: { type: Number, required: true },
    },
  ],
});

const CategorizedKeywords = mongoose.model("CategorizedKeywords", categorizedKeywordsSchema);

module.exports = CategorizedKeywords;