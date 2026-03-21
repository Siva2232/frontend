import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import API from "../api/axios";

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const isServiceTeamEmail = (email) => {
    if (!email) return false;
    const normalized = email.trim().toLowerCase();
    return normalized === "service@lancaster.com" || normalized === "service-team@lancaster.com" || normalized.includes("service");
  };

  // Check token on page load
  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("adminEmail");

    if (token && email) {
      const role = isServiceTeamEmail(email) ? "service" : "admin";
      setAdmin({ token, email, role });
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("adminEmail");
      delete axios.defaults.headers.common["Authorization"];
      setAdmin(null);
    }

    setLoading(false);
  }, []);

  // Verify password (re-auth) - used for sensitive actions like delete
  const verifyPassword = async (password) => {
    if (!admin?.email) {
      return { success: false, message: "No admin email stored. Please log in again." };
    }

    try {
      const { data } = await API.post("/auth/login", {
        email: admin.email,
        password,
      });

      // Refresh token on successful re-auth
      localStorage.setItem("token", data.token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      setAdmin((prev) => ({ ...prev, token: data.token }));

      return { success: true };
    } catch (error) {
      let message = "Password verification failed.";
      if (error.response) {
        message = error.response.data?.message || message;
      }
      return { success: false, message };
    }
  };

  // Login
  const login = async (email, password) => {
    try {
      const { data } = await API.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("adminEmail", email);
      axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      const role = isServiceTeamEmail(email) ? "service" : "admin";
      setAdmin({ token: data.token, email, role });
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
    <AuthContext.Provider value={{ admin, login, logout, loading, verifyPassword }}>
      {children}
    </AuthContext.Provider>
  );
};