// src/data/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
    } catch (e) {
      console.error("AuthContext localStorage parse error", e);
    }
  }, []);

  const login = (userData) => {
    try {
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (e) {
      console.error("AuthContext save error", e);
    }
    setUser(userData);
    return userData;
  };

  const logout = () => {
    try {
      localStorage.removeItem("user");
    } catch (e) {
      console.error("AuthContext remove error", e);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
