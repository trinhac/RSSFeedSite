// HomeScreen.js
import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import he from "he";
import "./HomeScreen.css";

// Component: ErrorMessage
const ErrorMessage = React.memo(({ error, onRetry }) => (
  <div className="error">
    <p>Đã xảy ra lỗi: {error}</p>
    <button onClick={onRetry}>Thử lại</button>
  </div>
));

// Component: LoadingSpinner
const LoadingSpinner = () => (
  <div className="loading">
    <ClipLoader color="#3498db" size={50} />
  </div>
);

// Component: NewsCard
const NewsCard = React.memo(({ article, logoUrl, timeDifference }) => (
  <div className="list-card">
    <a href={article.link} target="_blank" rel="noreferrer">
      <div className="card-image">
        <img
          src={article.imageUrl}
          alt="Article"
          onError={(e) => (e.target.src = "/default-image.jpg")}
        />
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
));

// Component: NewsList
const NewsList = React.memo(
  ({ title, source, url, articles, page, onPageChange, logoUrl }) => {
    const displayedArticles = useMemo(
      () =>
        articles.slice(
          (page - 1) * determineArticlesPerPage(),
          page * determineArticlesPerPage()
        ),
      [articles, page]
    );

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
                timeDifference={getTimeDifference(article.pubDate)}
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
  }
);

// Utility to get time difference
// Utility function to get time difference in a human-readable format
const getTimeDifference = (pubDate) => {
  const currentTime = new Date();
  const publishedTime = new Date(pubDate);
  const timeDifferenceInMs = currentTime - publishedTime;
  
  const minutesDifference = Math.floor(timeDifferenceInMs / (1000 * 60));
  const hoursDifference = Math.floor(minutesDifference / 60);
  const daysDifference = Math.floor(hoursDifference / 24);
  const monthsDifference = Math.floor(daysDifference / 30); // Approximate months
  const yearsDifference = Math.floor(monthsDifference / 12);

  if (yearsDifference >= 1) {
    return `${yearsDifference} năm trước`;
  } else if (monthsDifference >= 1) {
    return `${monthsDifference} tháng trước`;
  } else if (daysDifference >= 1) {
    return `${daysDifference} ngày trước`;
  } else if (hoursDifference >= 1) {
    return `${hoursDifference} giờ trước`;
  } else {
    return `${minutesDifference} phút trước`;
  }
};


// Calculate articles per page once
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



const fetchArticles = useCallback(async () => {
  setLoading(true);
  setError(null);
  try {
    const response = await axios.get("http://localhost:5000/api/news/all");
    const data = response.data;

    const parsedArticles = data.reduce(
      (acc, item) => {
        const { title, description, pubDate, link, enclosure, url } = item;
        
        // Decode HTML entities in title and description
        const decodedTitle = he.decode(title);
        const decodedDescription = he.decode(description);
        const imageUrl = enclosure?.url || "/default-image.jpg"; // Default if no image URL

        if (url.includes("thanhnien.vn")) {
          acc.thanhNien.push({ title: decodedTitle, description: decodedDescription, pubDate, imageUrl, link });
        } else if (url.includes("vnexpress.net")) {
          acc.vnExpress.push({ title: decodedTitle, description: decodedDescription, pubDate, imageUrl, link });
        } else if (url.includes("nhandan.vn")) {
          acc.nhanDan.push({ title: decodedTitle, description: decodedDescription, pubDate, imageUrl, link });
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
}, []);


  const sortArticlesByDate = useCallback(
    (articles) => articles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate)),
    []
  );

  const handlePageChange = useCallback(
    (source, newPage) =>
      setPage((prev) => ({ ...prev, [source]: newPage })),
    []
  );

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
