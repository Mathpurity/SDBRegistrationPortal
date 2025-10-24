import axios from "axios";

// Create a reusable axios instance
const api = axios.create({
  baseURL: "http://localhost:5000/api", // your backend base URL
});

// Automatically attach token to all requests
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
