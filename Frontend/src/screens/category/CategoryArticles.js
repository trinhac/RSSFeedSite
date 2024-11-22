import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchCategoryArticles } from "../../redux/category/categorySlice";
import "./CategoryArticles.css";
import { ClipLoader } from "react-spinners";

const CategoryArticles = () => {
  const { category } = useParams();
  const dispatch = useDispatch();
  const { articles, loading, error } = useSelector((state) => state.category);

  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 8;

  const getLogoUrl = (source) => {
    if (/thanhnien\.vn/.test(source)) {
      return "https://static.thanhnien.com.vn/thanhnien.vn/image/logo.svg";
    } else if (/vnexpress\.net/.test(source)) {
      return "https://s1.vnecdn.net/vnexpress/restruct/i/v9505/v2_2019/pc/graphics/logo.svg";
    } else if (/nhandan\.vn/.test(source)) {
      return "https://upload.wikimedia.org/wikipedia/vi/d/d7/Logo-NhanDan.png?20221117215128";
    } else {
      return "";
    }
  };

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
    // Disable scroll restoration to force scroll to top
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    // Scroll to top on component mount or refresh
    window.scrollTo(0, 0);
    dispatch(fetchCategoryArticles(category));
    setCurrentPage(1); // Reset to the first page when the category changes
  }, [category, dispatch]);

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
    window.scrollTo(0, 0); // Scroll to top when navigating to the first page
  };

  const lastPage = () => {
    setCurrentPage(totalPages);
    window.scrollTo(0, 0); // Scroll to top when navigating to the last page
  };

  const ArticleList = () => (
    <div className="articles-list">
      {currentArticles.map((article, index) => (
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
                <img
                  src={getLogoUrl(article.url)}
                  alt="Logo"
                  className="source-logo"
                />
                <p>{formatDate(article.pubDate)}</p>
              </div>
            </div>
          </a>
        </div>
      ))}
    </div>
  );

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
    <div className="search-screen">
      <h1>Danh mục: {getDisplayCategoryName(category)}</h1>
      {loading ? (
        <div className="loading">
          <ClipLoader color="#3498db" size={50} />
        </div>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : articles.length === 0 ? (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <p>No articles found for this category.</p>
        </div>
      ) : (
        <>
          <ArticleList />
          <Pagination />
        </>
      )}
    </div>
  );
};

export default CategoryArticles;
