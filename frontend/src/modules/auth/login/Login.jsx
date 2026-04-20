import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "../../modules/auth/Styles/App.css";

const Login = () => {
  const navigate = useNavigate();
  const { login, loading, user } = useAuth();

  // Estado del Tema
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme ? savedTheme === "dark" : true;
  });

  // Estado del formulario
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Si ya está logueado, redirigir a main
  useEffect(() => {
    if (user) {
      navigate("/main");
    }
  }, [user, navigate]);

  // Efecto para aplicar el tema
  useEffect(() => {
    const theme = isDark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [isDark]);

  // Validación
  const validate = () => {
    let tempErrors = {};
    if (!formData.email.trim()) {
      tempErrors.email = "El usuario o email es obligatorio";
    }
    if (!formData.password.trim()) {
      tempErrors.password = "La contraseña es obligatoria";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Manejador de cambios
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
    // Limpiar error cuando el usuario vuelve a escribir
    if (errors[e.target.id]) {
      setErrors({ ...errors, [e.target.id]: null });
    }
  };

  // Manejador de envío
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        setMessage("✅ " + result.message);
        // La redirección ocurre automáticamente por el useEffect que monitorea 'user'
      } else {
        setMessage("❌ " + result.message);
        setErrors({ form: result.message });
      }
    } catch (error) {
      setMessage("❌ Error inesperado al iniciar sesión");
      console.error("Login error:", error);
    } finally {
      setIsSubmitting(false);
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
            aria-label="Cambiar tema"
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
          📋
        </div>
        <h1
          style={{ color: "var(--color-500)", margin: 0, fontSize: "1.5rem" }}
        >
          SEIP - Sistema de Expedientes
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

        {/* Mensajes */}
        {message && (
          <div
            style={{
              padding: "10px",
              marginBottom: "15px",
              borderRadius: "4px",
              backgroundColor: message.includes("✅") ? "#d4edda" : "#f8d7da",
              color: message.includes("✅") ? "#155724" : "#721c24",
              textAlign: "center",
            }}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="input-group">
            <label htmlFor="email">Usuario / Email</label>
            <input
              type="text"
              id="email"
              placeholder="Ingresa tu correo o usuario"
              value={formData.email}
              onChange={handleChange}
              disabled={isSubmitting || loading}
              style={{
                borderColor: errors.email ? "red" : "inherit",
              }}
            />
            {errors.email && (
              <span style={{ color: "red", fontSize: "0.8rem" }}>
                {errors.email}
              </span>
            )}
          </div>

          <div className="input-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              disabled={isSubmitting || loading}
              style={{
                borderColor: errors.password ? "red" : "inherit",
              }}
            />
            {errors.password && (
              <span style={{ color: "red", fontSize: "0.8rem" }}>
                {errors.password}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="btn-login"
            disabled={isSubmitting || loading}
            style={{
              opacity: isSubmitting || loading ? 0.6 : 1,
              cursor: isSubmitting || loading ? "not-allowed" : "pointer",
            }}
          >
            {isSubmitting || loading ? "Iniciando..." : "Entrar"}
          </button>
        </form>

        <div className="footer-links">
          ¿No tienes cuenta?{" "}
          <Link to="/register" style={{ color: "var(--color-500)" }}>
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
