function MainHeader({ username = 'Invitado' }) {
  return (
    <div className="main-header">
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
