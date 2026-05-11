import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService, saveSessionProfesor } from "../../../shared/api/authService";
import logotipo from "../../../assets/logotipo.png";
import logotipoOscuro from "../../../assets/Logotipo_o.png";
import "../Styles/App.css";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  //Estado del Tema con persistencia (Lee del localStorage al cargar)  AUN NECESITO REPARARLO
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    // Si no hay nada guardado, por defecto es oscuro (true)
    return savedTheme ? savedTheme === "dark" : true;
  });

  //Estado para los datos del formulario
  const [formData, setFormData] = useState({ email: "", password: "" });

  //Efecto para aplicar el tema al HTML y guardarlo
  useEffect(() => {
    const theme = isDark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [isDark]);

  //Manejador de cambios en los inputs
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      const result = await authService.login(formData.email, formData.password);
      if (result?.success) {
        saveSessionProfesor(result.profesor);
        navigate("/main");
      } else {
        setErrorMsg(result?.error || "Credenciales inválidas");
      }
    } catch (err) {
      setErrorMsg(err?.data?.error || "Error de conexión con el servidor");
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
        <img src={isDark ? logotipoOscuro : logotipo} alt="Logotipo" className="brand-logo" />
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
            />
          </div>

          {errorMsg && (
            <p style={{ color: "#ff6b6b", textAlign: "center", marginTop: "0.5rem" }}>
              {errorMsg}
            </p>
          )}

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <div className="footer-links">
          ¿No tienes cuenta?{" "}
          <Link to="/register">Regístrate aquí</Link>
        </div>
      </div>
    </div>
  );
};

export { Login };
export default Login;
