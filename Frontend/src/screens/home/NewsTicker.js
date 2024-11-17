import React, { useEffect, useState } from "react";
import "./NewsTicker.css";

const NewsTicker = ({ articles }) => {
  const [randomArticles, setRandomArticles] = useState([]);

  useEffect(() => {
    if (articles.length > 0) {
      // Pick 6-7 random articles
      const shuffled = [...articles].sort(() => 0.5 - Math.random());
      setRandomArticles(shuffled.slice(0, 7));
    }
  }, [articles]);

  return (
    <div className="news-ticker">
      <div className="ticker-content">
        {randomArticles.map((article, index) => (
          <div key={index} className="ticker-item">
            <a href={article.link} target="_blank" rel="noreferrer">
              {article.title}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsTicker;