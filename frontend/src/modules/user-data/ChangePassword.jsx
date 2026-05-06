import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "../../shared/api/userService";
import { DashboardLayout } from "../../shared/components/DashboardLayout";
import "./Styles/ChangePassword.css";

export function ChangePassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    actual: "",
    nueva: "",
    confirmar: "",
  });
  const [errors, setErrors] = useState({});
  const [serverMsg, setServerMsg] = useState("");
  const [serverMsgType, setServerMsgType] = useState("error");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) setErrors((prev) => ({ ...prev, [id]: null }));
  };

  // Mismas validaciones que Register: mínimo 8 caracteres y coincidencia.
  const validate = () => {
    const tempErrors = {};
    if (!form.actual) tempErrors.actual = "La contraseña actual es obligatoria";
    if (form.nueva.length < 8) tempErrors.nueva = "Mínimo 8 caracteres";
    if (form.nueva !== form.confirmar) {
      tempErrors.confirmar = "Las contraseñas no coinciden";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerMsg("");
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await userService.changePassword(form.actual, form.nueva);
      if (res?.success) {
        setServerMsg("Contraseña actualizada correctamente. Redirigiendo…");
        setServerMsgType("success");
        setTimeout(() => navigate("/perfil"), 1200);
      } else {
        setServerMsg(res?.error || "No se pudo cambiar la contraseña");
        setServerMsgType("error");
      }
    } catch (err) {
      setServerMsg(
        err?.status === 401
          ? "Debes iniciar sesión para cambiar tu contraseña"
          : err?.data?.error || "Error de conexión con el servidor"
      );
      setServerMsgType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Cambiar Contraseña">
      <div className="change-password-page">
        <div className="change-password-card">
          <h2>Cambiar Contraseña</h2>

          <form onSubmit={handleSubmit} noValidate>
            <div className="cp-group">
              <label htmlFor="actual">Contraseña Actual</label>
              <input
                type="password"
                id="actual"
                value={form.actual}
                onChange={handleChange}
                className={errors.actual ? "input-error" : ""}
              />
              {errors.actual && <span className="cp-error">{errors.actual}</span>}
            </div>

            <div className="cp-group">
              <label htmlFor="nueva">Contraseña Nueva</label>
              <input
                type="password"
                id="nueva"
                value={form.nueva}
                onChange={handleChange}
                className={errors.nueva ? "input-error" : ""}
              />
              {errors.nueva && <span className="cp-error">{errors.nueva}</span>}
            </div>

            <div className="cp-group">
              <label htmlFor="confirmar">Repetir la Contraseña Nueva</label>
              <input
                type="password"
                id="confirmar"
                value={form.confirmar}
                onChange={handleChange}
                className={errors.confirmar ? "input-error" : ""}
              />
              {errors.confirmar && (
                <span className="cp-error">{errors.confirmar}</span>
              )}
            </div>

            {serverMsg && (
              <p
                className={`cp-server-msg ${serverMsgType}`}
                style={{ textAlign: "center", marginTop: "0.5rem" }}
              >
                {serverMsg}
              </p>
            )}

            <button type="submit" className="cp-submit" disabled={loading}>
              {loading ? "Cambiando…" : "Cambiar Contraseña"}
            </button>
          </form>

          <div className="cp-footer">
            <a href="#">¿Olvidaste tu contraseña?</a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
