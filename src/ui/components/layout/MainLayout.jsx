import React from "react";
import { Link } from "react-router-dom";
import "./layout.css";

const MainLayout = ({ children }) => {
  return (
    <div className="layout-container">
      <nav className="navbar">
        <div className="navbar-title">EvalIQ</div>
        <div className="navbar-links">
          <Link to="/">Inicio</Link>
          <Link to="/evaluacion">Evaluación</Link>
          <Link to="/resultados">Resultados</Link>
          <Link to="/admin">Administrador</Link>
        </div>
      </nav>

      <main className="main-content">
        {children ? children : <h2>Bienvenido a EvalIQ</h2>}
      </main>
    </div>
  );
};

export default MainLayout;
