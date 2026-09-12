import React, { useMemo } from "react";
import {
  Box,
  Stack,
  Typography,
  Chip,
  useTheme,
  LinearProgress,
} from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { SampleType } from "@/core/veterinary/domain/VeterinaryTypes";

interface BatchOption {
  id: number;
  name: string;
}

interface PortalObjectHeaderProps {
  veterinarianName?: string;
  licenseNumber?: string;
  healthCenterName?: string;
  officialCode?: string;
  batches: BatchOption[];
  selectedBatchId: number | null;
  onBatchChange: (batchId: number) => void;
  sampleType: SampleType;
  onSampleTypeChange: (type: SampleType) => void;
  sampleRound: number;
  onSampleRoundChange: (round: number) => void;
  sampleDate: string;
  onSampleDateChange: (date: string) => void;
  resultDate: string;
  onResultDateChange: (date: string) => void;
  totalBulls: number;
  evaluatedCount: number;
}

/**
 * Enterprise Fiori Object Header with 6 KPI facets.
 * Formatted with system MUI typography and subtle borders matching Pedigree views.
 */
export const PortalObjectHeader: React.FC<PortalObjectHeaderProps> = ({
  veterinarianName = "Dr. Fernando Aranguren",
  licenseNumber = "MP 4582",
  healthCenterName = "Laboratorio Regional Tandil",
  officialCode = "RENALAB-042",
  batches,
  selectedBatchId,
  onBatchChange,
  sampleType,
  onSampleTypeChange,
  sampleRound,
  onSampleRoundChange,
  sampleDate,
  onSampleDateChange,
  resultDate,
  onResultDateChange,
  totalBulls,
  evaluatedCount,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const percentage = useMemo(() => {
    if (totalBulls === 0) return 0;
    return Math.min(100, Math.round((evaluatedCount / totalBulls) * 100));
  }, [totalBulls, evaluatedCount]);

  const cleanLicense = licenseNumber?.replace(/^MP\s*/i, "").trim();

  const facetStyle = {
    p: 1.75,
    borderRight: "1px solid",
    borderBottom: "1px solid",
    borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
  };

  const facetLabelStyle = {
    fontSize: "0.68rem",
    fontWeight: 700,
    textTransform: "uppercase" as const,
    color: "text.secondary",
    letterSpacing: "0.04em",
    display: "block",
  };

  return (
    <Box
      sx={{
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      {/* Top Title & Responsibility Line */}
      <Box
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderBottom: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.06)" : "#f1f5f9",
          bgcolor: isDark
            ? "rgba(255, 255, 255, 0.01)"
            : "rgba(248, 250, 252, 0.5)",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          spacing={1.5}
          alignItems={{ md: "center" }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                p: 1,
                borderRadius: "6px",
                border: 1,
                borderColor: isDark ? "rgba(16, 185, 129, 0.3)" : "#bbf7d0",
                bgcolor: isDark ? "rgba(16, 185, 129, 0.15)" : "#f0fdf4",
                color: "success.dark",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FuseSvgIcon size={22}>
                heroicons-outline:shield-check
              </FuseSvgIcon>
            </Box>

            <Box>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                flexWrap="wrap"
              >
                <Typography
                  sx={{
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    color: "text.primary",
                    lineHeight: 1.2,
                  }}
                >
                  Acta de Evaluación Sanitaria &amp; Aptitud Reproductiva
                </Typography>
                <Chip
                  label="En Proceso de Carga"
                  size="small"
                  color="success"
                  variant="outlined"
                  sx={{
                    height: 20,
                    fontSize: "0.66rem",
                    fontWeight: 700,
                    borderRadius: "4px",
                  }}
                />
              </Stack>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontSize: "0.74rem",
                  mt: 0.25,
                  display: "block",
                }}
              >
                Profesional Responsable: <strong>{veterinarianName}</strong>
                {cleanLicense
                  ? ` (Matrícula Provincial ${cleanLicense})`
                  : ""}{" "}
                • Laboratorio Oficial: <strong>{healthCenterName}</strong>
                {officialCode ? ` (${officialCode})` : ""}
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Box>

      {/* 6-Facet KPI Grid Layout */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(6, 1fr)",
          },
          bgcolor: "background.paper",
        }}
      >
        {/* Facet 1: Tropa Asignada */}
        <Box sx={facetStyle}>
          <Typography sx={facetLabelStyle}>Tropa Asignada</Typography>
          <Box sx={{ mt: 0.75 }}>
            <select
              value={selectedBatchId ?? ""}
              onChange={(e) => onBatchChange(Number(e.target.value))}
              style={{
                width: "100%",
                borderRadius: "4px",
                border: "1px solid #cbd5e1",
                backgroundColor: isDark ? "#1e293b" : "#ffffff",
                color: isDark ? "#f8fafc" : "#1e293b",
                padding: "4px 6px",
                fontSize: "0.78rem",
                fontWeight: 600,
                outline: "none",
              }}
            >
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.name}
                </option>
              ))}
            </select>
          </Box>
          <Typography
            sx={{ fontSize: "0.68rem", color: "text.secondary", mt: 0.5 }}
          >
            {batches.length} {batches.length === 1 ? "Lote" : "Lotes"} / Rodeo
            Cría
          </Typography>
        </Box>

        {/* Facet 2: Tipo de Ensayo & Ronda */}
        <Box sx={facetStyle}>
          <Typography sx={facetLabelStyle}>Ensayo &amp; Ronda</Typography>
          <Box sx={{ mt: 0.75, display: "flex", gap: 0.75 }}>
            <select
              value={sampleRound}
              onChange={(e) => onSampleRoundChange(Number(e.target.value))}
              style={{
                width: "75px",
                borderRadius: "4px",
                border: "1px solid #cbd5e1",
                backgroundColor: isDark ? "#1e293b" : "#ffffff",
                color: isDark ? "#f8fafc" : "#1e293b",
                padding: "4px 4px",
                fontSize: "0.76rem",
                fontWeight: 600,
                outline: "none",
              }}
            >
              <option value={1}>1° Ronda</option>
              <option value={2}>2° Ronda</option>
              <option value={3}>3° Ronda</option>
              <option value={4}>4° Ronda</option>
            </select>
            <select
              value={sampleType}
              onChange={(e) => onSampleTypeChange(e.target.value as SampleType)}
              style={{
                flex: 1,
                borderRadius: "4px",
                border: "1px solid #cbd5e1",
                backgroundColor: isDark ? "#1e293b" : "#ffffff",
                color: isDark ? "#f8fafc" : "#1e293b",
                padding: "4px 4px",
                fontSize: "0.76rem",
                fontWeight: 600,
                outline: "none",
              }}
            >
              <option value="PREPUCE_SCRAPE">Raspaje prepucial</option>
              <option value="BLOOD_SEROLOGY">Serología</option>
              <option value="SEMEN_CULTURE">Cultivo semen</option>
              <option value="TUBERCULIN_TEST">Tuberculina</option>
            </select>
          </Box>
          <Typography
            sx={{ fontSize: "0.68rem", color: "text.secondary", mt: 0.5 }}
          >
            {sampleType === "PREPUCE_SCRAPE"
              ? "Muestreo venéreo oficial"
              : "Protocolo complementario"}
          </Typography>
        </Box>

        {/* Facet 3: Fecha de Muestreo */}
        <Box
          sx={{
            ...facetStyle,
            bgcolor: isDark ? "rgba(255, 255, 255, 0.01)" : "#f8fafc",
          }}
        >
          <Typography sx={facetLabelStyle}>Fecha Muestreo</Typography>
          <Box sx={{ mt: 0.75 }}>
            <input
              type="date"
              value={sampleDate}
              onChange={(e) => onSampleDateChange(e.target.value)}
              style={{
                width: "100%",
                borderRadius: "4px",
                border: "1px solid #cbd5e1",
                backgroundColor: isDark ? "#1e293b" : "#ffffff",
                color: isDark ? "#f8fafc" : "#1e293b",
                padding: "3px 6px",
                fontSize: "0.78rem",
                fontWeight: 600,
                outline: "none",
              }}
            />
          </Box>
        </Box>

        {/* Facet 4: Fecha de Resultado */}
        <Box
          sx={{
            ...facetStyle,
            bgcolor: isDark ? "rgba(255, 255, 255, 0.01)" : "#f8fafc",
          }}
        >
          <Typography sx={facetLabelStyle}>Fecha Resultado</Typography>
          <Box sx={{ mt: 0.75 }}>
            <input
              type="date"
              value={resultDate}
              onChange={(e) => onResultDateChange(e.target.value)}
              style={{
                width: "100%",
                borderRadius: "4px",
                border: "1px solid #cbd5e1",
                backgroundColor: isDark ? "#1e293b" : "#ffffff",
                color: isDark ? "#f8fafc" : "#1e293b",
                padding: "3px 6px",
                fontSize: "0.78rem",
                fontWeight: 600,
                outline: "none",
              }}
            />
          </Box>
        </Box>

        {/* Facet 5: Total Reproductores */}
        <Box sx={facetStyle}>
          <Typography sx={facetLabelStyle}>Total Reproductores</Typography>
          <Box
            sx={{
              mt: 0.75,
              display: "flex",
              alignItems: "baseline",
              gap: 0.75,
            }}
          >
            <Typography
              sx={{
                fontSize: "1.05rem",
                fontWeight: 800,
                color: "text.primary",
                fontFamily: "monospace",
              }}
            >
              {totalBulls}
            </Typography>
            <Typography sx={{ fontSize: "0.74rem", color: "text.secondary" }}>
              Toros asignados
            </Typography>
          </Box>
          <Typography
            sx={{
              fontSize: "0.68rem",
              fontWeight: 600,
              color: "success.main",
              mt: 0.25,
            }}
          >
            Catálogo activo
          </Typography>
        </Box>

        {/* Facet 6: Avance Evaluación */}
        <Box sx={{ ...facetStyle, borderRight: { lg: "none" } }}>
          <Typography sx={facetLabelStyle}>Avance Evaluación</Typography>
          <Box
            sx={{
              mt: 0.75,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <Typography
              sx={{
                fontSize: "0.95rem",
                fontWeight: 800,
                color: "text.primary",
                fontFamily: "monospace",
              }}
            >
              {evaluatedCount} / {totalBulls}
            </Typography>
            <Typography
              sx={{
                fontSize: "0.74rem",
                fontWeight: 700,
                color: "text.secondary",
              }}
            >
              {percentage}%
            </Typography>
          </Box>
          <Box sx={{ mt: 1 }}>
            <LinearProgress
              variant="determinate"
              value={percentage}
              color="success"
              sx={{ height: 5, borderRadius: 3 }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PortalObjectHeader;
