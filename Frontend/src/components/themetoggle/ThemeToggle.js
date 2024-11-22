import React, { useState, useEffect } from "react";
import "./ThemeToggle.css";

const ThemeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  // Toggle theme mode
  const toggleTheme = () => {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      localStorage.setItem("theme", newMode ? "dark" : "light");
      document.body.classList.toggle("dark-mode", newMode);
      return newMode;
    });
  };

  // Apply theme on initial load
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [isDarkMode]);

  return (
    <div
      className={`theme-toggle ${isDarkMode ? "dark" : "light"}`}
      onClick={toggleTheme}
      title={`Chuyển sang chế độ ${isDarkMode ? "sáng" : "tối"}`}
    >
      {isDarkMode ? "🌙" : "☀️"}
    </div>
  );
};

export default ThemeToggle;
