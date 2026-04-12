// frontend/src/modules/auth/login/Login.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../../services/authService";
import "../../Styles/App.css";

const Login = () => {
  const navigate = useNavigate();
  
  // Estado del Tema
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme ? savedTheme === "dark" : true;
  });

  // Estado del Formulario
  const [formData, setFormData] = useState({ 
    email: "", 
    password: "" 
  });

  // Estado de carga y errores
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Aplicar tema
  useEffect(() => {
    const theme = isDark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [isDark]);

  // Manejar cambios en inputs
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    // Limpiar mensajes de error al escribir
    if (error) setError("");
    if (success) setSuccess("");
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar que no estén vacíos
    if (!formData.email.trim() || !formData.password.trim()) {
      setError("Por favor completa todos los campos");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Llamar al servicio de autenticación
      const result = await authService.login(
        formData.email,
        formData.password
      );

      if (result.success) {
        setSuccess("¡Login exitoso!");
        console.log("Usuario:", result.user);
        
        // Redirigir al dashboard después de 1.5 segundos
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        setError(result.message || "Error al iniciar sesión");
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      {/* Switch de Cambio de Tema */}
      <div className="theme-switcher-container">
        <label className="theme-toggle-switch">
          <input
            type="checkbox"
            checked={isDark}
            onChange={() => setIsDark(!isDark)}
          />
          <span className="theme-slider">
            <span className="theme-icon">☀️</span>
            <span className="theme-icon">🌙</span>
          </span>
        </label>
      </div>

      {/* Brand Section */}
      <div className="brand-section">
        <div
          className="logo-box"
          style={{
            width: "60px",
            height: "60px",
            background: "var(--color-500)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "12px",
            color: "white",
            fontWeight: "bold",
            marginBottom: "10px",
          }}
        >
          LOGO
        </div>
        <h1
          style={{ color: "var(--color-500)", margin: 0, fontSize: "1.5rem" }}
        >
          NOMBRE DEL SITIO
        </h1>
      </div>

      {/* Tarjeta de Login */}
      <div className="login-card">
        <h2>Bienvenido</h2>
        <p
          style={{
            textAlign: "center",
            color: "var(--text-secondary)",
            marginBottom: "1.5rem",
          }}
        >
          Ingresa tus credenciales para continuar
        </p>

        {/* Mostrar mensajes de error o éxito */}
        {error && (
          <div style={{
            backgroundColor: "var(--color-background-danger)",
            color: "var(--color-text-danger)",
            padding: "10px",
            borderRadius: "8px",
            marginBottom: "1rem",
            fontSize: "14px"
          }}>
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: "var(--color-background-success)",
            color: "var(--color-text-success)",
            padding: "10px",
            borderRadius: "8px",
            marginBottom: "1rem",
            fontSize: "14px"
          }}>
            ✅ {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Usuario / Email</label>
            <input
              type="text"
              id="email"
              placeholder="Ingresa tu correo"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="btn-login"
            disabled={loading}
            style={{
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Autenticando..." : "Entrar"}
          </button>
        </form>

        <div className="footer-links">
          ¿No tienes cuenta?{" "}
          <a href="/register">Regístrate aquí</a>
        </div>
      </div>
    </div>
  );
};

export default Login;