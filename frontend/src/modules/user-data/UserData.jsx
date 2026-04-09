import './Styles/UserData.css'; /** Importar archivo css */

export function UserData() {
    const manejarClick = () => {
        alert("¡Botón funcionando!");
    };

    return (
        <div className="user-container">
            <h2>Información del Usuario</h2>
            {/* Imagen del Usuario */}
            <div className="user-photo">
                <img src="" alt="Foto del Usuario" />
                <span className="profile-text">Nombre del Usuario</span>
                <span className="profile-undertitle">Docente</span>
            </div>
            <p>Aquí aparecerán los datos del usuario pronto...</p>      
            {/* Este es el botón que pediste */}
            <button onClick={manejarClick} className="btn-prueba">
                Probar Acción
            </button>
        </div>
    );
}