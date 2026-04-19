import { useTheme } from '../../../shared/context/ThemeContext';

function MainHeader({ username = 'Invitado' }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="main-header">
      <div className="main-left-tools">
        <button type="button" className="main-theme-toggle" onClick={toggleTheme}>
          {isDark ? '☀️ Modo Claro' : '🌙 Modo Oscuro'}
        </button>
      </div>

      <div className="main-search-pill" role="search" aria-label="Busqueda rapida">
        <span className="main-search-icon" aria-hidden="true">|||</span>
        <span className="main-search-text">Busqueda Rapida</span>
        <span className="main-search-icon" aria-hidden="true">Q</span>
      </div>

      <div className="main-profile-area">
        <span className="main-profile-name">{username}</span>
        <span className="main-profile-bubble" aria-hidden="true" />
      </div>
    </div>
  );
}

export default MainHeader;
