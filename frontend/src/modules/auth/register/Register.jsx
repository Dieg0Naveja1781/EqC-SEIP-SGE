import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../../services/authService';
import '../Auth.css';

function Register() {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : true;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password2: '',
  });

  useEffect(() => {
    const theme = isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [isDark]);

  const handleChange = (event) => {
    const { id, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));

    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formData.password !== formData.password2) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const result = await authService.register(formData);

    if (result.success) {
      setSuccess('Usuario registrado correctamente. Ahora puedes iniciar sesión.');
      setTimeout(() => {
        navigate('/login');
      }, 1200);
    } else if (result.errors) {
      const firstError = Object.values(result.errors)[0];
      const message = Array.isArray(firstError) ? firstError[0] : 'No se pudo registrar.';
      setError(message);
    } else {
      setError(result.message || 'No se pudo registrar.');
    }

    setLoading(false);
  };

  return (
    <div className="auth-page-container">
      <div className="theme-switcher-container">
        <label className="theme-toggle-switch">
          <input type="checkbox" checked={isDark} onChange={() => setIsDark((prev) => !prev)} />
          <span className="theme-slider">
            <span className="theme-icon">☀️</span>
            <span className="theme-icon">🌙</span>
          </span>
        </label>
      </div>

      <div className="brand-section">
        <div className="logo-box">LOGO</div>
        <h1 style={{ color: 'var(--color-500)', margin: 0, fontSize: '1.45rem' }}>NOMBRE DEL SITIO</h1>
      </div>

      <div className="auth-card">
        <h2 className="auth-title">Crear cuenta</h2>
        <p className="auth-subtitle">Completa tus datos para registrarte</p>

        {error && <div className="auth-alert error">{error}</div>}
        {success && <div className="auth-alert success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Usuario</label>
            <input id="username" type="text" value={formData.username} onChange={handleChange} required disabled={loading} />
          </div>

          <div className="input-group">
            <label htmlFor="email">Correo</label>
            <input id="email" type="email" value={formData.email} onChange={handleChange} required disabled={loading} />
          </div>

          <div className="input-group">
            <label htmlFor="first_name">Nombre</label>
            <input id="first_name" type="text" value={formData.first_name} onChange={handleChange} required disabled={loading} />
          </div>

          <div className="input-group">
            <label htmlFor="last_name">Apellido</label>
            <input id="last_name" type="text" value={formData.last_name} onChange={handleChange} required disabled={loading} />
          </div>

          <div className="input-group">
            <label htmlFor="password">Contraseña</label>
            <input id="password" type="password" value={formData.password} onChange={handleChange} required disabled={loading} />
          </div>

          <div className="input-group">
            <label htmlFor="password2">Confirmar contraseña</label>
            <input id="password2" type="password" value={formData.password2} onChange={handleChange} required disabled={loading} />
          </div>

          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? 'Registrando...' : 'Crear cuenta'}
          </button>
        </form>

        <div className="footer-links">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
