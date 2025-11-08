// src/App.jsx
import React from "react";
import { AuthProvider } from "./data/AuthContext";
import Router from "./router";
import "antd/dist/reset.css";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <AuthProvider>
      <Router />
      <ToastContainer position="top-right" autoClose={4000} newestOnTop theme="light" closeOnClick pauseOnFocusLoss draggable pauseOnHover />
    </AuthProvider>
  );
}

export default App;
