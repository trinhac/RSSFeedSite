import fetch from "node-fetch";
import cron from "node-cron";
import { MongoClient } from "mongodb";
import xml2js from "xml2js"; // Still used for parsing and extracting items from the RSS feed
import { decode } from "html-entities";

const uri = process.env.MONGO_URI || "mongodb://localhost:27017";
const client = new MongoClient(uri);

// Function to connect to MongoDB
async function connectToDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB", err);
  }
}

// Function to extract category from the URL (between '/' and '.rss')
function extractCategory(url) {
  const match = url.match(/\/([^\/]+)\.rss$/); // Extract the category from the URL
  return match ? match[1] : "unknown";
}

// Hàm để trích xuất văn bản từ description
function extractTextFromDescription(description) {
  // Sử dụng regex để loại bỏ các thẻ HTML
  const textOnly = description.replace(/<\/?[^>]+(>|$)/g, "");
  // Giải mã các thực thể HTML để có được văn bản thuần túy
  return decode(textOnly).trim();
}

// Function to download the RSS feed and store new items in MongoDB
async function downloadRSS() {
  const rssUrls = [
    // Thế giới
    "https://vnexpress.net/rss/the-gioi.rss",
    "https://thanhnien.vn/rss/the-gioi.rss",
    "https://nhandan.vn/rss/asean-704471.rss",
    // Thời sự
    "https://vnexpress.net/rss/thoi-su.rss",
    "https://thanhnien.vn/rss/thoi-su.rss",
    // Kinh tế
    "https://vnexpress.net/rss/kinh-doanh.rss",
    "https://thanhnien.vn/rss/kinh-te.rss",
    "https://nhandan.vn/rss/kinhte-1185.rss",
    // Khoa học - Công nghệ
    "https://vnexpress.net/rss/khoa-hoc.rss",
    "https://vnexpress.net/rss/so-hoa.rss",
    "https://thanhnien.vn/rss/cong-nghe.rss",
    "https://nhandan.vn/rss/khoahoc-congnghe-1292.rss",
    // Xe
    "https://vnexpress.net/rss/oto-xe-may.rss",
    "https://thanhnien.vn/rss/xe.rss",
    // Sức khỏe - Đời sống
    "https://vnexpress.net/rss/suc-khoe.rss",
    "https://thanhnien.vn/rss/suc-khoe.rss",
    "https://nhandan.vn/rss/bhxh-va-cuoc-song-1222.rss",
    "https://nhandan.vn/rss/y-te-1309.rss",
    // Thể thao
    "https://vnexpress.net/rss/the-thao.rss",
    "https://thanhnien.vn/rss/the-thao.rss",
    "https://nhandan.vn/rss/thethao-1224.rss",
    // Pháp luật - Chính trị
    "https://vnexpress.net/rss/phap-luat.rss",
    "https://nhandan.vn/rss/phapluat-1287.rss",
    "https://nhandan.vn/rss/chinhtri-1171.rss",

    // Giáo dục
    "https://vnexpress.net/rss/giao-duc.rss",
    "https://thanhnien.vn/rss/giao-duc.rss",
    "https://nhandan.vn/rss/giaoduc-1303.rss",
  ];

  try {
    for (const url of rssUrls) {
      const response = await fetch(url);
      const rssText = await response.text();

      const parser = new xml2js.Parser();
      const rssJson = await parser.parseStringPromise(rssText);

      const articles = rssJson.rss.channel[0].item;
      const db = client.db("xml_rss");
      const collection = db.collection("test_json_xml");

      const articlesCategory = extractCategory(url);

      for (const article of articles) {
        const articleGuid = article.guid[0] || article.link[0];
        const exists = await collection.findOne({ guid: articleGuid });

        if (!exists) {
          const title = decode(article.title[0]);
          const pubDate = article.pubDate[0];
          const link = article.link[0];
          const descriptionRaw = article.description[0];

          // Lấy văn bản từ description
          const description = extractTextFromDescription(descriptionRaw);

          // Kiểm tra nếu có thẻ <image>
          const img = article.image ? article.image[0] : null;

          // Nếu không có <image>, tìm URL ảnh trong thẻ <description>
          const imgFallbackMatch = descriptionRaw.match(
            /<img[^>]+src="([^">]+)"/
          );
          const finalImg =
            img || (imgFallbackMatch ? imgFallbackMatch[1] : null);

          // Tạo document chỉ với các thuộc tính cần thiết
          const processedArticle = {
            url,
            guid: articleGuid,
            title,
            description,
            pubDate,
            link,
            img: finalImg || "/default-image.jpg", // Sử dụng ảnh mặc định nếu không tìm thấy
            articlesCategory,
            downloadedAt: new Date(),
          };

          await collection.insertOne(processedArticle);
          console.log(
            `Inserted new article with guid: ${articleGuid} and category: ${articlesCategory}`
          );
        }
      }
    }
  } catch (err) {
    console.error("Error downloading or processing RSS feed", err);
  }
}

// Schedule the task to run every 1 minute (for testing, change to every 6 hours for production)
cron.schedule("*/15 * * * *", () => {
  console.log(
    "Starting RSS feed download task (runs every 15 minute to fetch data)"
  );
  downloadRSS();
});

// Initial run and MongoDB connection
(async () => {
  await connectToDB();
  downloadRSS();
})();
