import { useEffect, useRef } from "react";
import { useTheme } from "../../../shared/context/ThemeContext";
import Footer from "../components/Footer";
import "../styles/landing.css";
import logo from "../../../assets/logotipo.png";
import logoOscuro from "../../../assets/Logotipo_o.png";
import bgStripes from "../../../assets/bg-stripes.png";
import bgIcons from "../../../assets/bg-icons.png";

function LandingPage() {
  const { isDark, toggleTheme } = useTheme();
  // Capas parallax del fondo del logo (se desplazan hacia abajo con el scroll)
  const layer1Ref = useRef(null);
  const layer2Ref = useRef(null);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;

          // Cada capa se mueve hacia abajo a velocidad distinta para
          // dar efecto de profundidad (la de atrás más lenta, la de delante más rápida).
          if (layer1Ref.current) {
            layer1Ref.current.style.transform = `translate3d(0, ${scrollY * 0.25}px, 0)`;
          }
          if (layer2Ref.current) {
            layer2Ref.current.style.transform = `translate3d(0, ${scrollY * 0.55}px, 0)`;
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
        <div className="navbar-brand-text">EQC Software</div>
        <div className="theme-switcher-container">
          <label className="theme-toggle-switch">
            <input
              type="checkbox"
              checked={isDark}
              onChange={toggleTheme}
            />
            <span className="theme-slider">
              <span className="theme-icon">☀️</span>
              <span className="theme-icon">🌙</span>
            </span>
          </label>
        </div>
      </header>

      <main className="lpage-main">
        {/* Capas decorativas que viven detrás del logo y se desplazan
            hacia abajo cuando el usuario scrollea. */}
        <div className="parallax-layer back" ref={layer1Ref} aria-hidden="true">
          <img src={bgStripes} alt="" />
        </div>
        <div className="parallax-layer front" ref={layer2Ref} aria-hidden="true">
          <img src={bgIcons} alt="" />
        </div>

        <div className="lpage-main-inner">
          <img src={isDark ? logoOscuro : logo} alt="Logotipo" className="main-logo" />

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
