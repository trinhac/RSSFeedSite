import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async action để fetch dữ liệu từ API
export const fetchNews = createAsyncThunk("news/fetchNews", async () => {
  const response = await axios.get("http://localhost:5000/api/news/all");
  const data = response.data.map((item) => ({
    ...item,
    pubDate: new Date(item.pubDate),
  }));
  return data.sort((a, b) => b.pubDate - a.pubDate); // Sắp xếp theo thời gian
});

const newsSlice = createSlice({
  name: "news",
  initialState: {
    articles: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.loading = false;
        state.articles = action.payload;
      })
      .addCase(fetchNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch news.";
      });
  },
});

export default newsSlice.reducer;
