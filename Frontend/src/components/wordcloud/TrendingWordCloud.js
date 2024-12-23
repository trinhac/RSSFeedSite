import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./TrendingWordCloud.css";
import { setKeyword } from "../../redux/search/searchSlice";

// Font size and color configuration
const getFontSize = (count, topCounts) => {
  if (count === topCounts[0]) return "2.5rem"; // Top 1
  if (count === topCounts[1]) return "2rem";   // Top 2
  if (count === topCounts[2]) return "1.5rem"; // Top 3
  return "1rem";                               // Others
};

const getColor = (count, topCounts) => {
  if (count === topCounts[0]) return "#e63946"; // Red for Top 1
  if (count === topCounts[1]) return "#f4a261"; // Orange for Top 2
  if (count === topCounts[2]) return "#2a9d8f"; // Green for Top 3
  return "#264653";                             // Default color
};

const TrendingWordCloud = ({ data }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Extract unique counts and sort them in descending order
  const topCounts = [...new Set(data.map((item) => item.count))].sort((a, b) => b - a);

  const handleKeywordClick = async (keyword) => {
    dispatch(setKeyword(keyword));

    try {
      const response = await fetch(
        `http://localhost:2048/api/search?q=${keyword}`
      );
      if (!response.ok) {
        throw new Error("Error while searching");
      }
      const results = await response.json();
      navigate("/search", { state: { searchResults: results, q: keyword } });
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  return (
    <div className="trending-wordcloud">
      <div className="title-xuhuong" onClick={() => navigate("/pivot")}>
        <h1 className="trending-title">Xu Hướng</h1>
      </div>
      <div className="wordcloud">
        {data.map((item) => (
          <span
            key={item.keyword}
            className="wordcloud-item"
            style={{
              fontSize: getFontSize(item.count, topCounts),
              color: getColor(item.count, topCounts),
              margin: "5px",
            }}
            onClick={() => handleKeywordClick(item.keyword)}
          >
            {item.keyword}
          </span>
        ))}
      </div>
    </div>
  );
};

export default TrendingWordCloud;
