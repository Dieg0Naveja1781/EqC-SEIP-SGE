import { useEffect, useRef } from "react";
import Footer from "../components/Footer";
import "../styles/landing.css";
import logo from "../../../assets/logotipo.png";
import bgStripes from "../../../assets/bg-stripes.png";
import bgIcons from "../../../assets/bg-icons.png";

function LandingPage() {
  const layer1Ref = useRef(null); 
  const layer2Ref = useRef(null); 

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          
          // Ajustamos las velocidades para un efecto más elegante
          if (layer1Ref.current) {
          layer1Ref.current.style.transform =
            `translateY(calc(-50% + ${scrollY * 0.15}px))`;
          }
          if (layer2Ref.current) {
            layer2Ref.current.style.transform =
        `translateY(calc(-50% + ${scrollY * 0.35}px))`;
}
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="lpage">
      <header className="navbar">
        <div className="navbar-brand">
          <img src={logo} alt="Logo" className="navbar-logo" />
        </div>
      </header>

      <main className="main-content">
        {/* Capa de fondo (se mueve más lento) */}
        <div className="parallax-layer" ref={layer1Ref}>
          <img src={bgStripes} alt="" aria-hidden="true" />
        </div>

        {/* Capa frontal (se mueve un poco más rápido) */}
        <div className="parallax-layer" ref={layer2Ref}>
          <img src={bgIcons} alt="" aria-hidden="true" />
        </div>

        <div className="main-content-inner">
          <h1>Texto de ejemplo Diego Armando Naveja López</h1>

          <div className="auth-buttons">
            <a href="/login" className="btn btn-primary">Iniciar Sesión</a>

            <div className="register-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
              <span className="register-hint" style={{ fontSize: '0.85rem', color: '#374151' }}>
                ¿No tienes cuenta?
              </span>
              <a href="/register" className="btn btn-outline">Crear Cuenta</a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default LandingPage;