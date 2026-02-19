import axios from "axios";

const API = axios.create({
  baseURL: "https://webbackend-fsxr.onrender.com/api",
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