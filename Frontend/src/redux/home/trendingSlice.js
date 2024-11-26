import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchTrending = createAsyncThunk(
  "trending/fetchTrending",
  async () => {
    const response = await axios.get(
      "http://localhost:2048/api/trending-keywords"
    );

    // Xử lý dữ liệu để loại bỏ dấu gạch dưới
    const data = response.data.keywords.map(([keyword, count]) => ({
      keyword: keyword.replace(/_/g, " "), // Loại bỏ dấu _
      count,
    }));

    return data; // Trả về danh sách từ khóa trending đã được xử lý
  }
);

const trendingSlice = createSlice({
  name: "trending",
  initialState: {
    keywords: [], // Danh sách từ khóa trending với định dạng { keyword, count }
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrending.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrending.fulfilled, (state, action) => {
        state.loading = false;
        state.keywords = action.payload; // Lưu trữ danh sách từ khóa trending
      })
      .addCase(fetchTrending.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to fetch trending keywords.";
      });
  },
});

export default trendingSlice.reducer;
