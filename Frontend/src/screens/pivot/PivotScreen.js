import React, { useState } from "react";
import PivotTableUI from "react-pivottable/PivotTableUI";
import "react-pivottable/pivottable.css";

const PivotScreen = () => {
  const data = [
    ["Keyword", "Category", "Count"],
    ["Oreshnik", "The Gioi", 3],
    ["Oreshnik", "Thoi Su", 1],
    ["Bulgaria", "Kinh Te", 5],
    ["Bulgaria", "Giai Tri", 2],
    ["Rumen_Radev", "Phap Luat - Chinh Tri", 6],
    ["dạt", "Suc Khoe - Doi Song", 3],
    ["xích_lô", "Du Lich", 5],
  ];

  const [pivotState, setPivotState] = useState({});

  return (
    <div>
      <h1>Pivot Table</h1>
      <PivotTableUI
        data={data}
        onChange={(s) => setPivotState(s)}
        {...pivotState}
      />
    </div>
  );
};

export default PivotScreen;
