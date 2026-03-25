import './Styles/UserData.css'; /** Importar archivo css */

export function UserData() {
    const manejarClick = () => {
        alert("¡Botón funcionando!");
    };

    return (
        <div className="user-container">
        <h2>Información del Usuario</h2>
        <p>Aquí aparecerán los datos del expediente pronto...</p>      
        {/* Este es el botón que pediste */}
        <button onClick={manejarClick} className="btn-prueba">
            Probar Acción
        </button>
        </div>
    );
}