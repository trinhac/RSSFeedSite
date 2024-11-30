import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./TrendingWordCloud.css";
import { setKeyword } from "../../redux/search/searchSlice";

const TrendingWordCloud = ({ data }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleKeywordClick = async (keyword) => {
    dispatch(setKeyword(keyword));

    try {
      const response = await fetch(
        `http://localhost:2048/api/search?q=${keyword}`
      );
      if (!response.ok) {
        throw new Error("Có lỗi xảy ra khi tìm kiếm");
      }
      const data = await response.json();
      navigate("/search", { state: { searchResults: data, q: keyword } });
    } catch (error) {
      console.error("Lỗi khi tìm kiếm:", error);
    }
  };

  const counts = [...new Set(data.map((item) => item.count))].sort(
    (a, b) => b - a
  );

  return (
    <div className="trending-wordcloud">
      <div className="title-xuhuong" onClick={() => navigate("/pivot")}>
        <h1 className="trending-title">Xu Hướng</h1>
      </div>
      <div className="wordcloud">
        {data.map((item) => {
          const fontSize =
            item.count === counts[0]
              ? "2.5rem"
              : item.count === counts[1]
              ? "1.8rem"
              : item.count === counts[2]
              ? "1.5rem"
              : "1rem";
          const color =
            item.count === counts[0]
              ? "red"
              : item.count === counts[1]
              ? "green"
              : item.count === counts[2]
              ? "blue"
              : "orange";

          return (
            <span
              key={item.keyword}
              className="wordcloud-item"
              style={{
                fontSize,
                color,
                margin: "10px",
                cursor: "pointer",
              }}
              onClick={() => handleKeywordClick(item.keyword)}
            >
              {item.keyword} ▲
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default TrendingWordCloud;
