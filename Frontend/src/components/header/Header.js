import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";
import "font-awesome/css/font-awesome.min.css";

// Header Title Component
const HeaderTitle = ({ onClick }) => (
  <h1 onClick={onClick}>Diễn Đàn Tin Tức Việt Nam</h1>
);

// Date Display Component
const DateDisplay = () => {
  const getFormattedDate = () => {
    const date = new Date();
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };
  return <span className="date">{getFormattedDate()}</span>;
};

// Search Bar Component
const SearchBar = ({ keyword, onChange, onSearch }) => {
  const handleKeyPress = (e) => {
    if (e.key === "Enter") onSearch();
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search..."
        value={keyword}
        onChange={onChange}
        onKeyPress={handleKeyPress}
      />
      <button type="submit" onClick={onSearch}>
        <img
          src="https://cdn-icons-png.flaticon.com/512/149/149852.png"
          alt="Search"
        />
      </button>
    </div>
  );
};

// Navigation Menu Component
const NavMenu = ({ onHomeClick, isMenuOpen, toggleMenu }) => {
  const navigate = useNavigate();

  // Hàm để điều hướng tới trang danh mục
  const navigateToCategory = (category) => {
    navigate(`/category/${category}`);
  };

  return (
    <nav className="nav">
      <ul>
        <li>
          <i className="fa fa-home" onClick={onHomeClick}></i>{" "}
        </li>
        <li onClick={() => navigateToCategory("the-gioi")}>Thế giới</li>
        <li onClick={() => navigateToCategory("thoi-su")}>Thời sự</li>
        <li onClick={() => navigateToCategory("kinh-te")}>Kinh tế</li>
        <li onClick={() => navigateToCategory("khoa-hoc-cong-nghe")}>
          Khoa học - Công nghệ
        </li>
        <li onClick={() => navigateToCategory("xe")}>Xe</li>
        <li onClick={() => navigateToCategory("suc-khoe-doi-song")}>
          Sức khỏe
        </li>
        <li onClick={() => navigateToCategory("the-thao")}>Thể thao</li>
        <li onClick={() => navigateToCategory("phap-luat-chinh-tri")}>
          Pháp luật
        </li>
        <li onClick={() => navigateToCategory("giao-duc")}>Giáo dục</li>
        <li onClick={toggleMenu} className="menu-icon">
          ☰
        </li>
      </ul>
      {isMenuOpen && (
        <div className="dropdown-menu">
          <ul>{/* Thêm các mục khác tương tự */}</ul>
        </div>
      )}
    </nav>
  );
};

const Header = () => {
  const [keyword, setKeyword] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setKeyword(e.target.value);
  };

  const fetchSearchResults = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/search?q=${keyword}`
      );
      if (!response.ok) {
        throw new Error("Có lỗi xảy ra khi tìm kiếm");
      }
      const data = await response.json();
      navigate("/search", { state: { searchResults: data } });
    } catch (error) {
      console.error("Lỗi khi tìm kiếm:", error);
    }
  };

  const handleTitleClick = () => navigate("/");

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="main-header">
      <header className="header">
        <HeaderTitle onClick={handleTitleClick} />
        <DateDisplay />
        <SearchBar
          keyword={keyword}
          onChange={handleInputChange}
          onSearch={fetchSearchResults}
        />
      </header>
      <div className="second-header">
        <NavMenu
          onHomeClick={handleTitleClick}
          isMenuOpen={isMenuOpen}
          toggleMenu={toggleMenu}
        />
      </div>
    </div>
  );
};

export default Header;
