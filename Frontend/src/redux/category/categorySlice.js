import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../axios/api";

// Fetch articles by category
export const fetchCategoryArticles = createAsyncThunk(
  "category/fetchCategoryArticles",
  async (category) => {
    const response = await api.get(
      `http://localhost:2048/api/category?category=${category}`
    );
    return response.data.map((item) => ({
      ...item,
      pubDate: new Date(item.pubDate).toISOString(),
    }));
  }
);

// Existing thunks
export const fetchArticlesByTopKeywords = createAsyncThunk(
  "category/fetchArticlesByTopKeywords",
  async (category) => {
    const response = await api.get(
      `http://localhost:2048/api/category/top-keywords-articles?category=${category}`
    );
    return response.data.articles;
  }
);

export const fetchLatestArticles = createAsyncThunk(
  "category/fetchLatestArticles",
  async (category) => {
    const response = await api.get(
      `http://localhost:2048/api/news/latest?category=${category}`
    );
    return response.data.map((item) => ({
      ...item,
      pubDate: new Date(item.pubDate).toISOString(),
    }));
  }
);

const categorySlice = createSlice({
  name: "category",
  initialState: {
    articles: [],
    topKeywordArticles: [],
    recentCategoryArticles: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategoryArticles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryArticles.fulfilled, (state, action) => {
        state.loading = false;
        state.articles = action.payload;
      })
      .addCase(fetchCategoryArticles.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to fetch category articles.";
      })
      .addCase(fetchArticlesByTopKeywords.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchArticlesByTopKeywords.fulfilled, (state, action) => {
        state.loading = false;
        state.topKeywordArticles = action.payload;
      })
      .addCase(fetchArticlesByTopKeywords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchLatestArticles.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLatestArticles.fulfilled, (state, action) => {
        state.loading = false;
        state.recentCategoryArticles = action.payload;
      })
      .addCase(fetchLatestArticles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default categorySlice.reducer;
