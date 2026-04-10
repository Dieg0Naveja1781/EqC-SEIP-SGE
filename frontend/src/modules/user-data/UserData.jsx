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
        <div className="campo-grupo">
          <label>Nombre de Usuario</label>
          <input type="text" placeholder="Nombre del usuario" />
        </div>

        <div className="campo-grupo">
          <label>Correo Electrónico</label>
          <input type="email" placeholder="corrodeejemploxdxdxd@academicos.udg.mx" />
        </div>

        <div className="campo-grupo">
          <label>
            ID's Opcionales
            <span className="info-icon" title="Identificadores académicos opcionales">ⓘ</span>
          </label>
          <div className="campo-fila">
            <select className="select-id">
              <option value="orc">ORC ID</option>
              <option value="arxiv">arXiv Author</option>
              <option value="tresearcher">Thomson Researcher ID</option>
              <option value="pubmed">PubMed Author ID</option>
              <option value="openid">OpenID</option>
            </select>
            <input type="text" placeholder="987654321" className="input-id" />
          </div>
          <button className="btn-agregar-id">Agregar ID</button>
        </div>

        <div className="campo-grupo">
          <label>
            ID Personalizado
            <span className="info-icon" title="ID personalizado de tu organización">ⓘ</span>
          </label>
          <div className="campo-fila">
            <input type="text" placeholder="Ej. Empresa" className="input-empresa" />
            <input type="text" placeholder="ID personalizado" className="input-id" />
          </div>
          <button className="btn-agregar-id">Agregar ID</button>
        </div>

        <div className="campo-grupo">
  <label>Puesto</label>
  <div className="campo-fila campo-fila-between">
    <div className="campo-fila">
      <select className="select-puesto">
        <option value="docente">Docente</option>
        <option value="investigador">Investigador</option>
        <option value="administrativo">Administrativo</option>
      </select>
    </div>
    <button className="btn-gestionar">🔒 Gestionar Contraseña</button>
    <button className="btn-guardar">Guardar Cambios</button>
  </div>
</div>


      </div>

      <button onClick={manejarClick} className="btn-prueba">
        Probar Acción
      </button>
    </div>
  );
}