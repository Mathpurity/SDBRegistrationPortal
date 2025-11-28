import axios from "axios";

// Determine backend base URL
const BASE_URL =
  import.meta.env.MODE === "production"
    ? import.meta.env.VITE_API_URL + "/api" // deployed backend
    : "http://localhost:5000/api"; // local backend

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
});

// Automatically attach token to all requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
