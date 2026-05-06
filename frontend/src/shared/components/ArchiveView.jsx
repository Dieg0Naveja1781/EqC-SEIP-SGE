import React from 'react';
import { useNavigate } from 'react-router-dom';
import "./Styles/ArchiveView.css";
import { DashboardLayout } from "./DashboardLayout";

export function ArchiveView() {
    const navigate = useNavigate();
    return (
        <DashboardLayout>
            <div className="archive-view-container">
                <div>
                    <button className="regreso" onClick={() => navigate(-1)}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M15 18L9 12L15 6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                    <div className="visible">
                        <div className="vista-pdf">Portada PDF</div>
                        <div className="info-archivo">
                            <h3>Información del Archivo</h3>
                            <p>Nombre: <strong>Expediente_123.pdf</strong></p>
                            <p>Tipo: <strong>Certificado</strong></p>
                            <p>Fecha: <strong>15/05/2023</strong></p>
                            <p>Descripción:</p>
                            <p><strong>Expediente relacionado con el caso XYZ</strong></p>
                            <div className="botones">
                                <button className="descargar">Descargar</button>
                                <button className="editar">Editar</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}


