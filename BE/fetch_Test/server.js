const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors"); // Thêm module cors

// Tạo ứng dụng Express
const app = express();

// Sử dụng cors để cho phép yêu cầu từ các origin khác
app.use(
  cors({
    origin: "http://localhost:3000", // Cho phép localhost:3000 truy cập
  })
);

// Cổng mà server sẽ lắng nghe
const PORT = 3001;

// URI kết nối MongoDB (cập nhật nếu bạn dùng MongoDB Atlas)
const uri = "mongodb://localhost:27017/rss_feeds";

// Kết nối tới MongoDB bằng Mongoose
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Kết nối thành công tới MongoDB");
  })
  .catch((err) => {
    console.error("Lỗi kết nối MongoDB:", err);
  });

// Định nghĩa một schema (không cần trường cụ thể nếu không rõ cấu trúc)
const rawXmlSchema = new mongoose.Schema({}, { strict: false });

// Tạo model từ schema
const RawXML = mongoose.model("RawXml", rawXmlSchema, "rawxml");

// Định nghĩa route GET /getxmltest
app.get("/getrawxml", async (req, res) => {
  try {
    // Lấy tất cả dữ liệu từ collection xmltest
    const data = await RawXML.find({});
    res.status(200).json(data);
  } catch (err) {
    console.error("Lỗi khi lấy dữ liệu:", err);
    res.status(500).json({ message: "Lỗi khi lấy dữ liệu từ database" });
  }
});

// Định nghĩa route GET /articles/category/:category với sort
app.get("/articles/category/:category", async (req, res) => {
  const category = req.params.category;
  const sortField = req.query.sortField || "pubDate"; // Mặc định sắp xếp theo pubDate
  const sortOrder = req.query.sortOrder === "asc" ? 1 : -1; // asc hoặc desc

  try {
    // Tìm các bài báo và sắp xếp theo trường được chọn
    const articles = await RawXML.find({ articlesCategory: category }).sort({
      [sortField]: sortOrder,
    });

    if (articles.length === 0) {
      return res
        .status(404)
        .json({ message: `Không có bài báo nào thuộc thể loại ${category}` });
    }

    res.status(200).json(articles);
  } catch (err) {
    console.error(`Lỗi khi lấy dữ liệu cho category ${category}:`, err);
    res.status(500).json({ message: "Lỗi khi lấy dữ liệu từ database" });
  }
});

// Bắt đầu server
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
