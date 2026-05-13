import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import "./Styles/ArchiveView.css";
import { DashboardLayout } from "./DashboardLayout";

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

    const fechaTxt = doc.fecha_creacion
        ? new Date(doc.fecha_creacion).toLocaleDateString("es-MX")
        : "Sin fecha";

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
                            <span style={{fontSize: "3rem"}}>📄</span>
                            <p>Previsualización del PDF</p>
                        </div>
                    </div>

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
                            {Object.entries(doc.metadatos || {}).map(([key, value]) => (
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
                </div>
            </div>
        </DashboardLayout>
    );
}