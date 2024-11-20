import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Header.css";
import "font-awesome/css/font-awesome.min.css";

// Header Title Component
const HeaderTitle = ({ onClick }) => (
  <div className="header-title">
    <h1 onClick={onClick}>Diễn Đàn Tin Tức Việt Nam</h1>
    <p className="sub-title">- Sản phẩm của sinh viên Hoa Sen -</p>
  </div>
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
const NavMenu = ({ onHomeClick }) => {
  const navigate = useNavigate();
  const location = useLocation(); // Hook để theo dõi đường dẫn
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Đóng menu mỗi khi URL thay đổi
  useEffect(() => {
    setIsDropdownOpen(false);
  }, [location.pathname]); // Theo dõi sự thay đổi của đường dẫn

  const navigateToCategory = (category) => {
    navigate(`/category/${category}`);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  return (
    <nav className="nav">
      <ul>
        <li>
          <i className="fa fa-home" onClick={onHomeClick}></i>
        </li>
        <li onClick={() => navigateToCategory("the-gioi")}>Thế giới</li>
        <li onClick={() => navigateToCategory("thoi-su")}>Thời sự</li>
        <li onClick={() => navigateToCategory("kinh-te")}>Kinh tế</li>
        <li onClick={() => navigateToCategory("giai-tri")}>Giải trí</li>
        <li onClick={() => navigateToCategory("the-thao")}>Thể thao</li>
        <li onClick={() => navigateToCategory("giao-duc")}>Giáo dục</li>
        <li onClick={() => navigateToCategory("du-lich")}>Du lịch</li>
        <li onClick={() => navigateToCategory("xe")}>Xe</li>
        <li onClick={() => navigateToCategory("van-hoa")}>Văn hóa</li>
        <li onClick={() => navigateToCategory("doi-song")}>Đời sống</li>
        {/* Biểu tượng ☰ và menu con */}
        <li className="menu-wrapper">
          <span className="menu-icon" onClick={toggleDropdown}>
            <img
              src="https://cdn-icons-png.flaticon.com/512/1828/1828859.png"
              alt="Menu"
              className="menu-icon-image"
            />
          </span>

          {isDropdownOpen && (
            <div className="dropdown-menu">
              <ul>
                <li onClick={() => navigateToCategory("phap-luat-chinh-tri")}>
                  Pháp luật - Chính trị
                </li>
                <li onClick={() => navigateToCategory("suc-khoe-doi-song")}>
                  Sức khỏe - Đời sống
                </li>
                <li onClick={() => navigateToCategory("khoa-hoc-cong-nghe")}>
                  Khoa học - Công nghệ
                </li>
              </ul>
            </div>
          )}
        </li>
      </ul>
    </nav>
  );
};

const Header = () => {
  const [keyword, setKeyword] = useState("");
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
        <NavMenu onHomeClick={handleTitleClick} />
      </div>
    </div>
  );
};

export default Header;
