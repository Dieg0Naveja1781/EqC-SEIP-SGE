import Footer from "../components/Footer";
import "../styles/landing.css";

function LandingPage() {
  return (
    <div className="lpage">
      <header className="navbar">
        <div className="navbar-brand">EQC Software</div>
      </header>

      <main className="main-content">
        <h1>Texto de ejemplo Diego Armando Naveja López</h1>

        <div className="auth-buttons">
          <a href="/login" className="btn btn-primary">Iniciar Sesión</a>

          <div className="register-group">
            <span className="register-hint">¿No tienes cuenta?</span>
            <a href="/register" className="btn btn-outline">Crear Cuenta</a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default LandingPage;

