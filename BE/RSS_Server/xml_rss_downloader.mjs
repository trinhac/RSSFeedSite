import fetch from "node-fetch";
import cron from "node-cron";
import { MongoClient } from "mongodb";
import xml2js from "xml2js"; // Still used for parsing and extracting items from the RSS feed

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

// Function to download the RSS feed and store new items in MongoDB
async function downloadRSS() {
  const rssUrls = [
    // VnExpress
    "https://vnexpress.net/rss/the-gioi.rss",
    "https://vnexpress.net/rss/thoi-su.rss",
    "https://vnexpress.net/rss/kinh-doanh.rss",
    "https://vnexpress.net/rss/khoa-hoc.rss",
    "https://vnexpress.net/rss/so-hoa.rss",
    "https://vnexpress.net/rss/oto-xe-may.rss",
    "https://vnexpress.net/rss/suc-khoe.rss",
    "https://vnexpress.net/rss/the-thao.rss",
    "https://vnexpress.net/rss/phap-luat.rss",
    "https://vnexpress.net/rss/giao-duc.rss",
    //Nhandan
    "https://nhandan.vn/rss/chinhtri-1171.rss",
    "https://nhandan.vn/rss/bhxh-va-cuoc-song-1222.rss",
    "https://nhandan.vn/rss/giaoduc-1303.rss",
    "https://nhandan.vn/rss/thethao-1224.rss",
    "https://nhandan.vn/rss/y-te-1309.rss",
    "https://nhandan.vn/rss/khoahoc-congnghe-1292.rss",
    "https://nhandan.vn/rss/factcheck-658978.rss",
    "https://nhandan.vn/rss/asean-704471.rss",
    "https://nhandan.vn/rss/phapluat-1287.rss",
    "https://nhandan.vn/rss/kinhte-1185.rss",
    "https://nhandan.vn/rss/moi-truong-1296.rss",

    //Thanhnien
    "https://thanhnien.vn/rss/kinh-te.rss",
    "https://thanhnien.vn/rss/xe.rss",
    "https://thanhnien.vn/rss/cong-nghe.rss",
    "https://thanhnien.vn/rss/the-thao.rss",
    "https://thanhnien.vn/rss/giao-duc.rss",
    "https://thanhnien.vn/rss/the-gioi.rss",
    "https://thanhnien.vn/rss/thoi-su.rss",
    "https://thanhnien.vn/rss/suc-khoe.rss",
  ];

  try {
    for (const url of rssUrls) {
      const response = await fetch(url);
      const rssText = await response.text(); // Fetch the raw XML text

      // Parse the RSS feed to get each <item> tag
      const parser = new xml2js.Parser();
      const rssJson = await parser.parseStringPromise(rssText);

      const articles = rssJson.rss.channel[0].item; // Extract all items (articles)
      const db = client.db("rss_feeds");
      const collection = db.collection("rawxml"); // Collection to store raw XML for each item

      // Extract the category from the RSS URL
      const articlesCategory = extractCategory(url);

      // Loop through each article (item)
      for (const article of articles) {
        const articleGuid = article.guid[0] || article.link[0]; // Use 'guid' or 'link' as the unique identifier

        // Check if the article already exists in MongoDB by its 'guid' or 'link'
        const exists = await collection.findOne({ guid: articleGuid });

        if (!exists) {
          // Extract the raw XML for this item
          const articleXML = new xml2js.Builder().buildObject({
            item: article,
          });

          // Insert the raw XML of the new article into MongoDB
          const XMLArticle = {
            url, // The RSS URL
            content: articleXML, // Store the raw XML of this <item>
            guid: articleGuid, // Store the unique identifier
            articlesCategory, // Store the category extracted from the RSS URL
            downloadedAt: new Date(), // Timestamp of download
          };

          await collection.insertOne(XMLArticle);
          console.log(
            `Inserted new raw XML for article with guid: ${articleGuid} and category: ${articlesCategory}`
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

// // Laodong
// "https://laodong.vn/rss/thoi-su.rss",
// "https://laodong.vn/rss/the-gioi.rss",
// "https://laodong.vn/rss/phap-luat.rss",
// "https://laodong.vn/rss/the-thao.rss",
// "https://laodong.vn/rss/xe.rss",
// "https://laodong.vn/rss/suc-khoe.rss",
// "https://laodong.vn/rss/xa-hoi.rss",
// "https://laodong.vn/rss/kinh-doanh.rss",

// //Tuoitre
// "https://tuoitre.vn/rss/thoi-su.rss",
// "https://tuoitre.vn/rss/the-gioi.rss",
// "https://tuoitre.vn/rss/xe.rss",
// "https://tuoitre.vn/rss/nhip-song-so.rss",
// "https://tuoitre.vn/rss/the-thao.rss",
// "https://tuoitre.vn/rss/khoa-hoc.rss",
// "https://tuoitre.vn/rss/suc-khoe.rss",
// "https://tuoitre.vn/rss/phap-luat.rss",
