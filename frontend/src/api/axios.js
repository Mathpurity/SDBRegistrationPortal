import axios from "axios";

const BASE_URL =
  import.meta.env.MODE === "production"
    ? import.meta.env.VITE_API_URL + "/api"
    : "http://localhost:5000/api";

console.log("🌍 API Base URL:", BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
