import { createContext, useState, useEffect } from "react";
import axios from "axios";
import API from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check token on page load
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setAdmin({ token });
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    setLoading(false);
  }, []);

  // Login
  const login = async (email, password) => {
    try {
      const { data } = await API.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", data.token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      setAdmin({ token: data.token });

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      let message = "Login failed";
      if (!error.response) {
        message = "Server is not responding. Please make sure the backend API is reachable.";
      } else {
        message = error.response.data?.message || "Invalid credentials";
      }
      return {
        success: false,
        message: message,
      };
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};