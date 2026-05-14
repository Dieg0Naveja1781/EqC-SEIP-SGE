import { useEffect, useRef } from "react";
import { useTheme } from "../../../shared/context/ThemeContext";
import Footer from "../components/Footer";
import "../styles/landing.css";
import logo from "../../../assets/logotipo.png";
import logoOscuro from "../../../assets/Logotipo_o.png";
import bgStripes from "../../../assets/bg-stripes.png";
import bgIconsClaro from "../../../assets/bg-icons.png";
import bgIconsOscuro from "../../../assets/bg-icons_o.png";

function LandingPage() {
  const { isDark, toggleTheme } = useTheme();
  const layer1Ref = useRef(null);
  const layer2Ref = useRef(null);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;

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
        <div className="parallax-layer back" ref={layer1Ref} aria-hidden="true">
          <img src={bgStripes} alt="" />
        </div>

        {/* 👉 Aquí está el cambio: condicional según modo */}
        <div className="parallax-layer front" ref={layer2Ref} aria-hidden="true">
          <img src={isDark ? bgIconsOscuro : bgIconsClaro} alt="" />
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
