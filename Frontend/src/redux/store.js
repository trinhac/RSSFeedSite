import { configureStore } from "@reduxjs/toolkit";
import newsReducer from "./home/newsSlice";
import categoryReducer from "./category/categorySlice";
import trendingReducer from "./home/trendingSlice";
import searchReducer from "./search/searchSlice";


const store = configureStore({
  reducer: {
    news: newsReducer,
    category: categoryReducer,
    trending: trendingReducer,
    search: searchReducer,

  },
});

export default store;
