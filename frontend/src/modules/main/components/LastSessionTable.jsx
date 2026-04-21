import { useMemo, useState } from 'react';

function LastSessionTable({ records = [] }) {
  const [sortDirection, setSortDirection] = useState('desc');

  const sortedRows = useMemo(() => {
    return [...records].sort((a, b) => {
      const dateA = new Date(a.lastModified).getTime();
      const dateB = new Date(b.lastModified).getTime();
      return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [records, sortDirection]);

  const toggleSort = () => {
    setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
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
            {sortedRows.length === 0 && (
              <tr>
                <td colSpan="2" className="empty-table-row">
                  No hay documentos registrados en esta sesion.
                </td>
              </tr>
            )}

            {sortedRows.map((row, index) => (
              <tr key={`${row.documentName}-${index}`}>
                <td>{row.documentName}</td>
                <td>{row.lastModified}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default LastSessionTable;
