import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import HomeScreen from "./screens/home/HomeScreen";
import SearchScreen from "./screens/search/SearchScreen";
import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import CategoryArticles from "./screens/category/CategoryArticles";
import PivotScreen from "./screens/pivot/PivotScreen";
import "./App.css";

const App = () => {
  return (
    <Router>
      <div className="page-container">
        {/* Header sẽ nằm trên cùng */}
        <Header />

        {/* Phần nội dung chính */}
        <div className="content-wrap">
          <Routes>
            {/* Các route của ứng dụng */}
            <Route path="/trang-chu" element={<HomeScreen />} />
            <Route path="/" element={<Navigate to="/trang-chu" replace />} />
            <Route path="/search" element={<SearchScreen />} />
            <Route path="/category/:category" element={<CategoryArticles />} />
            <Route path="/pivot" element={<PivotScreen />} />
          </Routes>
        </div>

        {/* Footer sẽ luôn nằm dưới */}
        <Footer />
      </div>
    </Router>
  );
};

export default App;
