import React, { useState, useEffect } from 'react';
import '../../Styles/App.css'; 

const Login = () => {
  //Estado del Tema con persistencia (Lee del localStorage al cargar)  AUN NECESITO REPARARLO
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    // Si no hay nada guardado, por defecto es oscuro (true)
    return savedTheme ? savedTheme === 'dark' : true;
  });

  //Estado para los datos del formulario
  const [formData, setFormData] = useState({ email: '', password: '' });

  //Efecto para aplicar el tema al HTML y guardarlo
  useEffect(() => {
    const theme = isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [isDark]);

  //Manejador de cambios en los inputs
  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.id]: e.target.value 
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Intentando iniciar sesión con:", formData);
    // Aquí iría la lógica de conexión al backend
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
        <div className="logo-box" style={{ 
            width: '60px', 
            height: '60px', 
            background: 'var(--color-500)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            borderRadius: '12px',
            color: 'white',
            fontWeight: 'bold',
            marginBottom: '10px'
        }}>LOGO</div>
        <h1 style={{ color: 'var(--color-500)', margin: 0, fontSize: '1.5rem' }}>NOMBRE DEL SITIO</h1>
      </div>

      {/* Tarjeta de Login */}
      <div className="login-card">
        <h2>Bienvenido</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
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

          <button type="submit" className="btn-login">Entrar</button>
        </form>

        <div className="footer-links">
          ¿No tienes cuenta? <a href="../Createaccount/Registro.html">Regístrate aquí</a>
        </div>
      </div>
    </div>
  );
};

export default Login;