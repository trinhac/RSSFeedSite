import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import he from "he"; // Import thư viện he để giải mã
import "./SearchScreen.css";

const SearchScreen = () => {
  const location = useLocation();
  const searchResults = location.state?.searchResults || [];
  const parser = new DOMParser(); // Khởi tạo DOMParser

  // Các trạng thái quản lý loading và pagination
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 5; // Số bài viết trên mỗi trang

  // Sử dụng useEffect để quản lý trạng thái loading
  useEffect(() => {
    setTimeout(() => {
      setLoading(false); // Giả lập loading (chờ dữ liệu tải)
    }, 1000); // Giả lập chờ 1 giây
  }, [searchResults]);

  // Hàm để giải mã và lấy dữ liệu theo cách bạn đã sử dụng
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

    if (item.url.includes("thanhnien.vn")) {
      const imgMatch = description.match(/<img[^>]+src="([^">]+)"/);
      imageUrl = imgMatch ? imgMatch[1] : "";
    } else if (item.url.includes("vnexpress.net")) {
      const enclosureTag = xmlDoc.getElementsByTagName("enclosure")[0];
      imageUrl = enclosureTag ? enclosureTag.getAttribute("url") : "";
    } else if (item.url.includes("nhandan.vn")) {
      const thumbTag = xmlDoc.getElementsByTagName("thumb")[0];
      imageUrl = thumbTag ? thumbTag.textContent : "";
    }

    return { title, description, pubDate, imageUrl, link };
  };

  // Tính toán index bài viết của trang hiện tại
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = searchResults.slice(
    indexOfFirstArticle,
    indexOfLastArticle
  );

  // Hàm để chuyển trang
  const nextPage = () => {
    if (currentPage < Math.ceil(searchResults.length / articlesPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="search-screen">
      <h1>Kết quả tìm kiếm</h1>

      {loading ? ( // Hiển thị loading nếu đang tải
        <p>Đang tải...</p>
      ) : (
        <>
          <div className="articles-list">
            {currentArticles.map((result) => {
              const { title, description, pubDate, imageUrl, link } =
                parseArticles(result);

              return (
                <div key={result._id} className="article-item">
                  <a href={link} target="_blank" rel="noopener noreferrer">
                    <img
                      src={imageUrl}
                      alt={title}
                      className="article-image"
                      onError={(e) => {
                        e.target.src = "/default-image.jpg"; // Hiển thị ảnh mặc định nếu ảnh không tải được
                      }}
                    />
                    <h2>{title}</h2>
                  </a>
                  <small>{pubDate}</small>
                </div>
              );
            })}
          </div>

          {/* Pagination controls */}
          <div className="pagination">
            <button onClick={prevPage} disabled={currentPage === 1}>
              Trang trước
            </button>
            <span>
              Trang {currentPage} /{" "}
              {Math.ceil(searchResults.length / articlesPerPage)}
            </span>
            <button
              onClick={nextPage}
              disabled={
                currentPage ===
                Math.ceil(searchResults.length / articlesPerPage)
              }
            >
              Trang sau
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SearchScreen;
