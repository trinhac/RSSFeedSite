import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import HomeScreen from "./components/HomeScreen";
// Import các component khác nếu cần, ví dụ: Header, Footer

const App = () => {
  return (
    <Router>
      {/* Header có thể đặt ở đây nếu muốn hiển thị trên tất cả các trang */}
      {/* <Header /> */}

      <Routes>
        {/* Route cho HomeScreen với đường dẫn /trang-chu */}
        <Route path="/trang-chu" element={<HomeScreen />} />

        {/* Route chuyển hướng từ / về /trang-chu */}
        <Route path="/" element={<Navigate to="/trang-chu" replace />} />

        {/* Thêm các route khác ở đây, ví dụ:
            <Route path="/about" element={<AboutScreen />} />
            <Route path="/contact" element={<ContactScreen />} />
        */}
      </Routes>

      {/* Footer có thể đặt ở đây nếu muốn hiển thị trên tất cả các trang */}
      {/* <Footer /> */}
    </Router>
  );
};

export default App;
