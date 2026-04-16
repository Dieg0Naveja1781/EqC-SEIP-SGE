import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../../services/authService';
import '../Auth.css';

const Login = () => {
  const navigate = useNavigate();

  // Estado del Tema
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : true;
  });

  // Estado del Formulario
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Estado de carga y errores
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Aplicar tema
  useEffect(() => {
    const theme = isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [isDark]);

  // Manejar cambios en inputs
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
    // Limpiar mensajes de error al escribir
    if (error) setError('');
    if (success) setSuccess('');
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar que no estén vacíos
    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Llamar al servicio de autenticación
      const result = await authService.login(
        formData.email,
        formData.password
      );

      if (result.success) {
        setSuccess('Login exitoso');

        // Redirigir al dashboard después de 1.5 segundos
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setError(result.message || 'Error al iniciar sesión');
      }
    } catch {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      {/* Switch de Cambio de Tema */}
      <div className="theme-switcher-container">
        <label className="theme-toggle-switch">
          <input
            type="checkbox"
            checked={isDark}
            onChange={() => setIsDark((prev) => !prev)}
          />
          <span className="theme-slider">
            <span className="theme-icon">☀️</span>
            <span className="theme-icon">🌙</span>
          </span>
        </label>
      </div>

      {/* Brand Section */}
      <div className="brand-section">
        <div className="logo-box">
          LOGO
        </div>
        <h1 style={{ color: 'var(--color-500)', margin: 0, fontSize: '1.45rem' }}>
          NOMBRE DEL SITIO
        </h1>
      </div>

      {/* Tarjeta de Login */}
      <div className="auth-card">
        <h2 className="auth-title">Bienvenido</h2>
        <p className="auth-subtitle">
          Ingresa tus credenciales para continuar
        </p>

        {/* Mostrar mensajes de error o éxito */}
        {error && <div className="auth-alert error">{error}</div>}

        {success && <div className="auth-alert success">{success}</div>}

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

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Autenticando...' : 'Entrar'}
          </button>
        </form>

        <div className="footer-links">
          ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;