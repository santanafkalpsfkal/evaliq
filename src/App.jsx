// src/App.jsx
import React from "react";
import { AuthProvider } from "./data/AuthContext";
import Router from "./router";
import "antd/dist/reset.css";

function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}

export default App;
