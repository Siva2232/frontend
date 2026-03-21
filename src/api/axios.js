import axios from "axios";

const safeApiUrl = import.meta.env.VITE_API_URL || "https://webbackend-15d2.onrender.com/api";
if (typeof window !== "undefined" && window.location.protocol === "http:" && !window.location.hostname.includes("localhost")) {
  console.warn("In production, use HTTPS to prevent token leakage over plaintext.");
}

const API = axios.create({
  baseURL: safeApiUrl,
  withCredentials: true,
});

// Automatically attach token if available
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: Global response error handler
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Auto logout if unauthorized
      localStorage.removeItem("token");
      window.location.href = "/admin-login";
    }

    return Promise.reject(error);
  }
);

export default API;