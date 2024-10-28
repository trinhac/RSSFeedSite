import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./SearchScreen.css";

const SearchScreen = () => {
  const location = useLocation();
  const searchResults = location.state?.searchResults || [];

  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortedResults, setSortedResults] = useState([]);
  const articlesPerPage = 8;

  // Function to sort articles by date
  const sortArticlesByDate = (articles) => {
    return articles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  };

  // Function to get the logo URL of the source
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
  

  // Function to process each article from JSON data
  const parseArticles = (item) => {
    const title = item.title || "No title";
    const description = item.description || "No description";
    const pubDate = item.pubDate || "No date";
    const link = item.link || "#";
    const imageUrl = item.enclosure?.url || ""; // assumes image URL is in `enclosure`
    const sourceLogo = getLogoUrl(item.link);

    return { title, description, pubDate, imageUrl, link, sourceLogo };
  };

  useEffect(() => {
    const parsedArticles = searchResults.map(parseArticles);
    const sortedArticles = sortArticlesByDate(parsedArticles);
    setSortedResults(sortedArticles);
    setLoading(false);
  }, [searchResults]);

  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = sortedResults.slice(
    indexOfFirstArticle,
    indexOfLastArticle
  );
  const totalPages = Math.ceil(sortedResults.length / articlesPerPage);

  // Pagination functions
  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const firstPage = () => setCurrentPage(1);
  const lastPage = () => setCurrentPage(totalPages);

  // Date formatting function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  // Article list display
  const ArticleList = () => (
    <div className="articles-list">
      {currentArticles.map((result, index) => (
        <div key={index} className="article-item">
          <a href={result.link} target="_blank" rel="noopener noreferrer">
            <div className="article-content">
              <img
                src={result.imageUrl}
                alt={result.title}
                className="article-image"
                onError={(e) => {
                  e.target.src = "/default-image.jpg";
                }}
              />
              <div className="article-text">
                <h2>{result.title}</h2>
                <img
                  src={result.sourceLogo}
                  alt="Logo"
                  className="source-logo"
                />
                <p>{formatDate(result.pubDate)}</p>
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

  // Main SearchScreen component
  return (
    <div className="search-screen">
      <h1>Kết quả tìm kiếm</h1>
      {loading ? (
        <p>Đang tải...</p>
      ) : sortedResults.length === 0 ? (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <p>Không tìm thấy kết quả</p>
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

export default SearchScreen;
