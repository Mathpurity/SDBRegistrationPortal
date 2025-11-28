// src/api.js
import axios from "axios";

// Determine backend URL
const BASE_URL =
  import.meta.env.MODE === "production"
    ? import.meta.env.VITE_API_URL + "/api"
    : "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
});

// Automatically attach token if exists
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
