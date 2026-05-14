import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8668/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor to include the token in the headers
api.interceptors.request.use(
  (config) => {
    // Check if we are in a browser environment
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle authentication errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Token might be expired or invalid
      // Optional: Clear local storage and redirect to login if unauthorized
      // localStorage.removeItem("token");
      // localStorage.removeItem("user");
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
