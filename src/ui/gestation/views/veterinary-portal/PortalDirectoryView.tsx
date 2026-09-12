import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Alert, Box, Button, CircularProgress, Stack, Typography, useTheme } from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import ViewLayout from "src/components/ViewLayout";
import { usePortalDirectory } from "@/features/gestation/hooks/useVeterinaryProtocols";
import { PortalDirectoryRow } from "@/core/veterinary/domain/VeterinaryTypes";
import { PortalLinkDialog } from "../../components/veterinary-portal/directory/PortalLinkDialog";
import { PortalDirectorySummaryCards } from "../../components/veterinary-portal/directory/PortalDirectorySummaryCards";
import {
  DirectoryFilterStatus,
  PortalDirectoryFilterBar,
} from "../../components/veterinary-portal/directory/PortalDirectoryFilterBar";
import { PortalDirectoryTable } from "../../components/veterinary-portal/directory/PortalDirectoryTable";

/**
 * Control Panel Directory of Veterinary Portals (Pedigree Design Pattern Standard).
 * Displays real-time status of all external and registered veterinarians,
 * allowing livestock producers and managers to inspect workspaces and issue temporary access tokens.
 */
export const PortalDirectoryView: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const { data: rows = [], isLoading, error } = usePortalDirectory(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<DirectoryFilterStatus>("ALL");
  const [linkFor, setLinkFor] = useState<PortalDirectoryRow | null>(null);

  const filteredRows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return rows.filter((row) => {
      // 1. Text search
      if (q) {
        const matchesName = row.name.toLowerCase().includes(q);
        const matchesLicense = row.license_number.toLowerCase().includes(q);
        const matchesEmail = (row.email ?? "").toLowerCase().includes(q);

        if (!matchesName && !matchesLicense && !matchesEmail) {
          return false;
        }
      }

      // 2. Status filter
      if (filterStatus === "WITH_ACCOUNT") {
        return row.has_portal_account;
      }
      if (filterStatus === "WITHOUT_ACCOUNT") {
        return !row.has_portal_account;
      }
      if (filterStatus === "WITH_TOKEN") {
        return row.active_token_count > 0;
      }
      if (filterStatus === "PENDING_ACTIONS") {
        return row.pending_signature_count > 0 || row.pending_lab_report_count > 0;
      }

      return true;
    });
  }, [rows, searchTerm, filterStatus]);

  const handleInspect = (row: PortalDirectoryRow) => {
    window.open(`/vet-portal/inspect/${row.veterinarian_id}`, "_blank", "noopener,noreferrer");
  };

  const handleOpenLinkDialog = (row: PortalDirectoryRow) => {
    setLinkFor(row);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", gap: 2 }}>
        <CircularProgress />
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
          Cargando directorio de profesionales...
        </Typography>
      </Box>
    );
  }

  return (
    <ViewLayout
      title="Portales de Profesionales"
      subtitle="Supervisión de actas, despacho de muestras y gestión de accesos por veterinario"
      actions={
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            onClick={() => navigate("/gestation/diagnostic-protocols")}
            startIcon={<FuseSvgIcon size={18}>heroicons-outline:document-check</FuseSvgIcon>}
            sx={{
              fontWeight: 600,
              textTransform: "none",
              borderRadius: "6px",
              px: 2,
            }}
          >
            Protocolos Diagnósticos
          </Button>
        </Stack>
      }
    >
      <Stack spacing={2.5}>
        {/* KPI summary cards (Pedigree pattern) */}
        <PortalDirectorySummaryCards rows={rows} isDark={isDark} />

        {error && (
          <Alert severity="error" sx={{ borderRadius: "8px" }}>
            Ocurrió un error al cargar el directorio de profesionales. Por favor, reintente.
          </Alert>
        )}

        {/* Filter Bar with Segmented Pills (Pedigree pattern) */}
        <PortalDirectoryFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
          totalRecordsCount={rows.length}
          isDark={isDark}
        />

        {/* Tabular DataTable with Zebra Striping and Pagination (Pedigree pattern) */}
        <PortalDirectoryTable
          rows={filteredRows}
          isLoading={false}
          onInspect={handleInspect}
          onOpenLinkDialog={handleOpenLinkDialog}
        />
      </Stack>

      {/* Temporary Link Generation Modal */}
      <PortalLinkDialog open={linkFor !== null} row={linkFor} onClose={() => setLinkFor(null)} />
    </ViewLayout>
  );
};

export default PortalDirectoryView;
