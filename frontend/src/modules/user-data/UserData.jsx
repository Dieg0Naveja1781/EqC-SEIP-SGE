import { useEffect, useState } from "react";
import "./Styles/UserData.css";
import { useTheme } from "../../shared/context/ThemeContext";
import { userService } from "../../shared/api/userService";

export function UserData() {
  const { isDark, toggleTheme } = useTheme();

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    full_name: "",
    correo_profe: "",
    rol_profe: "INVESTIGADOR",
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
            rol_profe: p.rol_profe || "INVESTIGADOR",
          });
        } else {
          setMessage(data?.error || "No se pudo cargar el perfil");
        }
      } catch (err) {
        setMessage(
          err?.status === 401
            ? "Debes iniciar sesión para ver tu perfil"
            : err?.data?.error || "Error de conexión"
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
        rol_profe: form.rol_profe,
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
    <div className="user-container">
      <nav>
        <button onClick={toggleTheme}>
          {isDark ? "☀️ Modo Claro" : "🌙 Modo Oscuro"}
        </button>
      </nav>
      <h2>Información del Usuario</h2>

      <div className="user-photo">
        <img src="" alt="Foto del Usuario" />
        <span className="profile-text">
          {loading ? "Cargando…" : profile?.full_name || "Sin nombre"}
        </span>
        <span className="profile-undertitle">
          {profile?.rol_profe || "Docente"}
        </span>
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
          <label>Puesto</label>
          <div className="campo-fila campo-fila-between">
            <div className="campo-fila">
              <select
                className="select-puesto"
                name="rol_profe"
                value={form.rol_profe}
                onChange={handleChange}
              >
                <option value="INVESTIGADOR">Investigador</option>
                <option value="MEDIO_TIEMPO">Profesor Medio Tiempo</option>
                <option value="TIEMPO_COMPLETO">Profesor Tiempo Completo</option>
              </select>
              <button type="button" className="btn-gestionar">
                🔒 Gestionar Contraseña
              </button>
            </div>
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
          <p style={{ textAlign: "center", marginTop: "0.75rem" }}>{message}</p>
        )}
      </div>
    </div>
  );
}
