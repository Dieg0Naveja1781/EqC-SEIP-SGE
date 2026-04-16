const quickActions = [
  { id: 'new-file', label: 'Nuevo', icon: 'N' },
  { id: 'search', label: 'Buscar', icon: 'B' },
  { id: 'history', label: 'Historial', icon: 'H' },
  { id: 'favorites', label: 'Favoritos', icon: 'F' },
  { id: 'settings', label: 'Ajustes', icon: 'A' },
];

function QuickActions() {
  const handleAction = (actionId) => {
    console.log(`Accion ejecutada: ${actionId}`);
  };

  return (
    <section className="main-section">
      <h1 className="main-title">Pagina Principal</h1>

      <div className="quick-actions-row">
        {quickActions.map((action) => (
          <button
            className="quick-action-square"
            type="button"
            key={action.id}
            onClick={() => handleAction(action.id)}
          >
            <span className="quick-action-icon" aria-hidden="true">
              {action.icon}
            </span>
            <span className="quick-action-label">{action.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default QuickActions;
