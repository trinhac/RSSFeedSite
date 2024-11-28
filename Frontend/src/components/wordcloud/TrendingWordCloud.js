import React from "react";
import WordCloud from "react-wordcloud";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./TrendingWordCloud.css";
import { setKeyword } from "../../redux/search/searchSlice";

const TrendingWordCloud = ({ data }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleKeywordClick = async (keyword) => {
    dispatch(setKeyword(keyword)); // Cập nhật từ khóa trong Redux

    try {
      // Gọi API tìm kiếm ngay lập tức
      const response = await fetch(
        `http://localhost:2048/api/search?q=${keyword}`
      );
      if (!response.ok) {
        throw new Error("Có lỗi xảy ra khi tìm kiếm");
      }
      const data = await response.json();

      // Chuyển hướng sang trang tìm kiếm với kết quả
      navigate("/search", { state: { searchResults: data, q: keyword } });
    } catch (error) {
      console.error("Lỗi khi tìm kiếm:", error);
    }
  };

  const maxCount = Math.max(...data.map((d) => d.count));
  const minCount = Math.min(...data.map((d) => d.count));

  const words = data.map((item) => {
    let fontSize, color;
    if (item.count === maxCount) {
      fontSize = 90;
      color = "red";
    } else if (item.count === minCount) {
      fontSize = 30;
      color = "orange";
    } else {
      fontSize = 50;
      color = "green";
    }
    return {
      text: item.keyword,
      value: fontSize,
      color: color,
    };
  });

  const options = {
    rotations: 1,
    rotationAngles: [0, 0],
    fontSizes: [30, 90],
    fontFamily: "Roboto, Arial, sans-serif",
    fontWeight: "600",
    padding: 8,
    deterministic: true,
    enableTooltip: false,
  };

  return (
    <>
      <h1 className="trending-title">Xu Hướng</h1>
      <div className="wordcloud-container">
        <WordCloud
          words={words}
          options={options}
          callbacks={{
            getWordColor: (word) => word.color,
            onWordClick: (word) => handleKeywordClick(word.text), // Gọi hàm khi nhấn vào từ
          }}
        />
      </div>
    </>
  );
};

export default TrendingWordCloud;
