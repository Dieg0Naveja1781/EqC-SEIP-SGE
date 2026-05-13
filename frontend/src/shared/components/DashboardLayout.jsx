import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { authService, clearSessionProfesor, getSessionProfesor } from "../api/authService";
import { ModalCrearExpediente } from "../../modules/CrearExpediente/ModalCrearExpediente";
import "./DashboardLayout.css";

export function DashboardLayout({ children, title }) {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [nombreProfesor, setNombreProfesor] = useState("Usuario");

  // 2. Crea un estado para controlar la visibilidad del modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const profesor = getSessionProfesor();
    if (profesor?.full_name) {
      setNombreProfesor(profesor.full_name);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      clearSessionProfesor();
      navigate("/");
    }
  };

  const menuItems = [
    { name: "Página Principal", path: "/main" },
    { name: "Listado de Archivos", path: "/archive_list" },
    { name: "Subir Archivo", path: "/subir_doc" },
    { name: "Perfil", path: "/perfil" },
    // Este item ya no necesita necesariamente un "path" si solo abrirá el modal
    { name: "Crear Expediente", isModalTrigger: true }, 
  ];

  return (
    <div className={`dashboard-layout ${isDark ? "dark" : ""}`}>
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
              key={item.name}
              className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
              onClick={() => {
                // 3. Lógica condicionada: Si es el botón del modal, lo abre; si no, navega.
                if (item.isModalTrigger) {
                  setIsModalOpen(true);
                } else {
                  navigate(item.path);
                }
              }}
            >
              {item.name}
            </div>
          ))}
        </nav>

        <button onClick={handleLogout} className="logout-btn">
          Cerrar Sesión
        </button>
      </aside>

      <main className="main-content">
        <header className="header-dashboard">
          <div className="header-left">{title && <h1>{title}</h1>}</div>
          <div className="header-right">
            <div className="user-profile">
              <span className="user-name">{nombreProfesor}</span>
              <div className="user-avatar"></div>
            </div>
          </div>
        </header>

        <div className="page-content">{children}</div>
      </main>

      {/* 4. Renderiza el Modal al final, pasando las props de control */}
      <ModalCrearExpediente 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}