import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import "./DashboardLayout.css";

export function DashboardLayout({ children, title }) {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: "Página Principal", path: "/main" },
    { name: "Listado de Archivos", path: "/archive_list" },
    { name: "Subir Archivo", path: "/subir_doc" },
    { name: "Perfil", path: "/perfil" },
  ];

  return (
    <div className={`dashboard-layout ${isDark ? "dark" : ""}`}>
      {/* SIDEBAR COMÚN */}
      <aside className="sidebar">
        <div
          className="sidebar-brand"
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
        >
          EQC Software
        </div>
        <nav>
          {menuItems.map((item) => (
            <div
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              {item.name}
            </div>
          ))}
        </nav>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="main-content">
        {/* HEADER COMÚN */}
        <header className="header-dashboard">
          <div className="header-left">{title && <h1>{title}</h1>}</div>

          <div className="header-right">
            <div className="user-profile">
              <span className="user-name">Usuario</span>
              <div className="user-avatar"></div>
            </div>
          </div>
        </header>

        {/* CONTENIDO DINÁMICO */}
        <div className="page-content">{children}</div>
      </main>
    </div>
  );
}
