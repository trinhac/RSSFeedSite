import { createSlice } from "@reduxjs/toolkit";

const searchSlice = createSlice({
  name: "search",
  initialState: {
    keyword: "", // Từ khóa hiện tại
  },
  reducers: {
    setKeyword(state, action) {
      state.keyword = action.payload; // Cập nhật từ khóa
    },
  },
});

export const { setKeyword } = searchSlice.actions;
export default searchSlice.reducer;
