import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Styles/UserData.css";
import { useTheme } from "../../shared/context/ThemeContext";
import { userService } from "../../shared/api/userService";
import { DashboardLayout } from "../../shared/components/DashboardLayout";

export function UserData() {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    full_name: "",
    correo_profe: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await userService.getProfile();
        if (cancelled) return;
        if (data?.success) {
          const p = data.profile;
          setProfile(p);
          setForm({
            full_name: p.full_name || "",
            correo_profe: p.correo_profe || "",
          });
        } else {
          setMessage(data?.error || "No se pudo cargar el perfil");
        }
      } catch (err) {
        setMessage(
          err?.status === 401
            ? "Debes iniciar sesión para ver tu perfil"
            : err?.data?.error || "Error de conexión",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const data = await userService.updateProfile({
        full_name: form.full_name,
      });
      if (data?.success) {
        setMessage("Cambios guardados");
        setProfile(data.profile);
      } else {
        setMessage(data?.error || "No se pudo guardar");
      }
    } catch (err) {
      setMessage(err?.data?.error || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Perfil">
      <div className="user-container">
        <h2>Información del Usuario</h2>

        <div className="user-card">
          <div className="user-card-photo" aria-hidden="true">
            {(profile?.full_name || "?").trim().charAt(0).toUpperCase()}
          </div>
          <div className="user-card-info">
            <span className="profile-text">
              {loading ? "Cargando…" : profile?.full_name || "Sin nombre"}
            </span>
            <span className="profile-undertitle">
              {profile?.correo_profe || ""}
            </span>
          </div>
        </div>

        <div className="datos-editables">

          <div className="campo-grupo">
            <label>Nombre Completo</label>
            <input
              type="text"
              name="full_name"
              placeholder="Nombre completo"
              value={form.full_name}
              onChange={handleChange}
            />
          </div>

          <div className="campo-grupo">
            <label>Correo Electrónico</label>
            <input
              type="email"
              name="correo_profe"
              value={form.correo_profe}
              readOnly
            />
          </div>

          <div className="campo-grupo">
            <label>Preferencia de Tema</label>
            <div className="campo-fila" style={{ alignItems: "center" }}>
              <button
                type="button"
                className="btn-tema"
                onClick={toggleTheme}
                aria-label="Cambiar tema"
              >
                <span className="btn-tema-icon">{isDark ? "☀️" : "🌙"}</span>
                <span>{isDark ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}</span>
              </button>
            </div>
          </div>

          <div className="campo-grupo">
            <label>Acciones</label>
            <div className="campo-fila campo-fila-between">
              <button
                type="button"
                className="btn-gestionar"
                onClick={() => navigate("/perfil/cambiar-password")}
              >
                🔒 Gestionar Contraseña
              </button>
              <button
                type="button"
                className="btn-guardar"
                onClick={handleSave}
                disabled={saving || loading}
              >
                {saving ? "Guardando…" : "Guardar Cambios"}
              </button>
            </div>
          </div>

          {message && (
            <p style={{ textAlign: "center", marginTop: "0.75rem" }}>
              {message}
            </p>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
}