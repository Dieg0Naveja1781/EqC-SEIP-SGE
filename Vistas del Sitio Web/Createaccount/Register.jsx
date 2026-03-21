const { useState, useEffect } = React;

function Register() {
    //Leer el estado inicial desde LocalStorage  IGUAL AUN EN DESARROLLO
    const [isDark, setIsDark] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme ? savedTheme === 'dark' : true;
    });

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });


    useEffect(() => {
        const theme = isDark ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        
        //Guardar cada que cambie
        localStorage.setItem('theme', theme);
    }, [isDark]);

    // Estado para mensajes de error
    const [errors, setErrors] = useState({});

    // Sincronizar el atributo data-theme con el estado
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    }, [isDark]);

    // Manejador de cambios en los inputs
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
        // Limpiar el error del campo cuando el usuario vuelve a escribir
        if (errors[e.target.id]) {
            setErrors({ ...errors, [e.target.id]: null });
        }
    };

    // Validación básica
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

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            console.log("Datos enviados correctamente:", formData);
            alert("¡Cuenta creada con éxito!");
        }
    };

    return (
        /* Contenedor principal que aplica el Flexbox del CSS */
        <div className="register-page-container">
            
            {/* Switch de Tema (Sol/Luna) */}
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

            {/* Tarjeta de Registro */}
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

                    <button type="submit" className="btn-register">Registrarse</button>
                </form>

                <div className="footer-links">
                    ¿Ya tienes cuenta? <a href="../Login/Login.html">Inicia sesión aquí</a>
                </div>
            </div>
        </div>
    );
}

// Renderizado en el DOM
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Register />);