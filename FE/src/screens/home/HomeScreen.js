// HomeScreen.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import he from "he";
import { ClipLoader } from "react-spinners";
import "./HomeScreen.css";

// Component: Hiển thị thông báo lỗi và nút thử lại
const ErrorMessage = ({ error, onRetry }) => (
  <div className="error">
    <p>Đã xảy ra lỗi: {error}</p>
    <button onClick={onRetry}>Thử lại</button>
  </div>
);

// Component: Hiển thị loader khi đang tải dữ liệu
const LoadingSpinner = () => (
  <div className="loading">
    <ClipLoader color="#3498db" size={50} />
  </div>
);

// Component: Hiển thị bài viết
const NewsCard = ({ article, logoUrl, timeDifference }) => (
  <div className="list-card">
    <a href={article.link} target="_blank" rel="noreferrer">
      <div className="card-image">
        <img src={article.imageUrl} alt="Article" />
      </div>
      <div className="card-info">
        <div className="card-info-h3">
          <h3>{article.title}</h3>
        </div>
        <div className="card-info-footer">
          <img src={logoUrl} alt="Logo" className="article-logo" />
          <span>{timeDifference}</span>
        </div>
      </div>
    </a>
  </div>
);

// Component: Hiển thị danh sách các bài viết từ từng nguồn báo
// HomeScreen.js
const NewsList = ({
  title,
  source,
  url,
  articles,
  page,
  onPageChange,
  logoUrl,
}) => {
  const displayedArticles = articles.slice(
    (page - 1) * determineArticlesPerPage(),
    page * determineArticlesPerPage()
  );

  // Định nghĩa hàm getTimeDifference trong phạm vi của NewsList
  const getTimeDifference = (pubDate) => {
    const currentTime = new Date();
    const publishedTime = new Date(pubDate);
    const minutesDifference = Math.floor(
      (currentTime - publishedTime) / (1000 * 60)
    );
    const hoursDifference = Math.floor(minutesDifference / 60);
    return hoursDifference < 1
      ? `${minutesDifference} phút trước`
      : `${hoursDifference} giờ trước`;
  };

  return (
    <section className="list">
      <a href={url}>
        <h2>{title}</h2>
      </a>
      <div className="list-container">
        <button
          className="prev-btn"
          onClick={() => onPageChange(source, page - 1)}
          disabled={page === 1}
        >
          &lt;
        </button>
        <div className="list-grid">
          {displayedArticles.map((article, index) => (
            <NewsCard
              key={index}
              article={article}
              logoUrl={logoUrl}
              timeDifference={getTimeDifference(article.pubDate)} // Sử dụng hàm getTimeDifference ở đây
            />
          ))}
        </div>
        <button
          className="next-btn"
          onClick={() => onPageChange(source, page + 1)}
          disabled={page * determineArticlesPerPage() >= articles.length}
        >
          &gt;
        </button>
      </div>
    </section>
  );
};

// Xác định số lượng bài báo mỗi trang dựa trên kích thước màn hình
const determineArticlesPerPage = () => {
  const width = window.innerWidth;
  if (width >= 1600) return 5;
  if (width >= 900) return 4;
  if (width >= 768) return 2;
  return 1;
};

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:3001/getrawxml");
      const data = response.data;
      const parser = new DOMParser();

      const parsedArticles = data.reduce(
        (acc, item) => {
          const xmlDoc = parser.parseFromString(item.content, "text/xml");
          const title = he.decode(
            xmlDoc.getElementsByTagName("title")[0]?.textContent || "No title"
          );
          const description = he.decode(
            xmlDoc.getElementsByTagName("description")[0]?.textContent ||
              "No description"
          );
          const pubDate =
            xmlDoc.getElementsByTagName("pubDate")[0]?.textContent || "No date";
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

      setArticles({
        thanhNien: sortArticlesByDate(parsedArticles.thanhNien),
        vnExpress: sortArticlesByDate(parsedArticles.vnExpress),
        nhanDan: sortArticlesByDate(parsedArticles.nhanDan),
      });
    } catch (error) {
      setError(error.message || "Đã xảy ra lỗi khi tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  const sortArticlesByDate = (articles) =>
    articles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  const handlePageChange = (source, newPage) =>
    setPage((prev) => ({ ...prev, [source]: newPage }));

  const getLogoUrl = (source) => {
    switch (source) {
      case "thanhNien":
        return "https://static.thanhnien.com.vn/thanhnien.vn/image/logo.svg";
      case "vnExpress":
        return "https://s1.vnecdn.net/vnexpress/restruct/i/v9505/v2_2019/pc/graphics/logo.svg";
      case "nhanDan":
        return "https://upload.wikimedia.org/wikipedia/vi/d/d7/Logo-NhanDan.png?20221117215128";
      default:
        return "";
    }
  };

  return (
    <div className="home-container">
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage error={error} onRetry={fetchArticles} />
      ) : (
        <>
          <NewsList
            title="Báo Thanh Niên"
            source="thanhNien"
            url="https://thanhnien.vn/"
            articles={articles.thanhNien}
            page={page.thanhNien}
            onPageChange={handlePageChange}
            logoUrl={getLogoUrl("thanhNien")}
          />
          <NewsList
            title="Báo VnExpress"
            source="vnExpress"
            url="https://vnexpress.net/"
            articles={articles.vnExpress}
            page={page.vnExpress}
            onPageChange={handlePageChange}
            logoUrl={getLogoUrl("vnExpress")}
          />
          <NewsList
            title="Báo Nhân Dân"
            source="nhanDan"
            url="https://nhandan.vn/"
            articles={articles.nhanDan}
            page={page.nhanDan}
            onPageChange={handlePageChange}
            logoUrl={getLogoUrl("nhanDan")}
          />
        </>
      )}
    </div>
  );
};

export default HomeScreen;
