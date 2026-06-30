import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://wehear-backend-production.up.railway.app/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

const protectedPaths = ["/admin", "/profile", "/history"];

const isProtectedPath = (pathname: string) =>
  protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

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
    if (typeof window !== "undefined" && error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";

      const { pathname, search } = window.location;
      if (isProtectedPath(pathname) && !pathname.startsWith("/login")) {
        const returnUrl = encodeURIComponent(`${pathname}${search}`);
        window.location.href = `/login?returnUrl=${returnUrl}`;
      }
    }
    return Promise.reject(error);
  }
);
