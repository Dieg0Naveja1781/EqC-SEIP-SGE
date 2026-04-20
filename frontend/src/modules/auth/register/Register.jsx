import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "../../modules/auth/Styles/App.css";

const Register = () => {
  const navigate = useNavigate();
  const { register, loading, user } = useAuth();

  // Estado del Tema
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme ? savedTheme === "dark" : true;
  });

  // Estado del formulario
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password2: "",
  });

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

    if (!formData.username.trim()) {
      tempErrors.username = "El nombre de usuario es obligatorio";
    } else if (formData.username.length < 3) {
      tempErrors.username = "El nombre de usuario debe tener al menos 3 caracteres";
    }

    if (!formData.first_name.trim()) {
      tempErrors.first_name = "El nombre es obligatorio";
    }

    if (!formData.last_name.trim()) {
      tempErrors.last_name = "El apellido es obligatorio";
    }

    if (!formData.email.includes("@")) {
      tempErrors.email = "Correo no válido";
    }

    if (formData.password.length < 8) {
      tempErrors.password = "Mínimo 8 caracteres";
    }

    if (formData.password !== formData.password2) {
      tempErrors.password2 = "Las contraseñas no coinciden";
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
    // Limpiar el error del campo cuando el usuario vuelve a escribir
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
      const result = await register({
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        password: formData.password,
        password2: formData.password2,
      });

      if (result.success) {
        setMessage("✅ Cuenta creada exitosamente. Redirigiendo al login...");
        // Limpiar formulario
        setFormData({
          username: "",
          first_name: "",
          last_name: "",
          email: "",
          password: "",
          password2: "",
        });
        // Redirigir a login después de 2 segundos
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setMessage("❌ " + (result.message || "Error al registrar"));
        if (result.errors) {
          setErrors(result.errors);
        }
      }
    } catch (error) {
      setMessage("❌ Error inesperado al registrar");
      console.error("Register error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-page-container">
      {/* Switch de Tema */}
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

      {/* Tarjeta de Registro */}
      <div className="register-card">
        <h2>Crea tu cuenta</h2>
        <p style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          Únete al Sistema de Expedientes
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
          <div className="form-group">
            <label htmlFor="username">Nombre de Usuario</label>
            <input
              type="text"
              id="username"
              placeholder="usuario123"
              className={errors.username ? "input-error" : ""}
              value={formData.username}
              onChange={handleChange}
              disabled={isSubmitting || loading}
            />
            {errors.username && (
              <span className="error-text">{errors.username}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="first_name">Nombre</label>
            <input
              type="text"
              id="first_name"
              placeholder="Juan"
              className={errors.first_name ? "input-error" : ""}
              value={formData.first_name}
              onChange={handleChange}
              disabled={isSubmitting || loading}
            />
            {errors.first_name && (
              <span className="error-text">{errors.first_name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="last_name">Apellido</label>
            <input
              type="text"
              id="last_name"
              placeholder="Pérez"
              className={errors.last_name ? "input-error" : ""}
              value={formData.last_name}
              onChange={handleChange}
              disabled={isSubmitting || loading}
            />
            {errors.last_name && (
              <span className="error-text">{errors.last_name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              placeholder="correo@ejemplo.com"
              className={errors.email ? "input-error" : ""}
              value={formData.email}
              onChange={handleChange}
              disabled={isSubmitting || loading}
            />
            {errors.email && (
              <span className="error-text">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              placeholder="Mínimo 8 caracteres"
              className={errors.password ? "input-error" : ""}
              value={formData.password}
              onChange={handleChange}
              disabled={isSubmitting || loading}
            />
            {errors.password && (
              <span className="error-text">{errors.password}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password2">Confirmar Contraseña</label>
            <input
              type="password"
              id="password2"
              placeholder="Repite tu contraseña"
              className={errors.password2 ? "input-error" : ""}
              value={formData.password2}
              onChange={handleChange}
              disabled={isSubmitting || loading}
            />
            {errors.password2 && (
              <span className="error-text">{errors.password2}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn-register"
            disabled={isSubmitting || loading}
            style={{
              opacity: isSubmitting || loading ? 0.6 : 1,
              cursor: isSubmitting || loading ? "not-allowed" : "pointer",
            }}
          >
            {isSubmitting || loading ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        <div className="footer-links">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" style={{ color: "var(--color-500)" }}>
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
