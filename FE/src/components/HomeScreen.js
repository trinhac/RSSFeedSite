import React, { useEffect, useState } from "react";
import axios from "axios";
import he from "he";
import "./HomeScreen.css";

const HomeScreen = () => {
  const [articles, setArticles] = useState({
    thanhNien: [],
    vnExpress: [],
    nhanDan: [],
  });

  const [page, setPage] = useState({
    thanhNien: 1,
    vnExpress: 1,
    nhanDan: 1,
  });

  const articlesPerPage = 7;

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await axios.get("http://localhost:3001/getrawxml");
      const data = response.data;
      const parser = new DOMParser();

      const parsedArticles = data.reduce(
        (acc, item) => {
          const xmlDoc = parser.parseFromString(item.content, "text/xml");
          const titleRaw =
            xmlDoc.getElementsByTagName("title")[0]?.textContent || "No title";
          const descriptionRaw =
            xmlDoc.getElementsByTagName("description")[0]?.textContent ||
            "No description";
          const pubDate =
            xmlDoc.getElementsByTagName("pubDate")[0]?.textContent || "No date";
          const title = he.decode(titleRaw);
          const description = he.decode(descriptionRaw);
          const link =
            xmlDoc.getElementsByTagName("link")[0]?.textContent || "#";

          let imageUrl = "";

          if (item.url.includes("thanhnien.vn")) {
            const imgMatch = description.match(/<img[^>]+src="([^">]+)"/);
            imageUrl = imgMatch ? imgMatch[1] : "";
            acc.thanhNien.push({ title, description, pubDate, imageUrl, link });
          } else if (item.url.includes("vnexpress.net")) {
            const enclosureTag = xmlDoc.getElementsByTagName("enclosure")[0];
            imageUrl = enclosureTag ? enclosureTag.getAttribute("url") : "";
            acc.vnExpress.push({ title, description, pubDate, imageUrl, link });
          } else if (item.url.includes("nhandan.vn")) {
            const thumbTag = xmlDoc.getElementsByTagName("thumb")[0];
            imageUrl = thumbTag ? thumbTag.textContent : "";
            acc.nhanDan.push({ title, description, pubDate, imageUrl, link });
          }

          return acc;
        },
        { thanhNien: [], vnExpress: [], nhanDan: [] }
      );

      // Sắp xếp các bài báo theo thứ tự giảm dần của pubDate
      parsedArticles.thanhNien = sortArticlesByDate(parsedArticles.thanhNien);
      parsedArticles.vnExpress = sortArticlesByDate(parsedArticles.vnExpress);
      parsedArticles.nhanDan = sortArticlesByDate(parsedArticles.nhanDan);

      setArticles(parsedArticles);
    } catch (error) {
      console.error(error);
    }
  };

  const sortArticlesByDate = (articles) => {
    return articles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  };

  const handleNextPage = (source) => {
    if (page[source] * articlesPerPage < articles[source].length) {
      setPage((prevState) => ({
        ...prevState,
        [source]: prevState[source] + 1,
      }));
    }
  };

  const handlePrevPage = (source) => {
    if (page[source] > 1) {
      setPage((prevState) => ({
        ...prevState,
        [source]: prevState[source] - 1,
      }));
    }
  };

  const displayedArticles = (source) =>
    articles[source].slice(
      (page[source] - 1) * articlesPerPage,
      page[source] * articlesPerPage
    );

  const getTimeDifference = (pubDate) => {
    const currentTime = new Date(); // Thời gian hiện tại
    const publishedTime = new Date(pubDate); // Chuyển đổi pubDate thành đối tượng Date

    // Tính toán sự chênh lệch thời gian theo milliseconds
    const timeDifference = currentTime - publishedTime;

    // Chuyển đổi từ milliseconds sang phút và giờ
    const minutesDifference = Math.floor(timeDifference / (1000 * 60));
    const hoursDifference = Math.floor(timeDifference / (1000 * 60 * 60));

    // Kiểm tra nếu chênh lệch dưới 1 giờ thì hiển thị phút, ngược lại hiển thị giờ
    if (hoursDifference < 1) {
      return `${minutesDifference} phút trước`;
    } else {
      return `${hoursDifference} giờ trước`;
    }
  };

  const NewsList = ({ title, source, url }) => (
    <section className="list">
      <a href={url}>
        <h2>{title}</h2>
      </a>
      <div className="list-container">
        <button
          className="prev-btn"
          onClick={() => handlePrevPage(source)}
          disabled={page[source] === 1}
        >
          &lt;
        </button>
        <div className="list-grid">
          {displayedArticles(source).map((article, index) => (
            <div key={index} className="list-card">
              <a href={article.link} target="_blank" rel="noreferrer">
                <div className="card-image">
                  <img src={article.imageUrl} alt="Article" />
                </div>
                <div className="card-info">
                  <h3>{article.title}</h3>
                  <span>{getTimeDifference(article.pubDate)}</span>
                </div>
              </a>
            </div>
          ))}
        </div>
        <button
          className="next-btn"
          onClick={() => handleNextPage(source)}
          disabled={page[source] * articlesPerPage >= articles[source].length}
        >
          &gt;
        </button>
      </div>
    </section>
  );

  return (
    <div className="home-container">
      <header className="header">
        <h1>Diễn Đàn Tin Tức Việt Nam</h1>
        <nav className="nav">
          <ul>
            <li>Thời sự</li>
            <li>Kinh tế</li>
            <li>Y tế</li>
            <li>Pháp luật</li>
            <li>Đời sống</li>
            <li>Xã hội</li>
            <li>Giáo dục</li>
            <li>Du lịch</li>
          </ul>
        </nav>
        <div className="search-bar">
          <input type="text" placeholder="Search..." />
        </div>
      </header>

      <NewsList
        title="Báo Thanh Niên"
        source="thanhNien"
        url="https://thanhnien.vn/"
      />
      <NewsList
        title="Báo VnExpress"
        source="vnExpress"
        url="https://vnexpress.net/"
      />
      <NewsList
        title="Báo Nhân Dân"
        source="nhanDan"
        url="https://nhandan.vn/"
      />
    </div>
  );
};

export default HomeScreen;
