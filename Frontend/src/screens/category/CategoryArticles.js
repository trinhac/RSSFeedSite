import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  fetchCategoryArticles,
  fetchArticlesByTopKeywords,
} from "../../redux/category/categorySlice";
import "./CategoryArticles.css";
import { ClipLoader } from "react-spinners";
import ThemeToggle from "../../components/themetoggle/ThemeToggle";
import ScrollToTop from "../../components/scrolltop/ScrollToTop";

const CategoryArticles = () => {
  const { category } = useParams();
  const dispatch = useDispatch();
  const { articles, topKeywordArticles, loading, error } = useSelector(
    (state) => state.category
  );

  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 8;

  // Mapping category to display names
  const getDisplayCategoryName = (category) => {
    const categoryMapping = {
      "the-gioi": "Thế giới",
      "thoi-su": "Thời sự",
      "kinh-te": "Kinh tế",
      "giai-tri": "Giải trí",
      "the-thao": "Thể thao",
      "phap-luat-chinh-tri": "Pháp luật - Chính trị",
      "giao-duc": "Giáo dục",
      "suc-khoe-doi-song": "Sức khỏe - Đời sống",
      "du-lich": "Du lịch",
      "khoa-hoc-cong-nghe": "Khoa học - Công nghệ",
      xe: "Xe",
      "van-hoa": "Văn hóa",
      "doi-song": "Đời sống",
    };

    return categoryMapping[category] || "Không xác định";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength)}...`;
  };

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
    dispatch(fetchCategoryArticles(category));
    dispatch(fetchArticlesByTopKeywords(category));
    setCurrentPage(1); // Reset to the first page when category changes
  }, [category, dispatch]);

  // Pagination logic
  const sortedArticles = articles || [];
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = sortedArticles.slice(
    indexOfFirstArticle,
    indexOfLastArticle
  );
  const totalPages = Math.ceil(sortedArticles.length / articlesPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    window.scrollTo(0, 0);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
    window.scrollTo(0, 0);
  };

  const firstPage = () => {
    setCurrentPage(1);
    window.scrollTo(0, 0);
  };

  const lastPage = () => {
    setCurrentPage(totalPages);
    window.scrollTo(0, 0);
  };

  // Article list component
  const TrendingArticleList = ({ articles }) => (
    <div className="articles-list">
      {articles.map((article, index) => (
        <div key={index} className="article-item">
          <a href={article.link} target="_blank" rel="noopener noreferrer">
            <div className="article-content">
              <img
                src={article.img || "/default-image.jpg"}
                alt={article.title}
                className="article-image"
                onError={(e) => {
                  e.target.src = "/default-image.jpg";
                }}
              />
              <div className="article-text">
                <h2>{article.title}</h2>
                <p className="article-keyword">
                  Từ khóa: <strong>{article.keyword}</strong>
                </p>
                <p>{truncateText(article.description, 150)}</p>
                <p>{formatDate(article.pubDate)}</p>
              </div>
            </div>
          </a>
        </div>
      ))}
    </div>
  );

  const ArticleList = ({ articles }) => (
    <div className="articles-list">
      {articles.map((article, index) => (
        <div key={index} className="article-item">
          <a href={article.link} target="_blank" rel="noopener noreferrer">
            <div className="article-content">
              <img
                src={article.img || "/default-image.jpg"}
                alt={article.title}
                className="article-image"
                onError={(e) => {
                  e.target.src = "/default-image.jpg";
                }}
              />
              <div className="article-text">
                <h2>{article.title}</h2>

                <p>{truncateText(article.description, 150)}</p>
                <p>{formatDate(article.pubDate)}</p>
              </div>
            </div>
          </a>
        </div>
      ))}
    </div>
  );

  // Pagination component
  const Pagination = () => (
    <div className="pagination">
      <button onClick={firstPage} disabled={currentPage === 1}>
        Trang đầu
      </button>
      <button onClick={prevPage} disabled={currentPage === 1}>
        Trang trước
      </button>
      <span>
        Trang {currentPage} / {totalPages}
      </span>
      <button onClick={nextPage} disabled={currentPage === totalPages}>
        Trang sau
      </button>
      <button onClick={lastPage} disabled={currentPage === totalPages}>
        Trang cuối
      </button>
    </div>
  );

  return (
    <div className="category-screen">
      <h1 className="category-name">Danh mục: {getDisplayCategoryName(category)}</h1>
      {loading ? (
        <div className="loading">
          <ClipLoader color="#3498db" size={50} />
        </div>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : articles.length === 0 && topKeywordArticles.length === 0 ? (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <p>No articles found for this category.</p>
        </div>
      ) : (
        <>
          <h2 className="trending-articles-section">Bài viết liên quan tới top 5 từ khóa</h2>
          <TrendingArticleList articles={topKeywordArticles} />
          <h2 className="normal-articles-section">Bài viết gần đây</h2>
          <ArticleList articles={currentArticles} />
          <Pagination />
          <ThemeToggle />
          <ScrollToTop />
        </>
      )}
    </div>
  );
};

export default CategoryArticles;
