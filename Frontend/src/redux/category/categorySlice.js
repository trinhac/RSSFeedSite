import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../axios/api";

// Async action to fetch articles by category
export const fetchCategoryArticles = createAsyncThunk(
  "category/fetchCategoryArticles",
  async (category) => {
    const response = await api.get(
      `http://localhost:2048/api/category?category=${category}`
    );
    const data = response.data.map((item) => ({
      ...item,
      pubDate: new Date(item.pubDate).toISOString(),
    }));
    return data.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate)); // Sort by publish date
  }
);

const categorySlice = createSlice({
  name: "category",
  initialState: {
    articles: [],
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
      });
  },
});

export default categorySlice.reducer;
