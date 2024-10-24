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

app.get("/search", async (req, res) => {
  try {
    const keyword = req.query.q; // Lấy từ khóa từ query string (ví dụ: /search?q=ukraine)

    if (!keyword) {
      return res.status(400).json({ message: "Thiếu từ khóa tìm kiếm" });
    }

    // Tìm kiếm trong content của title với từ khóa không phân biệt hoa thường
    const results = await RawXML.find({
      content: {
        $regex: `<title>.*${keyword}.*</title>`,
        $options: "i", // Không phân biệt chữ hoa/thường
      },
    });

    // Trả về toàn bộ các đối tượng có title chứa từ khóa
    res.status(200).json(results);
  } catch (err) {
    console.error("Lỗi khi tìm kiếm:", err);
    res.status(500).json({ message: "Lỗi khi tìm kiếm dữ liệu" });
  }
});

// Bắt đầu server
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
