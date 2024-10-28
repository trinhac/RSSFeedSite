import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const CategoryArticles = () => {
  const { category } = useParams(); // Get the category from the URL
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    // Fetch articles by category
    const fetchArticlesByCategory = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/news/topic?topic=${category}`);
        const data = await response.json();
        setArticles(data);
      } catch (error) {
        console.error("Error fetching articles:", error);
      }
    };

    fetchArticlesByCategory();
  }, [category]);

  return (
    <div>
      <h2>Articles in {category}</h2>
      <ul>
        {articles.length > 0 ? (
          articles.map((article, index) => (
            <li key={index}>
              <a href={article.link} target="_blank" rel="noopener noreferrer">
                <h3>{article.title}</h3>
              </a>
              <p>{article.description}</p>
            </li>
          ))
        ) : (
          <p>No articles found for this category.</p>
        )}
      </ul>
    </div>
  );
};

export default CategoryArticles;
