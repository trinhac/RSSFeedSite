import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";

const Header = () => {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const navigate = useNavigate(); // Hook điều hướng

  const handleInputChange = (e) => {
    setKeyword(e.target.value);
  };

  const fetchSearchResults = async () => {
    try {
      const response = await fetch(`http://localhost:3001/search?q=${keyword}`);
      if (!response.ok) {
        throw new Error("Có lỗi xảy ra khi tìm kiếm");
      }
      const data = await response.json();
      setResults(data);
      navigate("/search", { state: { searchResults: data } }); // Điều hướng đến trang SearchScreen với kết quả tìm kiếm
    } catch (error) {
      console.error("Lỗi khi tìm kiếm:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      fetchSearchResults();
    }
  };

  const handleSubmit = () => {
    fetchSearchResults();
  };

  const handleTitleClick = () => {
    navigate("/"); // Điều hướng về trang chủ ("/")
  };

  return (
    <div className="main-header">
      <header className="header">
        <h1 onClick={handleTitleClick}>Diễn Đàn Tin Tức Việt Nam</h1>
        <nav className="nav">
          <ul>
            <li>Thời sự</li>
            <li>Kinh tế</li>
            <li>Y tế</li>
            <li>Pháp luật</li>
            <li>Đời sống</li>
            <li>Xã hội</li>
            <li>Giáo dục</li>
            <li>Du lịch</li>
          </ul>
        </nav>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search..."
            value={keyword}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
          />
          <button type="submit" onClick={handleSubmit}>
            <img
              src="https://cdn-icons-png.flaticon.com/512/149/149852.png"
              alt="Search"
            />
          </button>
        </div>
      </header>
    </div>
  );
};

export default Header;
