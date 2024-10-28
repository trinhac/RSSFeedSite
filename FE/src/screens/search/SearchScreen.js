import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import he from "he";
import "./SearchScreen.css";

const SearchScreen = () => {
  const location = useLocation();
  const searchResults = location.state?.searchResults || [];
  const parser = new DOMParser();

  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortedResults, setSortedResults] = useState([]);
  const articlesPerPage = 8;

  // Hàm con để sắp xếp các bài viết theo ngày
  const sortArticlesByDate = (articles) => {
    return articles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  };

  // Hàm con để lấy URL của logo nguồn tin
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

  // Hàm con để xử lý và phân tích nội dung từng bài viết
  const parseArticles = (item) => {
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
    const link = xmlDoc.getElementsByTagName("link")[0]?.textContent || "#";

    let imageUrl = "";
    let sourceLogo = "";

    if (item.url.includes("thanhnien.vn")) {
      const imgMatch = description.match(/<img[^>]+src="([^">]+)"/);
      imageUrl = imgMatch ? imgMatch[1] : "";
      sourceLogo = getLogoUrl("thanhNien");
    } else if (item.url.includes("vnexpress.net")) {
      const enclosureTag = xmlDoc.getElementsByTagName("enclosure")[0];
      imageUrl = enclosureTag ? enclosureTag.getAttribute("url") : "";
      sourceLogo = getLogoUrl("vnExpress");
    } else if (item.url.includes("nhandan.vn")) {
      const thumbTag = xmlDoc.getElementsByTagName("thumb")[0];
      imageUrl = thumbTag ? thumbTag.textContent : "";
      sourceLogo = getLogoUrl("nhanDan");
    }

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

  // Hàm con để điều hướng qua trang kế tiếp
  const nextPage = () => {
    if (currentPage < Math.ceil(sortedResults.length / articlesPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Hàm con để điều hướng qua trang trước
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Hàm con để điều hướng qua trang đầu
  const firstPage = () => {
    setCurrentPage(1);
  };
  // Hàm con để điều hướng qua trang cuối
  const lastPage = () => {
    setCurrentPage(totalPages);
  };

  // Hàm con để định dạng ngày
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  // Hàm con để hiển thị danh sách bài viết
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

  // Hàm con để hiển thị thanh phân trang
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

  // Trả về component `SearchScreen` chính với các hàm con đã tạo
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
