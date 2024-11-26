import React from "react";
import WordCloud from "react-wordcloud";
import "./TrendingWordCloud.css";

const TrendingWordCloud = ({ data }) => {
  const maxCount = Math.max(...data.map((d) => d.count));
  const minCount = Math.min(...data.map((d) => d.count));

  const words = data.map((item) => {
    let fontSize, color;
    if (item.count === maxCount) {
      fontSize = 90; // Từ lớn nhất
      color = "red"; // Màu đỏ cho từ lớn nhất
    } else if (item.count === minCount) {
      fontSize = 30; // Từ nhỏ nhất
      color = "orange"; // Màu cam cho từ nhỏ nhất
    } else {
      fontSize = 50; // Các từ còn lại
      color = "green"; // Màu xanh lá cho từ cỡ trung bình
    }
    return {
      text: item.keyword,
      value: fontSize, // Sử dụng giá trị cố định đã tính
      color: color, // Gắn thêm thuộc tính màu
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
      {/* Tiêu đề nằm ngoài Word Cloud */}
      <h1 className="trending-title">Xu Hướng</h1>

      {/* Word Cloud */}
      <div className="wordcloud-container">
        <WordCloud
          words={words}
          options={options}
          callbacks={{
            getWordColor: (word) => word.color, // Sử dụng thuộc tính màu của từ
          }}
        />
      </div>
    </>
  );
};

export default TrendingWordCloud;
