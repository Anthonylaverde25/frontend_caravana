import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
  useTheme,
  alpha,
} from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { useVeterinaryPortalWorkspace } from "@/features/gestation/hooks/useVeterinaryPortal";
import { useVeterinaryPortalContext } from "../../components/veterinary-portal/context/VeterinaryPortalContext";
import { PortalObjectHeader } from "../../components/veterinary-portal/header/PortalObjectHeader";

/**
 * Tab 1: Home / Setup & Overview View.
 * Displays the 6 KPI facets (Tropa Asignada, Ensayo & Ronda, Fechas, Total Reproductores, Avance)
 * and acts as the central launchpad before entering the dense chute evaluation spreadsheet.
 */
export const PortalHomeView: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const navigate = useNavigate();

  const {
    session,
    accessToken,
    basePath,
    acts,
    pendingTubes,
    batchId,
    setBatchId,
    sampleType,
    setSampleType,
    sampleRound,
    setSampleRound,
    sampleDate,
    setSampleDate,
    resultDate,
    setResultDate,
    totalBulls,
    setTotalBulls,
    evaluatedCount,
  } = useVeterinaryPortalContext();

  const { data: workspace, isLoading } = useVeterinaryPortalWorkspace(
    batchId,
    accessToken,
  );

  // Auto-select first batch if none selected
  useEffect(() => {
    if (batchId === null && workspace?.batches?.length) {
      setBatchId(workspace.batches[0].id);
    }
  }, [workspace, batchId, setBatchId]);

  // Sync total bulls count
  useEffect(() => {
    if (workspace?.bulls) {
      setTotalBulls(workspace.bulls.length);
    }
  }, [workspace?.bulls, setTotalBulls]);

  const pendingSignatureCount = acts?.pending_signature.length ?? 0;
  const pendingLabReportCount = acts?.pending_lab_report.length ?? 0;
  const totalPendingActs = pendingSignatureCount + pendingLabReportCount;

  if (isLoading && !workspace) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 300,
        }}
      >
        <CircularProgress size={32} />
      </Box>
    );
  }

  const selectedBatch = workspace?.batches?.find((b) => b.id === batchId);

  return (
    <div className="mx-auto max-w-[1720px] space-y-4 px-4 py-4 sm:px-6">
      {/* 6 KPI Facets Header: Tropa, Ensayo, Fechas, Total, Avance */}
      <Paper
        elevation={0}
        sx={{
          border: 1,
          borderColor: "divider",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: isDark
            ? "0 2px 8px rgba(0,0,0,0.3)"
            : "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <PortalObjectHeader
          veterinarianName={
            workspace?.veterinarian?.name ?? session?.veterinarian?.name
          }
          licenseNumber={
            workspace?.veterinarian?.license_number ??
            session?.veterinarian?.license_number
          }
          batches={workspace?.batches ?? []}
          selectedBatchId={batchId}
          onBatchChange={setBatchId}
          sampleType={sampleType}
          onSampleTypeChange={setSampleType}
          sampleRound={sampleRound}
          onSampleRoundChange={setSampleRound}
          sampleDate={sampleDate}
          onSampleDateChange={setSampleDate}
          resultDate={resultDate}
          onResultDateChange={setResultDate}
          totalBulls={totalBulls}
          evaluatedCount={evaluatedCount}
        />
      </Paper>

      {/* Primary Action Banner: Direct Chute Launchpad */}
      <Card
        elevation={0}
        sx={{
          border: 1,
          borderColor: isDark ? "rgba(16, 185, 129, 0.3)" : "#a7f3d0",
          borderRadius: "8px",
          bgcolor: isDark
            ? alpha(theme.palette.success.main, 0.08)
            : "#f0fdf4",
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
          >
            <div>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
                <Chip
                  label="Planilla Lista para Evaluación"
                  size="small"
                  color="success"
                  sx={{ fontWeight: 700, fontSize: "0.72rem" }}
                />
                <Typography variant="caption" color="text.secondary">
                  Tropa activa: <strong>{selectedBatch?.name ?? "Rodeo Cría General"}</strong>
                </Typography>
              </Stack>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
                Carga de Evaluación Directa en Manga
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 680, mt: 0.5 }}>
                Los parámetros del acta sanitaria han sido configurados. Ingrese a la planilla de evaluación
                para registrar caravanas, condición corporal, raspaje venéreo y emitir el acta oficial.
              </Typography>
            </div>

            <Button
              variant="contained"
              color="success"
              size="large"
              onClick={() => navigate(`${basePath}/evaluacion`)}
              endIcon={<FuseSvgIcon size={18}>heroicons-outline:arrow-right</FuseSvgIcon>}
              sx={{
                px: 3,
                py: 1.25,
                fontWeight: 700,
                fontSize: "0.92rem",
                borderRadius: "6px",
                textTransform: "none",
                boxShadow: "0 2px 6px rgba(16, 185, 129, 0.25)",
              }}
            >
              Comenzar Carga en Manga
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Quick Navigation Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
          gap: 2,
        }}
      >
        <Card
          elevation={0}
          onClick={() => navigate(`${basePath}/actas`)}
          sx={{
            border: 1,
            borderColor: "divider",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "all 0.15s ease-in-out",
            "&:hover": {
              borderColor: "primary.main",
              boxShadow: isDark
                ? "0 4px 12px rgba(0,0,0,0.4)"
                : "0 4px 12px rgba(0,0,0,0.06)",
            },
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    p: 1,
                    borderRadius: "8px",
                    bgcolor: isDark ? "rgba(59, 130, 246, 0.15)" : "#eff6ff",
                    color: "primary.main",
                    display: "flex",
                  }}
                >
                  <FuseSvgIcon size={22}>heroicons-outline:document-text</FuseSvgIcon>
                </Box>
                <div>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Mis Actas y Protocolos
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Pendientes de firma o informe
                  </Typography>
                </div>
              </Stack>
              <Chip
                label={totalPendingActs}
                size="small"
                color={totalPendingActs > 0 ? "warning" : "default"}
                sx={{ fontWeight: 700 }}
              />
            </Stack>
          </CardContent>
        </Card>

        <Card
          elevation={0}
          onClick={() => navigate(`${basePath}/envios`)}
          sx={{
            border: 1,
            borderColor: "divider",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "all 0.15s ease-in-out",
            "&:hover": {
              borderColor: "primary.main",
              boxShadow: isDark
                ? "0 4px 12px rgba(0,0,0,0.4)"
                : "0 4px 12px rgba(0,0,0,0.06)",
            },
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    p: 1,
                    borderRadius: "8px",
                    bgcolor: isDark ? "rgba(245, 158, 11, 0.15)" : "#fef3c7",
                    color: "warning.main",
                    display: "flex",
                  }}
                >
                  <FuseSvgIcon size={22}>heroicons-outline:truck</FuseSvgIcon>
                </Box>
                <div>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Envío de Muestras
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Tubos en custodia y despachos
                  </Typography>
                </div>
              </Stack>
              <Chip
                label={pendingTubes.length}
                size="small"
                color={pendingTubes.length > 0 ? "info" : "default"}
                sx={{ fontWeight: 700 }}
              />
            </Stack>
          </CardContent>
        </Card>

        <Card
          elevation={0}
          onClick={() => navigate(`${basePath}/historial`)}
          sx={{
            border: 1,
            borderColor: "divider",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "all 0.15s ease-in-out",
            "&:hover": {
              borderColor: "primary.main",
              boxShadow: isDark
                ? "0 4px 12px rgba(0,0,0,0.4)"
                : "0 4px 12px rgba(0,0,0,0.06)",
            },
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    p: 1,
                    borderRadius: "8px",
                    bgcolor: isDark ? "rgba(16, 185, 129, 0.15)" : "#ecfdf5",
                    color: "success.main",
                    display: "flex",
                  }}
                >
                  <FuseSvgIcon size={22}>heroicons-outline:beaker</FuseSvgIcon>
                </Box>
                <div>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Historial de Laboratorio
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Certificados oficiales RENALAB
                  </Typography>
                </div>
              </Stack>
              <FuseSvgIcon size={18} className="text-slate-400">
                heroicons-outline:chevron-right
              </FuseSvgIcon>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </div>
  );
};

export default PortalHomeView;
