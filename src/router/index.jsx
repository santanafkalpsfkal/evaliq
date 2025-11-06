// src/router/index.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Pages
import Login from "../ui/pages/Login";
import Home from "../ui/pages/Home";
import Evaluation from "../ui/pages/Evaluation";
import Results from "../ui/pages/Results";
import Admin from "../ui/pages/Admin";
import About from "../ui/pages/About";
import Profile from "../ui/pages/Profile";
import Settings from "../ui/pages/Settings";

/**
 * Helper: lee user desde localStorage (síncrono, evita race)
 */
function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * ProtectedRoute using localStorage (synchronous)
 */
const ProtectedRoute = ({ children, role }) => {
  const storedUser = getStoredUser();
  
  // Si no hay usuario, redirigir al HOME (no al login)
  if (!storedUser) {
    return <Navigate to="/home" replace />;
  }

  // Si hay rol específico y no coincide
  if (role && storedUser.role !== role) {
    return <Navigate to={storedUser.role === "admin" ? "/admin" : "/home"} replace />;
  }

  return children;
};

/**
 * PublicOnlyRoute - para login (solo accesible si NO está logueado)
 */
const PublicOnlyRoute = ({ children }) => {
  const storedUser = getStoredUser();
  
  // Si ya está logueado, redirigir al home
  if (storedUser) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

const Router = () => (
  <BrowserRouter>
    <Routes>
      {/* Home como página pública y principal */}
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/home" element={<Home />} />
      
      {/* Login - solo accesible si NO está logueado */}
      <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />

      {/* Rutas protegidas - requieren login */}
      <Route path="/evaluation" element={<ProtectedRoute role="user"><Evaluation /></ProtectedRoute>} />
      <Route path="/results" element={<ProtectedRoute role="user"><Results /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute role="user"><Profile /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute role="user"><Settings /></ProtectedRoute>} />

      {/* Admin - requiere rol admin */}
      <Route path="/admin" element={<ProtectedRoute role="admin"><Admin /></ProtectedRoute>} />

      {/* Públicas */}
      <Route path="/about" element={<About />} />

      {/* Catch all - redirigir al home */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  </BrowserRouter>
);

export default Router;