import axios from "axios";
import { setupCache, buildMemoryStorage } from "axios-cache-interceptor";

// Tạo instance của Axios
const api = axios.create();

// Áp dụng caching với cấu hình storage
setupCache(api, {
  ttl: 1000 * 60 * 10, // Cache 10 phút
  storage: buildMemoryStorage(), // Cache trong bộ nhớ
});

export default api;
