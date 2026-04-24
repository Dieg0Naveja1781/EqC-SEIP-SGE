const { useState, useEffect, useRef } = React;

function SubirDocumento() {
    const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') !== 'light');
    const [file, setFile] = useState(null); 
    const [dragging, setDragging] = useState(false); 
    const fileInputRef = useRef(null); 

    const [categoria, setCategoria] = useState('Docencia');
    const [formData, setFormData] = useState({});
    
    const [alertMsg, setAlertMsg] = useState({ visible: false, text: '', type: '' });
    const timerRef = useRef(null);

    useEffect(() => {
        const theme = isDark ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [isDark]);

    //función para mostrar las alertas
    const mostrarAlerta = (text, type = 'error') => {
        setAlertMsg({ visible: true, text, type });
        
        // Limpiamos el temporizador anterior si el usuario hace clics rápidos
        if (timerRef.current) clearTimeout(timerRef.current);
        
        // Ocultar automáticamente después de 3.5 segundos
        timerRef.current = setTimeout(() => {
            setAlertMsg({ visible: false, text: '', type: '' });
        }, 3500);
    };

    //Lógica para los archivos
    const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
    const handleDragLeave = () => { setDragging(false); };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) { 
            setFile(droppedFile);
            setFormData(prev => ({...prev, nombreNube: droppedFile.name.split('.')[0]}));
        }
    };

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) { 
            setFile(selectedFile);
            setFormData(prev => ({...prev, nombreNube: selectedFile.name.split('.')[0]}));
        }
    };

    const triggerFileSelect = () => { fileInputRef.current.click(); };

    //lógica del formulario
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCategoriaChange = (e) => {
        const nuevaCat = e.target.value;
        const nombrePreservado = formData.nombreNube;
        setCategoria(nuevaCat);
        setFormData({ nombreNube: nombrePreservado });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!file) {
            mostrarAlerta("⚠️ Por favor, selecciona un archivo primero.", "warning");
            return;
        }

        const camposObligatorios = {
            Docencia: ['nombreNube', 'cicloEscolar', 'claveMateria', 'crn', 'nombreMateria', 'carrera', 'grupo', 'cargaHoraria', 'sede'],
            Gestion: ['nombreNube', 'tipoActividad', 'nombreActividad', 'instancia', 'periodo', 'duracion', 'rol'],
            Titulacion: ['nombreNube', 'rolTesis', 'alumno', 'nivel', 'tituloTesis', 'fechaAsignacion', 'estatus', 'avance'],
            Produccion: ['nombreNube', 'tipoProducto', 'tituloTrabajo', 'estado', 'identificador', 'idiomas'],
            Tutoria: ['nombreNube', 'cicloTutoria', 'programa', 'tipoTutoria', 'numeroAlumnos', 'docAsignacion']
        };

        const requeridos = camposObligatorios[categoria];
        const faltantes = requeridos.filter(campo => !formData[campo] || formData[campo].toString().trim() === "");

        if (faltantes.length > 0) {
            mostrarAlerta(`❌ Faltan campos obligatorios para la categoría de ${categoria}.`, "error");
            return;
        }

        console.log("Datos enviados:", { categoria, ...formData, archivo: file.name });
        mostrarAlerta(`✅ ¡Archivo "${file.name}" subido con éxito!`, "success");

        // LIMPIEZA
        setFile(null);
        setFormData({});
        setCategoria('Docencia');
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const inputProps = (name, placeholder) => ({
        name,
        value: formData[name] || '',
        onChange: handleInputChange,
        placeholder
    });

    const renderCamposDinamicos = () => {
        switch (categoria) {
            case 'Docencia':
                return (
                    <>
                        <div className="field-group"><label>Ciclo Escolar</label><input type="text" {...inputProps('cicloEscolar', 'Ej: 2022-A, 2024-B')} /></div>
                        <div className="field-group"><label>Clave de Materia</label><input type="text" {...inputProps('claveMateria', 'Ej: IL803, C0410')} /></div>
                        <div className="field-group"><label>CRN</label><input type="text" {...inputProps('crn', 'Ej: 189895, 207575')} /></div>
                        <div className="field-group"><label>Nombre de Materia</label><input type="text" {...inputProps('nombreMateria', 'Ej: Desarrollo de Proyectos...')} /></div>
                        <div className="field-group"><label>Carrera/Programa</label><input type="text" {...inputProps('carrera', 'Ej: Abogado, Nutrición...')} /></div>
                        <div className="field-group"><label>Grupo</label><input type="text" {...inputProps('grupo', 'Ej: 5°, 10°, T/M')} /></div>
                        <div className="field-group"><label>Carga Horaria Totales</label><input type="text" {...inputProps('cargaHoraria', 'Ej: 80 horas totales')} /></div>
                        <div className="field-group"><label>Sede/Centro</label><input type="text" {...inputProps('sede', 'Ej: CUAltos, CUTonalá')} /></div>
                    </>
                );
            case 'Gestion':
                return (
                    <>
                        <div className="field-group"><label>Tipo de Actividad</label><input type="text" {...inputProps('tipoActividad', 'Ej: Jefe de Depto., Coordinador...')} /></div>
                        <div className="field-group"><label>Nombre de Actividad</label><input type="text" {...inputProps('nombreActividad', 'Ej: Asesoría "LA CUENCA"')} /></div>
                        <div className="field-group"><label>Instancia/Dependencia</label><input type="text" {...inputProps('instancia', 'Ej: Depto. de Estudios Organizacionales')} /></div>
                        <div className="field-group"><label>Periodo</label><input type="text" {...inputProps('periodo', 'Ej: Jan 10, 2022 o Ciclo 2024-A')} /></div>
                        <div className="field-group"><label>Duración</label><input type="text" {...inputProps('duracion', 'Ej: 4 horas')} /></div>
                        <div className="field-group"><label>Rol</label><input type="text" {...inputProps('rol', 'Ej: Presidente, Sinodal...')} /></div>
                    </>
                );
            case 'Titulacion':
                return (
                    <>
                        <div className="field-group"><label>Rol</label><input type="text" {...inputProps('rolTesis', 'Ej: Director o Codirector')} /></div>
                        <div className="field-group"><label>Nombre del Alumno</label><input type="text" {...inputProps('alumno', 'Ej: Karla Iveth Ayón Rendón')} /></div>
                        <div className="field-group"><label>Nivel Educativo</label><input type="text" {...inputProps('nivel', 'Ej: Licenciatura, Maestría...')} /></div>
                        <div className="field-group full-width"><label>Título de la Tesis</label><input type="text" {...inputProps('tituloTesis', 'Ej: "Comparación de la eficiencia..."')} /></div>
                        <div className="field-group"><label>Fecha de Asignación</label><input type="date" {...inputProps('fechaAsignacion', '')} /></div>
                        <div className="field-group"><label>Estatus</label><input type="text" {...inputProps('estatus', 'Ej: En proceso o Concluidas')} /></div>
                        <div className="field-group"><label>Avance Actual (%)</label><input type="text" {...inputProps('avance', 'Ej: 12.5%')} /></div>
                    </>
                );
            case 'Produccion':
                return (
                    <>
                        <div className="field-group"><label>Tipo de Producto</label><input type="text" {...inputProps('tipoProducto', 'Ej: Artículo indexado, Libro...')} /></div>
                        <div className="field-group"><label>Título del Trabajo</label><input type="text" {...inputProps('tituloTrabajo', 'Título oficial de la publicación')} /></div>
                        <div className="field-group"><label>Estado</label><input type="text" {...inputProps('estado', 'Ej: Publicado, En prensa...')} /></div>
                        <div className="field-group"><label>Identificador</label><input type="text" {...inputProps('identificador', 'Ej: ISSN, ISBN, DOI...')} /></div>
                        <div className="field-group full-width"><label>Idiomas Disponibles</label><input type="text" {...inputProps('idiomas', 'Ej: Español, Inglés...')} /></div>
                    </>
                );
            case 'Tutoria':
                return (
                    <>
                        <div className="field-group"><label>Ciclo de Tutoría</label><input type="text" {...inputProps('cicloTutoria', 'Ej: 2024-B')} /></div>
                        <div className="field-group"><label>Programa Académico</label><input type="text" {...inputProps('programa', 'Ej: Licenciatura en Administración')} /></div>
                        <div className="field-group"><label>Tipo de Tutoría</label><input type="text" {...inputProps('tipoTutoria', 'Ej: Individual o Grupal')} /></div>
                        <div className="field-group"><label>Número de Alumnos</label><input type="number" {...inputProps('numeroAlumnos', 'Ej: 46')} /></div>
                        <div className="field-group full-width"><label>Documento de Asignación</label><input type="text" {...inputProps('docAsignacion', 'Ej: Oficio emitido por Jefatura')} /></div>
                    </>
                );
            default: return null;
        }
    };

    return (
        <div className="dashboard-layout">
            
            {/* NOTIFICACIÓN FLOTANTE (TOAST) */}
            {alertMsg.visible && (
                <div style={{
                    position: 'fixed',
                    bottom: '30px',
                    right: '30px',
                    padding: '15px 25px',
                    borderRadius: '10px',
                    backgroundColor: alertMsg.type === 'success' ? '#2ecc71' : alertMsg.type === 'error' ? '#e74c3c' : '#f1c40f',
                    color: alertMsg.type === 'warning' ? '#333' : '#fff',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
                    zIndex: 9999,
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.3s ease',
                    transform: 'translateY(0)',
                }}>
                    {alertMsg.text}
                </div>
            )}

            <aside className="sidebar">
                <div style={{color: 'var(--color-main)', fontWeight: 'bold', fontSize: '1.4rem', marginBottom: '30px'}}>S&CSA</div>
                <nav>
                    <div className="nav-item">Página Principal</div>
                    <div className="nav-item">Listado de Archivos</div>
                    <div className="nav-item active">Subir Archivo</div>
                </nav>
            </aside>

            <main className="main-content">
                <header className="header-dashboard">
                    <label className="theme-toggle-switch">
                        <input type="checkbox" checked={isDark} onChange={() => setIsDark(!isDark)} />
                        <span className="slider"></span>
                    </label>
                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                        <span style={{fontWeight:'600'}}>Unusuario</span>
                        <div style={{width:'35px', height:'35px', borderRadius:'50%', background:'var(--color-main)'}}></div>
                    </div>
                </header>

                <div className="upload-section">
                    <div className="upload-card">
                        <h2 style={{marginTop:0}}>Subir Documento</h2>
                        <p style={{color:'var(--text-s)', marginBottom:'30px'}}>Los campos con * son obligatorios.</p>
                        
                        <input type="file" ref={fileInputRef} style={{display: 'none'}} onChange={handleFileSelect} />

                        <div 
                            className={`drop-zone ${dragging ? 'dragging' : ''}`}
                            onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={triggerFileSelect}
                            style={{ 
                                border: dragging ? '2px solid var(--text-p)' : '2px dashed var(--color-main)',
                                backgroundColor: dragging ? 'rgba(29, 154, 226, 0.2)' : 'rgba(29, 154, 226, 0.05)'
                            }}
                        >
                            <span style={{fontSize:'2.5rem'}}>{file ? '📄' : '📁'}</span>
                            <p>{file ? `Archivo: ${file.name}` : 'Selecciona o arrastra un archivo *'}</p>
                        </div>

                        <form className="form-grid" onSubmit={handleSubmit}>
                            <div className="field-group">
                                <label>Nombre en la nube *</label>
                                <input type="text" {...inputProps('nombreNube', 'Ej: Tarea_Prolog')} />
                            </div>
                            
                            <div className="field-group">
                                <label>Categoría *</label>
                                <select value={categoria} onChange={handleCategoriaChange}>
                                    <option value="Docencia">Docencia</option>
                                    <option value="Gestion">Gestión Académica</option>
                                    <option value="Titulacion">Gestión Académica (Titulación)</option>
                                    <option value="Produccion">Producción Académica</option>
                                    <option value="Tutoria">Tutoría</option>
                                </select>
                            </div>

                            <div className="full-width" style={{ borderBottom: '1px solid var(--border)', margin: '10px 0' }}></div>
                            
                            {renderCamposDinamicos()}

                            <div className="field-group full-width">
                                <label>Descripción (Opcional)</label>
                                <textarea {...inputProps('descripcion', 'Escribe notas adicionales aquí...')} rows="3"></textarea>
                            </div>

                            <button className="btn-submit full-width" type="submit">Subir a mi Unidad</button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<SubirDocumento />);