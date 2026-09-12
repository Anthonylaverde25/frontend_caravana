import React from "react";
import { Alert, Box, Chip, Paper, Stack, Typography } from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { VeterinaryPortalAccessMode } from "@/core/veterinary/domain/VeterinaryTypes";

interface PortalSessionHeaderProps {
  veterinarianName: string;
  licenseNumber: string;
  accessMode: VeterinaryPortalAccessMode;
  batchCount: number;
}

/**
 * Makes the acting identity explicit before anything is recorded: what the professional signs
 * here is frozen onto the protocol and carries legal weight.
 */
export const PortalSessionHeader: React.FC<PortalSessionHeaderProps> = ({
  veterinarianName,
  licenseNumber,
  accessMode,
  batchCount,
}) => (
  <Paper variant="outlined" sx={{ p: 2, borderRadius: "8px" }}>
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      alignItems={{ sm: "center" }}
    >
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 1.5, flexGrow: 1 }}
      >
        <FuseSvgIcon size={28} sx={{ color: "primary.main" }}>
          heroicons-outline:identification
        </FuseSvgIcon>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {veterinarianName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Matrícula {licenseNumber} · {batchCount} lote(s) asignado(s)
          </Typography>
        </Box>
      </Box>

      <Chip
        size="small"
        variant="outlined"
        color={accessMode === "TEMPORARY_TOKEN" ? "warning" : "primary"}
        label={
          accessMode === "TEMPORARY_TOKEN"
            ? "Acceso por enlace temporal"
            : "Acceso desde el sistema"
        }
      />
    </Stack>

    {accessMode === "TEMPORARY_TOKEN" && (
      <Alert severity="info" sx={{ mt: 1.5, fontSize: "0.8rem", py: 0.5 }}>
        Está operando con un enlace temporal provisto por el establecimiento. El
        acceso vence solo y sólo alcanza la tropa asignada.
      </Alert>
    )}
  </Paper>
);

export default PortalSessionHeader;
