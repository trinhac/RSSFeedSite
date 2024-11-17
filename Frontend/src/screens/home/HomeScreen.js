import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import "./HomeScreen.css";
import NewsTicker from "./NewsTicker";

const FALLBACK_IMAGE_URL = "https://via.placeholder.com/600x400";

const ErrorMessage = ({ error, onRetry }) => (
  <div className="error">
    <p>{error}</p>
    <button onClick={onRetry}>Retry</button>
  </div>
);

// Updated LoadingSpinner from the old HomeScreen
const LoadingSpinner = () => (
  <div className="loading">
    <ClipLoader color="#3498db" size={50} />
  </div>
);

const handleImageError = (e, url) => {
  console.error(`Failed to load image: ${url}`);
  e.target.src = FALLBACK_IMAGE_URL;
};

const getLogoUrl = (rssUrl) => {
  try {
    const parsedUrl = new URL(rssUrl);
    const hostname = parsedUrl.hostname;

    if (hostname.includes("vnexpress")) {
      return "https://s1.vnecdn.net/vnexpress/restruct/i/v9505/v2_2019/pc/graphics/logo.svg";
    } else if (hostname.includes("thanhnien")) {
      return "https://static.thanhnien.com.vn/thanhnien.vn/image/logo.svg";
    } else if (hostname.includes("nhandan")) {
      return "https://upload.wikimedia.org/wikipedia/vi/d/d7/Logo-NhanDan.png?20221117215128";
    } else {
      return "https://via.placeholder.com/100x50?text=Logo";
    }
  } catch (error) {
    console.error("Invalid URL:", rssUrl, error);
    return "https://via.placeholder.com/100x50?text=Logo";
  }
};

export const MainNewsCard = ({ article }) => (
  <div className="main-news">
    <a href={article.link} target="_blank" rel="noreferrer">
      <img
        src={article.img}
        alt="Main News"
        onError={(e) => handleImageError(e, article.img)}
        className="main-news-image"
      />
      <h2>{article.title}</h2>
      <div className="main-news-info">
        <img
          src={getLogoUrl(article.url)}
          alt="Logo"
          className="main-news-logo"
        />
        <span>{getTimeDifference(article.pubDate)}</span>
      </div>
    </a>
  </div>
);

export const SecondaryNewsSection = ({ articles }) => (
  <div className="secondary-news">
    {articles.map((article, index) => (
      <div key={index} className="secondary-news-card">
        <a href={article.link} target="_blank" rel="noreferrer">
          <img
            src={article.img}
            alt="Secondary News"
            onError={(e) => handleImageError(e, article.img)}
            className="secondary-news-image"
          />
          <h3>{article.title}</h3>
          <div className="secondary-news-info">
            <img
              src={getLogoUrl(article.url)}
              alt="Logo"
              className="secondary-news-logo"
            />
            <span>{getTimeDifference(article.pubDate)}</span>
          </div>
        </a>
      </div>
    ))}
  </div>
);

export const AdditionalNews = ({ articles }) => (
  <div className="additional-news">
    {articles.map((article, index) => (
      <a
        key={index}
        href={article.link}
        target="_blank"
        rel="noreferrer"
        className="additional-news-card"
      >
        <img
          src={article.img}
          alt="Additional News"
          onError={(e) => handleImageError(e, article.img)}
          className="additional-news-image"
        />
        <div className="additional-news-info">
          <h4>{article.title}</h4>
          <div className="additional-news-info-row">
            <img
              src={getLogoUrl(article.url)}
              alt="Logo"
              className="additional-news-logo-1"
            />
            <span>{getTimeDifference(article.pubDate)}</span>
          </div>
        </div>
      </a>
    ))}
  </div>
);

export const AdditionalNews2 = ({ articles }) => (
  <div className="additional-news-second-part">
    {articles.map((article, index) => (
      <a
        key={index}
        href={article.link}
        target="_blank"
        rel="noreferrer"
        className="additional-news-second-part-card"
      >
        <img
          src={article.img}
          alt="Additional News"
          onError={(e) => handleImageError(e, article.img)}
          className="additional-news-second-part-card-img"
        />
        <div className="additional-news-info">
          <h4>{article.title}</h4>
          <div className="additional-news-info-row">
            <img
              src={getLogoUrl(article.url)}
              alt="Logo"
              className="additional-news-logo-2"
            />
            <span>{getTimeDifference(article.pubDate)}</span>
          </div>
        </div>
      </a>
    ))}
  </div>
);

const partners = [
  {
    name: "Thanh Niên",
    logoUrl: "https://static.thanhnien.com.vn/thanhnien.vn/image/logo.svg",
    link: "https://thanhnien.vn/",
  },
  {
    name: "Nhân Dân",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/vi/d/d7/Logo-NhanDan.png?20221117215128",
    link: "https://nhandan.vn/",
  },
  {
    name: "VnExpress",
    logoUrl:
      "https://s1.vnecdn.net/vnexpress/restruct/i/v9505/v2_2019/pc/graphics/logo.svg",
    link: "https://vnexpress.net/",
  },
];

export const PartnersSection = () => {
  return (
    <div className="partners-section">
      <h3>Tổng hợp các báo</h3>
      <div className="partners-container">
        <div className="marquee">
          {partners.map((partner, index) => (
            <a
              key={index}
              href={partner.link}
              target="_blank"
              rel="noreferrer"
              className="partner-card"
            >
              <img
                src={partner.logoUrl}
                alt={partner.name}
                className="partner-logo"
              />
              <span className="partner-name">{partner.name}</span>
            </a>
          ))}
          {/* Lặp lại các phần tử để tạo hiệu ứng cuộn liên tục */}
          {partners.map((partner, index) => (
            <a
              key={`repeat-${index}`}
              href={partner.link}
              target="_blank"
              rel="noreferrer"
              className="partner-card"
            >
              <img
                src={partner.logoUrl}
                alt={partner.name}
                className="partner-logo"
              />
              <span className="partner-name">{partner.name}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
const HomeScreen = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleOverflowCount, setVisibleOverflowCount] = useState(50);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:5000/api/news/all");
      const data = response.data.map((item) => ({
        ...item,
        pubDate: new Date(item.pubDate),
      }));

      const sortedArticles = data.sort((a, b) => b.pubDate - a.pubDate);
      setArticles(sortedArticles);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error.message || "Error loading data.");
    } finally {
      setLoading(false);
    }
  }, []);

  const MainNews = articles[0];
  const TopThreeSecondaryNews = articles.slice(1, 4);
  const AdditionalNewsArticles = articles.slice(4, 12);
  const OverflowNews = articles.slice(12);
  const visibleOverflowNews = OverflowNews.slice(0, visibleOverflowCount);

  const handleLoadMore = () => {
    setVisibleOverflowCount((prevCount) => prevCount + 50);
  };

  return (
    <>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <NewsTicker articles={articles} />
          <div className="home-container">
            {error ? (
              <ErrorMessage error={error} onRetry={fetchArticles} />
            ) : (
              <div className="news-layout">
                <div className="left-column">
                  {MainNews && <MainNewsCard article={MainNews} />}
                  {TopThreeSecondaryNews.length > 0 && (
                    <SecondaryNewsSection articles={TopThreeSecondaryNews} />
                  )}
                  {visibleOverflowNews.length > 0 && (
                    <AdditionalNews2 articles={visibleOverflowNews} />
                  )}
                </div>
                <div className="right-column">
                  {AdditionalNewsArticles.length > 0 && (
                    <AdditionalNews articles={AdditionalNewsArticles} />
                  )}
                  <PartnersSection />
                </div>
              </div>
            )}
          </div>
          <div className="load-more-container">
            {visibleOverflowNews.length < OverflowNews.length && (
              <button className="load-more-button" onClick={handleLoadMore}>
                <span>Xem thêm</span> →
              </button>
            )}
          </div>
        </>
      )}
    </>
  );
};

const getTimeDifference = (pubDate) => {
  const currentTime = new Date();
  const publishedTime = new Date(pubDate);
  const timeDifferenceInMs = currentTime - publishedTime;

  const minutesDifference = Math.floor(timeDifferenceInMs / (1000 * 60));
  const hoursDifference = Math.floor(minutesDifference / 60);
  const daysDifference = Math.floor(hoursDifference / 24);

  if (daysDifference >= 1) return `${daysDifference} days ago`;
  if (hoursDifference >= 1) return `${hoursDifference} hours ago`;
  return `${minutesDifference} minutes ago`;
};

export default HomeScreen;
