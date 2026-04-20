import React from 'react';

/**
 * Componente de carga/spinner
 * Se muestra mientras se cargan datos o se verifica la autenticación
 */
const Loading = ({ message = 'Cargando...' }) => {
  return (
    <div style={styles.container}>
      <div style={styles.spinner}></div>
      <p style={styles.message}>{message}</p>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-primary, #ffffff)',
    color: 'var(--text-primary, #000000)',
  },
  spinner: {
    border: '4px solid var(--bg-secondary, #f3f3f3)',
    borderTop: '4px solid var(--color-500, #3498db)',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px',
  },
  message: {
    fontSize: '16px',
    fontWeight: '500',
    margin: 0,
  },
};

// Agregar la animación CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default Loading;
