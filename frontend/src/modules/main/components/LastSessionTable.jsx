import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LastSessionTable({ records = [], loading = false }) {
  const [sortDirection, setSortDirection] = useState('desc');
  const navigate = useNavigate();
  const getActivityDate = (record) => record.fecha_subida || record.fecha_creacion;

  const handleVerDocumento = (file) => {
      navigate("/archive_view", { state: { documento: file } });
  };

  const sortedRows = useMemo(() => {
    return [...records].sort((a, b) => {
      // Usar fecha_subida del backend
      const dateA = new Date(getActivityDate(a)).getTime();
      const dateB = new Date(getActivityDate(b)).getTime();
      return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [records, sortDirection]);

  const toggleSort = () => {
    setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
  };

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <section className="main-section">
      <h2 className="section-title">Última Sesión</h2>

      <div className="table-widget">
        <div className="table-controls">
          <button type="button" className="sort-btn" onClick={toggleSort}>
            Ordenar: {sortDirection === 'desc' ? 'Reciente primero' : 'Antiguo primero'}
          </button>
        </div>

        <table className="session-table">
          <thead>
            <tr>
              <th>Nombre del Documento</th>
              <th>Ultima Modificacion</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan="2" className="empty-table-row">
                  Cargando documentos...
                </td>
              </tr>
            )}

            {!loading && sortedRows.length === 0 && (
              <tr>
                <td colSpan="2" className="empty-table-row">
                  No hay documentos registrados en esta sesion.
                </td>
              </tr>
            )}

            {!loading && sortedRows.map((row, index) => (
              <tr
                key={`${row.id_doc}-${index}`}
                className={row.type === "expediente" ? "expediente-row" : ""}
                onClick={() => handleVerDocumento(row)}
                style={{ cursor: "pointer" }}
              >
                <td>{row.titulo_doc}</td>
                <td>{formatDate(getActivityDate(row))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default LastSessionTable;
