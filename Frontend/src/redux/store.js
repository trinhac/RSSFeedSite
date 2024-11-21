import { configureStore } from "@reduxjs/toolkit";
import newsReducer from "./home/newsSlice";
import categoryReducer from "./category/categorySlice";

const store = configureStore({
  reducer: {
    news: newsReducer,
    category: categoryReducer,
  },
});

export default store;
