function MainHeader({ username = 'Invitado' }) {
  return (
    <div className="main-header">
      <div className="main-profile-area">
        <span className="main-profile-name">{username}</span>
        <span className="main-profile-bubble" aria-hidden="true" />
      </div>
    </div>
  );
}

export default MainHeader;
