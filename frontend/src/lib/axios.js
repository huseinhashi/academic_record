//portal/src/lib/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:6111/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage = error.response?.data?.message || error.message;
    console.error("API Error:", errorMessage);
    return Promise.reject(error);
  }
);

export default api;
