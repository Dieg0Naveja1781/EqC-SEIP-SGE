import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DashboardLayout } from "../../shared/components/DashboardLayout";
import { useArchiveData } from "./useArchiveData";
import { ArchiveListCore } from "./ArchiveListCore";

export function ArchiveList() {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedFolderId = location.state?.folderId ?? null;
  const selectedFolderName = location.state?.folderName ?? null;

  const initialFolderPath =
    selectedFolderId && selectedFolderName
      ? [{ id: selectedFolderId, name: selectedFolderName }]
      : [];

  const archiveData = useArchiveData({
    initialFolderId: selectedFolderId,
    initialFolderPath,
  });

  const handleVerDocumento = (file) => {
    if (file.type === "folder") {
      const realId = file.id.replace("f-", "");
      archiveData.setFolderPath([...archiveData.folderPath, { id: realId, name: file.name }]);
      archiveData.setCurrentFolderId(realId);
    } else if (file.type === "pdf") {
      navigate("/archive_view", { state: { documento: file } });
    }
  };

  return (
    <DashboardLayout title="Gestión de Archivos">
      <ArchiveListCore archiveData={archiveData} onVerDocumento={handleVerDocumento} />
    </DashboardLayout>
  );
}
