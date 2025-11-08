// src/router/index.jsx
import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { userServices } from "../services/userServices";

// Pages
import Login from "../ui/pages/Login";
import Home from "../ui/pages/Home";
import Evaluation from "../ui/pages/Evaluation";
import Results from "../ui/pages/Results";
import Admin from "../ui/pages/Admin";
import About from "../ui/pages/About";
import Profile from "../ui/pages/Profile";
import Settings from "../ui/pages/Settings";

// Hook: usuario desde storage + reactividad a cambios
function useStoredUser() {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);

  const read = () => {
    try {
      setUser(userServices.getCurrentUser());
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    read();
    setReady(true);
    const onStorage = (e) => {
      if (e.key === 'userData' || e.key === 'authToken') read();
    };
    const onSessionChanged = () => read();
    window.addEventListener('storage', onStorage);
    window.addEventListener('session-changed', onSessionChanged);
    return () => window.removeEventListener('storage', onStorage);
    return () => window.removeEventListener('session-changed', onSessionChanged);
  }, []);

  return { user, ready };
}

// Guardias
const ProtectedRoute = ({ children, role }) => {
  const { user, ready } = useStoredUser();
  if (!ready) return null; // evita parpadeo/bloqueos mientras hidrata

  if (!user) {
    return <Navigate to="/home" replace />;
  }
  if (role && user.role !== role) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/home"} replace />;
  }
  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { user, ready } = useStoredUser();
  if (!ready) return null;
  if (user) return <Navigate to="/home" replace />;
  return children;
};

const Router = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/home" element={<Home />} />

      <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />

      <Route path="/evaluation" element={<ProtectedRoute><Evaluation /></ProtectedRoute>} />
      <Route path="/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute role="admin"><Admin /></ProtectedRoute>} />
      <Route path="/about" element={<About />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  </BrowserRouter>
);

export default Router;