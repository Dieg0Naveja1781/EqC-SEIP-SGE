import React, { useState, useEffect } from 'react';
import '../../Styles/App.css'; 

const Login = () => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <div className="login-page">
      <button className="theme-btn" onClick={() => setIsDark(!isDark)}>
        {isDark ? '☀️ Modo Claro' : '🌙 Modo Oscuro'}
      </button>

      {/* MODIFICAR DESPUÉS: Logo y Nombre del sitio */}
      <div className="brand-section">
        <div className="logo-box">LOGO</div>
        <h1 style={{ color: 'var(--color-500)', margin: 0 }}>NOMBRE DEL SITIO</h1>
      </div>

      <div className="login-card">
        <h2 style={{ textAlign: 'center' }}>Bienvenido</h2>
        <form>
          <div className="input-group">
            <label>Usuario / Email</label>
            <input type="text" placeholder="Ingresa tu correo" />
          </div>
          <div className="input-group">
            <label>Contraseña</label>
            <input type="password" placeholder="••••••••" />
          </div>
          <button type="button" className="btn-login">Entrar</button>
        </form>
      </div>
    </div>
  );
};

export default Login;