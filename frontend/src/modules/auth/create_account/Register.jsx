import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../../../shared/api/authService";
import "../Styles/App.css";

function Register() {
    const navigate = useNavigate();

    const [isDark, setIsDark] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme ? savedTheme === 'dark' : true;
    });

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        rol_profe: 'INVESTIGADOR',
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [serverMsg, setServerMsg] = useState('');

    useEffect(() => {
        const theme = isDark ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [isDark]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
        if (errors[e.target.id]) {
            setErrors({ ...errors, [e.target.id]: null });
        }
    };

    const validate = () => {
        let tempErrors = {};
        if (!formData.name.trim()) tempErrors.name = "El nombre es obligatorio";
        if (!formData.email.includes('@')) tempErrors.email = "Correo no válido";
        if (formData.password.length < 8) tempErrors.password = "Mínimo 8 caracteres";
        if (formData.password !== formData.confirmPassword) {
            tempErrors.confirmPassword = "Las contraseñas no coinciden";
        }
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerMsg('');
        if (!validate()) return;

        setLoading(true);
        try {
            const result = await authService.register({
                correo_profe: formData.email,
                password: formData.password,
                password2: formData.confirmPassword,
                full_name: formData.name,
                rol_profe: formData.rol_profe,
            });

            if (result?.success) {
                setServerMsg('¡Cuenta creada con éxito! Redirigiendo al login…');
                setTimeout(() => navigate('/login'), 1200);
            } else {
                const backendErrors = result?.errors || {};
                const flat = Object.entries(backendErrors)
                    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
                    .join(' | ');
                setServerMsg(flat || 'No se pudo registrar');
            }
        } catch (err) {
            const backendErrors = err?.data?.errors || {};
            const flat = Object.entries(backendErrors)
                .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
                .join(' | ');
            setServerMsg(flat || err?.data?.error || 'Error de conexión con el servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page-container">
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

            <div className="register-card">
                <h2>Crea tu cuenta</h2>
                <p>Únete hoy mismo !!</p>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-group">
                        <label htmlFor="name">Nombre Completo</label>
                        <input
                            type="text"
                            id="name"
                            placeholder="Juan Pérez"
                            className={errors.name ? 'input-error' : ''}
                            value={formData.name}
                            onChange={handleChange}
                        />
                        {errors.name && <span className="error-text">{errors.name}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Correo Electrónico</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="correo@ejemplo.com"
                            className={errors.email ? 'input-error' : ''}
                            value={formData.email}
                            onChange={handleChange}
                        />
                        {errors.email && <span className="error-text">{errors.email}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Mínimo 8 caracteres"
                            className={errors.password ? 'input-error' : ''}
                            value={formData.password}
                            onChange={handleChange}
                        />
                        {errors.password && <span className="error-text">{errors.password}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            placeholder="Repite tu contraseña"
                            className={errors.confirmPassword ? 'input-error' : ''}
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                        {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="rol_profe">Rol</label>
                        <select
                            id="rol_profe"
                            value={formData.rol_profe}
                            onChange={handleChange}
                        >
                            <option value="INVESTIGADOR">Investigador</option>
                            <option value="MEDIO_TIEMPO">Profesor Medio Tiempo</option>
                            <option value="TIEMPO_COMPLETO">Profesor Tiempo Completo</option>
                        </select>
                    </div>

                    {serverMsg && (
                        <p style={{ color: '#ff6b6b', textAlign: 'center', marginTop: '0.5rem' }}>
                            {serverMsg}
                        </p>
                    )}

                    <button type="submit" className="btn-register" disabled={loading}>
                        {loading ? 'Registrando…' : 'Registrarse'}
                    </button>
                </form>

                <div className="footer-links">
                    ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
                </div>
            </div>
        </div>
    );
}

export { Register };
export default Register;
