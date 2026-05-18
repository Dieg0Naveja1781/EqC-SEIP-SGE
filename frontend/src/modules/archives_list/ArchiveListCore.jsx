import React from "react";
import "./Styles/archive_list.css";
import { MONTHS, YEARS_ARRAY } from "./useArchiveData";
import descargasIcon from "../../assets/descargas.svg";
import basuraIcon from "../../assets/basura.svg";
import archivoIcon from "../../assets/archivo.svg";
import nuevaCarpetaIcon from "../../assets/nueva-carpeta.svg";

export function ArchiveListCore({
  archiveData,
  onVerDocumento,
  pickerMode = false,
  selectedFiles,
  onToggleSelect,
}) {
  const {
    files, categorias, categoriasCustom,
    loading, errorMsg,
    folderPath, setCurrentFolderId, setFolderPath,
    tipoFiltroFecha, setTipoFiltroFecha,
    rangoInicio, setRangoInicio,
    rangoFin, setRangoFin,
    inicioMes, setInicioMes,
    inicioAnio, setInicioAnio,
    finMes, setFinMes,
    finAnio, setFinAnio,
    tiposSeleccionados,
    filtrosAvanzados, setFiltrosAvanzados,
    ordenarPor, setOrdenarPor,
    showModal, folderName, setFolderName,
    showMoveModal,
    elementoAMover,
    carpetasDestino,
    destinoSeleccionado, setDestinoSeleccionado,
    moving,
    deletePrompt,
    deletePromptRef,
    fileInputRef,
    showFiles,
    handleDownload,
    handleOpenDeletePrompt,
    handleCancelDelete,
    handleConfirmDelete,
    handleNuevaCarpeta,
    handleConfirmFolder,
    handleCancelFolder,
    handleMover,
    handleConfirmMove,
    handleCancelMove,
    handleArchivoSeleccionado,
    handleTipoChange,
    toggleSortNombre,
    toggleSortFecha,
  } = archiveData;

  const handleRowClick = (file) => {
    if (file.type === "folder") {
      onVerDocumento(file);
    } else if (pickerMode) {
      onToggleSelect?.(file);
    } else {
      onVerDocumento(file);
    }
  };

  return (
    <div className="archive_list_container_inner">
      {!pickerMode && (
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          style={{ display: "none" }}
          onChange={handleArchivoSeleccionado}
        />
      )}

      <div className="content">

        {/* === BREADCRUMBS === */}
        <div className="breadcrumbs" style={{ padding: "10px 0", fontSize: "16px", color: "#ccc" }}>
          <span
            onClick={() => { setFolderPath([]); setCurrentFolderId(null); }}
            style={{ cursor: "pointer", color: "#5aedf1", fontWeight: "bold" }}
          >
            Raíz
          </span>
          {folderPath.map((f, i) => (
            <React.Fragment key={f.id}>
              <span style={{ margin: "0 8px", color: "#666" }}> {">"} </span>
              <span
                onClick={() => {
                  const newPath = folderPath.slice(0, i + 1);
                  setFolderPath(newPath);
                  setCurrentFolderId(f.id);
                }}
                style={{
                  cursor: i === folderPath.length - 1 ? "default" : "pointer",
                  color: i === folderPath.length - 1 ? "#fff" : "#5aedf1",
                  fontWeight: i === folderPath.length - 1 ? "normal" : "bold",
                }}
              >
                {f.name}
              </span>
            </React.Fragment>
          ))}
        </div>

        {/* === FILTER PANEL === */}
        <div className="filters_panel">
          {filtrosAvanzados ? (
            <div className="simple_view">
              <div className="simple_header">
                <h3 className="col_nombre">
                  Nombre{" "}
                  <button className="btn_sort" onClick={toggleSortNombre}>
                    {ordenarPor === "Nombre A-Z" ? "↓" : ordenarPor === "Nombre Z-A" ? "↑" : "↑↓"}
                  </button>
                </h3>
                <h3 className="col_fecha">
                  Fecha{" "}
                  <button className="btn_sort" onClick={toggleSortFecha}>
                    {ordenarPor === "Fecha ↑" ? "↑" : ordenarPor === "Fecha ↓" ? "↓" : "↑↓"}
                  </button>
                </h3>
                <button className="btn_advanced" onClick={() => setFiltrosAvanzados(false)}>
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                    <path d="M11.2691 4.41115C11.5006 3.89177 11.6164 3.63208 11.7776 3.55211C11.9176 3.48263 12.082 3.48263 12.222 3.55211C12.3832 3.63208 12.499 3.89177 12.7305 4.41115L14.5745 8.54808C14.643 8.70162 14.6772 8.77839 14.7302 8.83718C14.777 8.8892 14.8343 8.93081 14.8982 8.95929C14.9705 8.99149 15.0541 9.00031 15.2213 9.01795L19.7256 9.49336C20.2911 9.55304 20.5738 9.58288 20.6997 9.71147C20.809 9.82316 20.8598 9.97956 20.837 10.1342C20.8108 10.3122 20.5996 10.5025 20.1772 10.8832L16.8125 13.9154C16.6877 14.0279 16.6252 14.0842 16.5857 14.1527C16.5507 14.2134 16.5288 14.2807 16.5215 14.3503C16.5132 14.429 16.5306 14.5112 16.5655 14.6757L17.5053 19.1064C17.6233 19.6627 17.6823 19.9408 17.5989 20.1002C17.5264 20.2388 17.3934 20.3354 17.2393 20.3615C17.0619 20.3915 16.8156 20.2495 16.323 19.9654L12.3995 17.7024C12.2539 17.6184 12.1811 17.5765 12.1037 17.56C12.0352 17.5455 11.9644 17.5455 11.8959 17.56C11.8185 17.5765 11.7457 17.6184 11.6001 17.7024L7.67662 19.9654C7.18404 20.2495 6.93775 20.3915 6.76034 20.3615C6.60623 20.3354 6.47319 20.2388 6.40075 20.1002C6.31736 19.9408 6.37635 19.6627 6.49434 19.1064L7.4341 14.6757C7.46898 14.5112 7.48642 14.429 7.47814 14.3503C7.47081 14.2807 7.44894 14.2134 7.41394 14.1527C7.37439 14.0842 7.31195 14.0279 7.18708 13.9154L3.82246 10.8832C3.40005 10.5025 3.18884 10.3122 3.16258 10.1342C3.13978 9.97956 3.19059 9.82316 3.29993 9.71147C3.42581 9.58288 3.70856 9.55304 4.27406 9.49336L8.77835 9.01795C8.94553 9.00031 9.02911 8.99149 9.10139 8.95929C9.16534 8.93081 9.2226 8.8892 9.26946 8.83718C9.32241 8.77839 9.35663 8.70162 9.42508 8.54808L11.2691 4.41115Z" stroke="#5aedf1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Filtros Avanzados
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="advanced_filters">
                <div className="filters_row">
                  <div className="filters">
                    <span className="filter_label">Filtrar por</span>
                    <select
                      className="filter_select"
                      value={tipoFiltroFecha}
                      onChange={(e) => {
                        setTipoFiltroFecha(e.target.value);
                        setRangoInicio("");
                        setRangoFin("");
                        setInicioMes("");
                        setInicioAnio("");
                        setFinMes("");
                        setFinAnio("");
                      }}
                    >
                      <option value="Ninguno">Ninguno</option>
                      <option value="Por Mes">Por Mes</option>
                      <option value="Por Año">Por Año</option>
                      <option value="Por Mes y Año">Por Mes y Año</option>
                    </select>
                  </div>

                  {tipoFiltroFecha === "Por Mes" && (
                    <>
                      <div className="filters">
                        <h2 className="filter_label">Mes Inicio</h2>
                        <select className="filter_select" value={rangoInicio} onChange={(e) => setRangoInicio(e.target.value)}>
                          <option value="">Seleccionar</option>
                          {MONTHS.map((m, i) =>
                            rangoFin && i + 1 > parseInt(rangoFin) ? null : (
                              <option key={m} value={i + 1}>{m}</option>
                            )
                          )}
                        </select>
                      </div>
                      <div className="filters">
                        <h2 className="filter_label">Mes Fin</h2>
                        <select className="filter_select" value={rangoFin} onChange={(e) => setRangoFin(e.target.value)}>
                          <option value="">Seleccionar</option>
                          {MONTHS.map((m, i) =>
                            rangoInicio && i + 1 < parseInt(rangoInicio) ? null : (
                              <option key={m} value={i + 1}>{m}</option>
                            )
                          )}
                        </select>
                      </div>
                    </>
                  )}

                  {tipoFiltroFecha === "Por Año" && (
                    <>
                      <div className="filters">
                        <h2 className="filter_label">Año Inicio</h2>
                        <select className="filter_select" value={rangoInicio} onChange={(e) => setRangoInicio(e.target.value)}>
                          <option value="">Seleccionar</option>
                          {YEARS_ARRAY.map((year) =>
                            rangoFin && year > parseInt(rangoFin) ? null : (
                              <option key={year}>{year}</option>
                            )
                          )}
                        </select>
                      </div>
                      <div className="filters">
                        <h2 className="filter_label">Año Fin</h2>
                        <select className="filter_select" value={rangoFin} onChange={(e) => setRangoFin(e.target.value)}>
                          <option value="">Seleccionar</option>
                          {YEARS_ARRAY.map((year) =>
                            rangoInicio && year < parseInt(rangoInicio) ? null : (
                              <option key={year}>{year}</option>
                            )
                          )}
                        </select>
                      </div>
                    </>
                  )}

                  {tipoFiltroFecha === "Por Mes y Año" && (
                    <>
                      <div className="filters">
                        <h2 className="filter_label">Inicio</h2>
                        <div style={{ display: "flex", gap: "5px" }}>
                          <select className="filter_select" value={inicioMes} onChange={(e) => setInicioMes(e.target.value)}>
                            <option value="">Mes</option>
                            {MONTHS.map((m, i) =>
                              finAnio && finMes && inicioAnio && parseInt(inicioAnio) === parseInt(finAnio) && i + 1 > parseInt(finMes) ? null : (
                                <option key={m} value={i + 1}>{m}</option>
                              )
                            )}
                          </select>
                          <select className="filter_select" value={inicioAnio} onChange={(e) => setInicioAnio(e.target.value)}>
                            <option value="">Año</option>
                            {YEARS_ARRAY.map((year) =>
                              finAnio && (year > parseInt(finAnio) || (year === parseInt(finAnio) && finMes && inicioMes && parseInt(inicioMes) > parseInt(finMes))) ? null : (
                                <option key={year} value={year}>{year}</option>
                              )
                            )}
                          </select>
                        </div>
                      </div>
                      <div className="filters">
                        <h2 className="filter_label">Fin</h2>
                        <div style={{ display: "flex", gap: "5px" }}>
                          <select className="filter_select" value={finMes} onChange={(e) => setFinMes(e.target.value)}>
                            <option value="">Mes</option>
                            {MONTHS.map((m, i) =>
                              inicioAnio && inicioMes && finAnio && parseInt(inicioAnio) === parseInt(finAnio) && i + 1 < parseInt(inicioMes) ? null : (
                                <option key={m} value={i + 1}>{m}</option>
                              )
                            )}
                          </select>
                          <select className="filter_select" value={finAnio} onChange={(e) => setFinAnio(e.target.value)}>
                            <option value="">Año</option>
                            {YEARS_ARRAY.map((year) =>
                              inicioAnio && (year < parseInt(inicioAnio) || (year === parseInt(inicioAnio) && finMes && inicioMes && parseInt(inicioMes) > parseInt(finMes))) ? null : (
                                <option key={year} value={year}>{year}</option>
                              )
                            )}
                          </select>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="filter_right">
                  <div className="sort_row">
                    <h2 className="filter_label">Ordenar por</h2>
                    <select
                      className="filter_select"
                      value={ordenarPor}
                      onChange={(e) => setOrdenarPor(e.target.value)}
                    >
                      <option value="Nombre A-Z">Nombre A-Z</option>
                      <option value="Nombre Z-A">Nombre Z-A</option>
                      <option value="Fecha ↑">Fecha ↑</option>
                      <option value="Fecha ↓">Fecha ↓</option>
                    </select>
                  </div>
                </div>
                <button className="btn_advanced" onClick={() => setFiltrosAvanzados(true)}>
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                    <path d="M11.2691 4.41115C11.5006 3.89177 11.6164 3.63208 11.7776 3.55211C11.9176 3.48263 12.082 3.48263 12.222 3.55211C12.3832 3.63208 12.499 3.89177 12.7305 4.41115L14.5745 8.54808C14.643 8.70162 14.6772 8.77839 14.7302 8.83718C14.777 8.8892 14.8343 8.93081 14.8982 8.95929C14.9705 8.99149 15.0541 9.00031 15.2213 9.01795L19.7256 9.49336C20.2911 9.55304 20.5738 9.58288 20.6997 9.71147C20.809 9.82316 20.8598 9.97956 20.837 10.1342C20.8108 10.3122 20.5996 10.5025 20.1772 10.8832L16.8125 13.9154C16.6877 14.0279 16.6252 14.0842 16.5857 14.1527C16.5507 14.2134 16.5288 14.2807 16.5215 14.3503C16.5132 14.429 16.5306 14.5112 16.5655 14.6757L17.5053 19.1064C17.6233 19.6627 17.6823 19.9408 17.5989 20.1002C17.5264 20.2388 17.3934 20.3354 17.2393 20.3615C17.0619 20.3915 16.8156 20.2495 16.323 19.9654L12.3995 17.7024C12.2539 17.6184 12.1811 17.5765 12.1037 17.56C12.0352 17.5455 11.9644 17.5455 11.8959 17.56C11.8185 17.5765 11.7457 17.6184 11.6001 17.7024L7.67662 19.9654C7.18404 20.2495 6.93775 20.3915 6.76034 20.3615C6.60623 20.3354 6.47319 20.2388 6.40075 20.1002C6.31736 19.9408 6.37635 19.6627 6.49434 19.1064L7.4341 14.6757C7.46898 14.5112 7.48642 14.429 7.47814 14.3503C7.47081 14.2807 7.44894 14.2134 7.41394 14.1527C7.37439 14.0842 7.31195 14.0279 7.18708 13.9154L3.82246 10.8832C3.40005 10.5025 3.18884 10.3122 3.16258 10.1342C3.13978 9.97956 3.19059 9.82316 3.29993 9.71147C3.42581 9.58288 3.70856 9.55304 4.27406 9.49336L8.77835 9.01795C8.94553 9.00031 9.02911 8.99149 9.10139 8.95929C9.16534 8.93081 9.2226 8.8892 9.26946 8.83718C9.32241 8.77839 9.35663 8.70162 9.42508 8.54808L11.2691 4.41115Z" stroke="#5aedf1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Filtros Avanzados
                </button>
              </div>

              <div className="checkbox_label">Categoria del Documento</div>
              <div className="checkbox_row">
                {categorias.filter((cat) => cat.nombre_categoria !== "Personalizada").map((cat) => (
                  <label key={cat.id_tipo} className="checkbox_item">
                    <input
                      type="checkbox"
                      value={cat.nombre_categoria}
                      checked={tiposSeleccionados.includes(cat.nombre_categoria)}
                      onChange={() => handleTipoChange(cat.nombre_categoria)}
                    />
                    {cat.nombre_categoria}
                  </label>
                ))}
              </div>
              {categoriasCustom.length > 0 && (
                <>
                  <div className="checkbox_label" style={{ marginTop: "10px" }}>Categorías Personalizadas</div>
                  <div className="checkbox_row">
                    {categoriasCustom.map((cat) => (
                      <label key={cat.id} className="checkbox_item">
                        <input
                          type="checkbox"
                          value={cat.nombre}
                          checked={tiposSeleccionados.includes(cat.nombre)}
                          onChange={() => handleTipoChange(cat.nombre)}
                        />
                        {cat.nombre}
                      </label>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* === SCROLLABLE FILES CONTAINER === */}
        <div className="files_scroll_container">
          <div className="files_list">
            {loading && <p>Cargando…</p>}
{errorMsg && <p style={{ color: "#ff6b6b" }}>{errorMsg}</p>}
            {!loading && !errorMsg && files.length === 0 && (
              <p>No hay archivos. Crea una carpeta o sube un documento.</p>
            )}
            {showFiles.map((file) => (
              <div
                key={file.id}
                className={`file_row${pickerMode && file.type !== "folder" && selectedFiles?.has(file.id) ? " file_row--selected" : ""}`}
                onClick={() => handleRowClick(file)}
                style={{ cursor: "pointer" }}
              >
                <span>{file.type === "folder" ? "📁" : "📄"}</span>
                <span className="file_name">{file.name}</span>
                <span className="file_date">{file.date}</span>
                <div className="file_actions">
                  {pickerMode ? (
                    file.type !== "folder" && (
                      <input
                        type="checkbox"
                        readOnly
                        checked={selectedFiles?.has(file.id) ?? false}
                        className="file_picker_checkbox"
                      />
                    )
                  ) : (
                    <>
                      {file.type !== "folder" && file.id_doc && (
                        <button
                          className="btn_upd"
                          onClick={(e) => { e.stopPropagation(); handleDownload(file.id_doc); }}
                          aria-label="Descargar"
                          data-tooltip="Descargar"
                        >
                          <img src={descargasIcon} alt="" aria-hidden="true" className="btn_icon" />
                        </button>
                      )}
                      <button
                        className="btn_mov"
                        aria-label="Mover"
                        data-tooltip="Mover"
                        onClick={(e) => handleMover(e, file)}
                      >
                        <img src={archivoIcon} alt="" aria-hidden="true" className="btn_icon" />
                      </button>
                      <div
                        className="delete_action_wrapper"
                        ref={deletePrompt.open && deletePrompt.file?.id === file.id ? deletePromptRef : null}
                      >
                        <button
                          className="btn_del"
                          aria-label="Eliminar"
                          data-tooltip="Eliminar"
                          onClick={(e) => handleOpenDeletePrompt(e, file)}
                        >
                          <img src={basuraIcon} alt="" aria-hidden="true" className="btn_icon" />
                        </button>
                        {deletePrompt.open && deletePrompt.file?.id === file.id && (
                          <div className="delete_confirmation_popover" role="dialog" aria-label="Confirmar eliminación">
                            <span className="delete_confirmation_title">Confirmar</span>
                            <div className="delete_confirmation_actions">
                              <button
                                type="button"
                                className="delete_confirmation_button delete_confirmation_button_cancel"
                                onClick={handleCancelDelete}
                                aria-label="Cancelar eliminación"
                              />
                              <button
                                type="button"
                                className="delete_confirmation_button delete_confirmation_button_confirm"
                                onClick={handleConfirmDelete}
                                aria-label="Confirmar eliminación"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {!pickerMode && (
            <div className="bottom_bar">
              <button
                className="btn_new_folder"
                onClick={handleNuevaCarpeta}
                aria-label="Nueva Carpeta"
                data-tooltip="Nueva Carpeta"
              >
                <img src={nuevaCarpetaIcon} alt="" aria-hidden="true" className="btn_folder_icon" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* === MODAL NUEVA CARPETA === */}
      {showModal && (
        <div className="modal_overlay">
          <div className="modal_content">
            <h3>Crear Nueva Carpeta</h3>
            <input
              type="text"
              placeholder="Nombre de la carpeta"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="modal_input"
              autoFocus
            />
            <div className="modal_buttons">
              <button className="btn_cancel" onClick={handleCancelFolder}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button className="btn_confirm" onClick={handleConfirmFolder}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === MODAL MOVER === */}
      {showMoveModal && (
        <div className="modal_overlay">
          <div className="modal_content">
            <h3>Mover "{elementoAMover?.name}"</h3>
            <select
              className="modal_input"
              value={destinoSeleccionado}
              onChange={(e) => setDestinoSeleccionado(e.target.value)}
            >
              <option value="">Selecciona una carpeta destino</option>
              <option value="raiz">Raíz</option>
              {carpetasDestino.map((c) => (
                <option key={c.id_folder} value={c.id_folder}>
                  {c.nombre_carpeta}
                </option>
              ))}
            </select>
            <div className="modal_buttons">
              <button className="btn_cancel" onClick={handleCancelMove} disabled={moving}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button className="btn_confirm" onClick={handleConfirmMove} disabled={moving || !destinoSeleccionado}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
