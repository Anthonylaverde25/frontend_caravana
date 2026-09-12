import React from "react";
import {
  Paper,
  Stack,
  Box,
  Typography,
  Button,
  Chip,
  CircularProgress,
  useTheme,
} from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";

interface PortalBottomActionBarProps {
  evaluatedCount: number;
  totalBulls: number;
  licenseNumber?: string;
  onSaveDraft: () => void;
  onSign: () => void;
  isSigning?: boolean;
}

/**
 * Sticky bottom floating action bar using MUI components and system font tokens.
 */
export const PortalBottomActionBar: React.FC<PortalBottomActionBarProps> = ({
  evaluatedCount,
  totalBulls,
  licenseNumber = "MP 4582",
  onSaveDraft,
  onSign,
  isSigning = false,
}) => {
  const theme = useTheme();
  const cleanLicense = licenseNumber.replace(/^MP\s*/i, "").trim();

  return (
    <Paper
      square
      elevation={4}
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        borderTop: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        py: 1.25,
        px: { xs: 2, sm: 3 },
      }}
    >
      <Box
        sx={{
          maxWidth: 1720,
          mx: "auto",
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
        }}
      >
        {/* Regulatory custody info */}
        <Stack direction="row" spacing={1} alignItems="center">
          <FuseSvgIcon size={18} color="action">
            heroicons-outline:information-circle
          </FuseSvgIcon>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontSize: "0.74rem",
              lineHeight: 1.2,
            }}
          >
            Al firmar se congela de forma inalterable su nombre y matrícula en
            el protocolo oficial RENALAB. Corregir el catálogo de animales con
            posterioridad no altera lo ya firmado.
          </Typography>
        </Stack>

        {/* Live Counter & Action Buttons */}
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{ width: { xs: "100%", sm: "auto" }, justifyContent: "flex-end" }}
        >
          <Chip
            label={
              <span>
                <strong>{evaluatedCount}</strong> de {totalBulls} reproductores
                evaluados
              </span>
            }
            size="small"
            variant="outlined"
            sx={{
              height: 28,
              fontSize: "0.74rem",
              fontWeight: 600,
              bgcolor: "action.hover",
            }}
          />

          <Button
            size="small"
            variant="outlined"
            onClick={onSaveDraft}
            sx={{
              textTransform: "none",
              fontSize: "0.76rem",
              fontWeight: 600,
              height: 32,
              px: 2,
              borderRadius: "6px",
            }}
          >
            Guardar Borrador
          </Button>

          <Button
            size="small"
            variant="contained"
            color="success"
            disabled={isSigning}
            onClick={onSign}
            startIcon={
              isSigning ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <FuseSvgIcon size={16}>
                  heroicons-outline:pencil-square
                </FuseSvgIcon>
              )
            }
            sx={{
              textTransform: "none",
              fontSize: "0.78rem",
              fontWeight: 700,
              height: 32,
              px: 2.5,
              borderRadius: "6px",
              bgcolor: "#0a3622",
              "&:hover": { bgcolor: "#072919" },
            }}
          >
            Firmar dictamen con M.P. {cleanLicense}
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
};

export default PortalBottomActionBar;
