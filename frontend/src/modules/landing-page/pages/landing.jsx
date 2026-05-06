import { useEffect, useRef } from "react";
import Footer from "../components/Footer";
import "../styles/landing.css";
import logo from "../../../assets/logotipo.png";
import bgStripes from "../../../assets/bg-stripes.png";
import bgIcons from "../../../assets/bg-icons.png";

function LandingPage() {
  // Capas parallax del MAIN (las que ya existían)
  const layer1Ref = useRef(null);
  const layer2Ref = useRef(null);

  // Capas parallax del HEADER (nuevas)
  const headerLayer1Ref = useRef(null);
  const headerLayer2Ref = useRef(null);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;

          // Capas del main (mismas velocidades anteriores)
          if (layer1Ref.current) {
            layer1Ref.current.style.transform =
              `translateY(calc(-50% + ${scrollY * 0.15}px))`;
          }
          if (layer2Ref.current) {
            layer2Ref.current.style.transform =
              `translateY(calc(-50% + ${scrollY * 0.35}px))`;
          }

          // Capas del header: cada una se mueve a velocidad distinta para
          // dar el efecto de profundidad cuando el usuario scrollea.
          if (headerLayer1Ref.current) {
            headerLayer1Ref.current.style.transform =
              `translate3d(${-scrollY * 0.2}px, 0, 0)`;
          }
          if (headerLayer2Ref.current) {
            headerLayer2Ref.current.style.transform =
              `translate3d(${scrollY * 0.45}px, 0, 0)`;
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
        {/* Capas decorativas que crean el efecto de profundidad al scrollear */}
        <div className="navbar-parallax" aria-hidden="true">
          <div className="navbar-parallax-layer back" ref={headerLayer1Ref}>
            <img src={bgStripes} alt="" />
          </div>
          <div className="navbar-parallax-layer front" ref={headerLayer2Ref}>
            <img src={bgIcons} alt="" />
          </div>
        </div>

        <div className="navbar-brand-text">EQC Software</div>
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
          <img src={logo} alt="Logotipo" className="main-logo" />

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
