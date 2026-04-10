import "./Styles/UserData.css"; /** Importar archivo css */
import { useTheme } from "../../shared/context/ThemeContext"; /** Importar el hook de tema oscuro */

export function UserData() {
  const manejarClick = () => {
    alert("¡Botón funcionando!");
  };

  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="user-container">
      <nav>
        <button onClick={toggleTheme}>
          {isDark ? "☀️ Modo Claro" : "🌙 Modo Oscuro"}
        </button>
      </nav>
      <h2>Información del Usuario</h2>
      {/* Imagen del Usuario */}
      <div className="user-photo">
        <img src="" alt="Foto del Usuario" />
        <span className="profile-text">Nombre del Usuario</span>
        <span className="profile-undertitle">Docente</span>
      </div>
      <div className="datos-editables">
        <p>Nombre de usuario</p>
        <input type="text" placeholder="Nombre del usuario" />
        <p>Correo electrónico</p>
        <input type="email" placeholder="Correodepruebaxdxd@gmail.com" />
      </div>
      <button onClick={manejarClick} className="btn-prueba">
        Probar Acción
      </button>
    </div>
  );
}
