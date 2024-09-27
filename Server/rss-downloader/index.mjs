// import fetch from 'node-fetch'; // Use import instead of require
// import cron from 'node-cron';
// import { MongoClient } from 'mongodb';
// import xml2js from 'xml2js';

// // MongoDB URI setup
// const uri = process.env.MONGO_URI || "mongodb://localhost:27017";
// const client = new MongoClient(uri);

// // Function to connect to MongoDB
// async function connectToDB() {
//   try {
//     await client.connect();
//     console.log("Connected to MongoDB");
//   } catch (err) {
//     console.error("Error connecting to MongoDB", err);
//   }
// }

// // Function to download, parse RSS feed and store in MongoDB
// async function downloadRSS() {
//   const rssUrls = "https://vnexpress.net/rss/the-gioi.rss";
  
//   try {
//     for (const url of rssUrls) {
//       const response = await fetch(url);  // Fetch RSS feed URL
//       const rssText = await response.text();

//       const parser = new xml2js.Parser(); // Parse XML to JSON
//       const rssJson = await parser.parseStringPromise(rssText);

//       console.log(`RSS feed downloaded and parsed from: ${url}`);

//       // Extract articles from parsed RSS
//       const articles = rssJson.rss.channel[0].item.map((item) => {
//         return {
//           title: item.title[0],
//           link: item.link[0],
//           pubDate: new Date(item.pubDate[0]),  // Convert to Date
//           description: item.description[0],
//         };
//       });

//       const db = client.db("rss_feeds");  // Use your database
//       const collection = db.collection("articles");

//       for (const article of articles) {
//         // Check if the article exists by unique 'link'
//         const exists = await collection.findOne({ link: article.link });

//         if (!exists) {
//           await collection.insertOne(article);
//           console.log(`Inserted new article: ${article.title}`);
//         } else {
//           console.log(`Article already exists: ${article.title}`);
//         }
//       }
//     }
//   } catch (err) {
//     console.error("Error downloading or processing RSS feed", err);
//   }
// }

// // Function to download the raw XML RSS and store in MongoDB
// async function downloadXMLRSS() {
//   const rssUrls = ["https://vnexpress.net/rss/the-gioi.rss"];

//   try {
//     for (const url of rssUrls) {
//       const response = await fetch(url);
//       const rssText = await response.text(); // Get raw XML as text

//       console.log(`Raw XML feed downloaded from: ${url}`);

//       // Store raw XML in MongoDB
//       const db = client.db("rss_feeds");
//       const collection = db.collection("xml_articles");

//       const XMLArticle = {
//         url,
//         content: rssText,
//         downloadedAt: new Date()
//       };

//       // Insert raw XML into MongoDB
//       await collection.insertOne(XMLArticle);
//       console.log(`Inserted raw XML from ${url}`);
//     }
//   } catch (err) {
//     console.error("Error downloading or processing raw XML RSS feed", err);
//   }
// }

// // Schedule the task to run every 1 minute (for testing, change to every 6 hours for production)
// cron.schedule('* * * * *', () => {
//   console.log("Starting RSS feed download task (runs every minute for testing)");
//   downloadRSS();
//   downloadXMLRSS();
// });

// // Initial run and MongoDB connection
// (async () => {
//   await connectToDB();
//   downloadRSS();
//   downloadXMLRSS();
// })();



import fetch from 'node-fetch';
import cron from 'node-cron';
import { MongoClient } from 'mongodb';
import xml2js from 'xml2js';

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

// Function to download, parse RSS feed, and store in MongoDB only if not existing
async function downloadRSS() {
  const rssUrls = ["https://vnexpress.net/rss/the-gioi.rss"];
  
  try {
    for (const url of rssUrls) {
      const response = await fetch(url);
      const rssText = await response.text();

      const parser = new xml2js.Parser();
      const rssJson = await parser.parseStringPromise(rssText);

      console.log(`RSS feed downloaded and parsed from: ${url}`);

      const articles = rssJson.rss.channel[0].item.map((item) => {
        return {
          title: item.title[0],
          link: item.link[0],
          guid: item.guid[0],  // Use 'guid' to identify the item uniquely
          pubDate: new Date(item.pubDate[0]),  // Convert to Date for easy comparison
          description: item.description[0],
          image: item.enclosure ? item.enclosure[0].$.url : null  // Check if enclosure exists
        };
      });

      const db = client.db("rss_feeds");
      const collection = db.collection("articles");

      for (const article of articles) {
        // Check if the article already exists by its unique 'guid'
        const exists = await collection.findOne({ guid: article.guid });

        if (!exists) {
          // Insert only if it doesn't exist
          await collection.insertOne(article);
          console.log(`Inserted new article: ${article.title}`);
        } else {
          console.log(`Article already exists: ${article.title}`);
        }
      }
    }
  } catch (err) {
    console.error("Error downloading or processing RSS feed", err);
  }
}

// Schedule the task to run every 1 minute (for testing, change to every 6 hours for production)
cron.schedule('* * * * *', () => {
  console.log("Starting RSS feed download task (runs every minute for testing)");
  downloadRSS();
});

// Initial run and MongoDB connection
(async () => {
  await connectToDB();
  downloadRSS();
})();
