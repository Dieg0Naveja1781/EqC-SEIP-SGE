import { Link } from 'react-router-dom';
import '../auth/Auth.css';

function Dashboard() {
  const userRaw = localStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : null;

  return (
    <div className="dashboard-shell">
      <div className="dashboard-card">
        <h2 style={{ marginTop: 0 }}>Dashboard</h2>
        <p>
          Esta pantalla es solo de prueba para confirmar que el login funciona.
        </p>
        <p>
          Usuario autenticado: <strong>{user?.username || 'N/A'}</strong>
        </p>
        <p>
          Correo: <strong>{user?.email || 'N/A'}</strong>
        </p>
        <Link to="/login">Volver al login</Link>
      </div>
    </div>
  );
}

export default Dashboard;
