import React, { useState, useEffect } from "react";
import PivotTableUI from "react-pivottable/PivotTableUI";
import "react-pivottable/pivottable.css";
import "./PivotScreen.css"; // Import the new CSS

const PivotScreen = () => {
  const [data, setData] = useState([["Keyword", "Category", "Count"]]);
  const [pivotState, setPivotState] = useState({});
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const response = await fetch("http://localhost:2048/api/keywords/all");
      const result = await response.json();

      if (!response.ok || !result.data) {
        throw new Error(result.message || "Failed to fetch data.");
      }

      const transformedData = [["Keyword", "Category", "Count"]];
      result.data.forEach((categoryData) => {
        if (categoryData.keywords && categoryData.category) {
          categoryData.keywords.forEach(([keyword, count]) => {
            transformedData.push([keyword, categoryData.category, count]);
          });
        }
      });

      setData(transformedData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again later.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="pivot-screen-container">
      <h1>Bảng thống kê</h1>
      {error ? (
        <p className="pivot-error-message">{error}</p>
      ) : (
        <PivotTableUI
          data={data}
          onChange={(s) => setPivotState(s)}
          {...pivotState}
        />
      )}
    </div>
  );
};

export default PivotScreen;
