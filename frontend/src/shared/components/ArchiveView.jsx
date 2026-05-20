import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import "./Styles/ArchiveView.css";
import { DashboardLayout } from "./DashboardLayout";
import { apiClient } from "../api/apiClient";

export function ArchiveView() {
    const navigate = useNavigate();
    const location = useLocation();

    // Si no hay datos, usamos valores por defecto para evitar errores
    const doc = location.state?.documento || {
        titulo_doc: "Sin nombre",
        categoria: "Docencia",
        fecha_creacion: null,
        metadatos: {},
        descripcion: ""
    };

    // Un expediente y un documento se visualizan de forma distinta.
    const esExpediente = doc.type === "expediente";

    const formatFecha = (valor) =>
        valor ? new Date(valor).toLocaleDateString("es-MX") : "Sin fecha";

    const fechaTxt = formatFecha(doc.fecha_creacion);

    // --- Portada del documento (primera página del PDF) ---
    const idDoc = doc.id_doc;
    // null = todavía cargando | '' = no hay portada | url = portada lista
    const [portadaSrc, setPortadaSrc] = useState(null);

    useEffect(() => {
        // Los expedientes no tienen un archivo PDF; no se carga portada.
        if (esExpediente || !idDoc) {
            setPortadaSrc('');
            return;
        }

        let urlCreada = null;
        let cancelado = false;

        const cargarPortada = async () => {
            try {
                // apiClient.download usa la misma autenticación que el
                // resto del proyecto (cookie de sesión + X-Profesor-Id)
                const blob = await apiClient.download(
                    `/documentos/${idDoc}/portada/`
                );
                urlCreada = URL.createObjectURL(blob);
                if (!cancelado) {
                    setPortadaSrc(urlCreada);
                } else {
                    URL.revokeObjectURL(urlCreada);
                }
            } catch (error) {
                if (!cancelado) setPortadaSrc('');
            }
        };

        cargarPortada();

        // Limpieza: liberar la imagen de memoria al salir
        return () => {
            cancelado = true;
            if (urlCreada) URL.revokeObjectURL(urlCreada);
        };
    }, [idDoc, esExpediente]);

    const ETIQUETAS = {
        cicloEscolar: "Ciclo Escolar",
        claveMateria: "Clave de Materia",
        crn: "CRN",
        nombreMateria: "Nombre de Materia",
        carrera: "Carrera/Programa",
        grupo: "Grupo",
        cargaHoraria: "Carga Horaria Totales",
        sede: "Sede/Centro",
        tipoActividad: "Tipo de Actividad",
        nombreActividad: "Nombre de Actividad",
        instancia: "Instancia/Dependencia",
        periodo: "Periodo",
        duracion: "Duración",
        rol: "Rol",
        rolTesis: "Rol",
        alumno: "Nombre del Alumno",
        nivel: "Nivel Educativo",
        tituloTesis: "Título de la Tesis",
        fechaAsignacion: "Fecha de Asignación",
        estatus: "Estatus",
        avance: "Avance Actual (%)",
        tipoProducto: "Tipo de Producto",
        tituloTrabajo: "Título del Trabajo",
        estado: "Estado",
        identificador: "Identificador",
        idiomas: "Idiomas Disponibles",
        cicloTutoria: "Ciclo de Tutoría",
        programa: "Programa Académico",
        tipoTutoria: "Tipo de Tutoría",
        numeroAlumnos: "Número de Alumnos",
        docAsignacion: "Documento de Asignación"
    };

    return (
        <DashboardLayout title="Vista de Archivo">
            <div className="archive-view-container">
                <div className="visible">
                    <div className="regreso_y_pdf">
                        <button className="regreso" onClick={() => navigate(-1)}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15 18L9 12L15 6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                        <div className="vista-pdf">
                            {esExpediente ? (
                                <>
                                    <span style={{ fontSize: "3rem" }}>📋</span>
                                    <p>Expediente</p>
                                </>
                            ) : portadaSrc === null ? (
                                <p>Cargando portada...</p>
                            ) : portadaSrc ? (
                                <img
                                    src={portadaSrc}
                                    alt="Portada del documento"
                                    style={{ maxWidth: "100%", maxHeight: "100%" }}
                                />
                            ) : (
                                <>
                                    <span style={{ fontSize: "3rem" }}>📄</span>
                                    <p>Previsualización del PDF</p>
                                </>
                            )}
                        </div>
                    </div>

                    {esExpediente ? (
                        <div className="info-archivo">
                            <h3>Información del Expediente</h3>

                            <div className="info-grid">
                                <p>Nombre: <strong>{doc.titulo_doc}</strong></p>
                                <p>Categoría: <span className="badge-categoria"><strong>Expediente</strong></span></p>
                                <p>Fecha de creación: <strong>{fechaTxt}</strong></p>
                                {doc.fecha_expedicion && (
                                    <p>Fecha de expedición: <strong>{formatFecha(doc.fecha_expedicion)}</strong></p>
                                )}
                                <p>Documentos: <strong>{doc.documentos_count ?? 0}</strong></p>
                            </div>

                            {doc.descripcion && (
                                <>
                                    <hr />
                                    <p>Descripción:</p>
                                    <p className="descripcion-texto"><strong>{doc.descripcion}</strong></p>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="info-archivo">
                            <h3>Información del Archivo</h3>

                            <div className="info-grid">
                                <p>Nombre: <strong>{doc.titulo_doc}</strong></p>
                                <p>Categoría: <span className="badge-categoria"><strong>{doc.categoria}</strong></span></p>
                                <p>Fecha: <strong>{fechaTxt}</strong></p>
                            </div>

                            <hr />

                            <h4>Detalles Específicos</h4>
                            <div className="metadatos-render">
                                {Object.entries(doc.metadatos || {})
                                    .filter(([key]) => !key.startsWith('_'))
                                    .map(([key, value]) => (
                                        <p key={key}>
                                            {ETIQUETAS[key] || key}: <strong>{value}</strong>
                                        </p>
                                    ))}
                            </div>

                            {doc.descripcion && (
                                <>
                                    <hr />
                                    <p>Descripción:</p>
                                    <p className="descripcion-texto"><strong>{doc.descripcion}</strong></p>
                                </>
                            )}

                            <div className="botones">
                                <button className="descargar">Descargar</button>
                                <button className="editar" onClick={() => navigate('/editar_doc', { state: { documento: doc } })}>Editar</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
