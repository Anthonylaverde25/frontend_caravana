import React from "react";
import { Alert, Box, Button, MenuItem, Stack, TextField, Typography } from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { Veterinarian } from "@/core/veterinary/domain/VeterinaryTypes";

interface Props {
  veterinarians: Veterinarian[];
  selectedId: number | "";
  onSelect: (veterinarianId: number | "") => void;
  isReadOnly: boolean;
  onReturnToDirectory?: () => void;
}

export const PortalSupervisionBar: React.FC<Props> = ({
  veterinarians,
  selectedId,
  onSelect,
  isReadOnly,
  onReturnToDirectory,
}) => (
  <Stack spacing={1.5} sx={{ mb: 2 }}>
    <Box
      sx={{
        p: 1.5,
        px: 2,
        border: 1,
        borderColor: "divider",
        borderRadius: "8px",
        bgcolor: "background.paper",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        flexWrap: "wrap",
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1, minWidth: 220 }}>
        {onReturnToDirectory && (
          <Button
            size="small"
            variant="outlined"
            onClick={onReturnToDirectory}
            startIcon={<FuseSvgIcon size={16}>heroicons-outline:arrow-left</FuseSvgIcon>}
            sx={{
              fontWeight: 600,
              textTransform: "none",
              borderRadius: "6px",
              fontSize: "0.78rem",
              px: 1.5,
            }}
          >
            Volver al Directorio
          </Button>
        )}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            Supervisión del portal profesional
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Actas, tubos y despachos en modo inspección (solo lectura).
          </Typography>
        </Box>
      </Stack>

      <TextField
        select
        size="small"
        variant="filled"
        label="Cambiar profesional"
        value={selectedId}
        onChange={(e) => onSelect(e.target.value === "" ? "" : Number(e.target.value))}
        sx={{ bgcolor: "action.hover", minWidth: 260 }}
      >
        <MenuItem value="">
          <em>Elegir…</em>
        </MenuItem>
        {veterinarians.map((vet) => (
          <MenuItem key={vet.id} value={vet.id}>
            {vet.name} — M.P. {vet.license_number}
            {vet.user_id === null ? " · sin acceso" : ""}
          </MenuItem>
        ))}
      </TextField>
    </Box>

    {isReadOnly && (
      <Alert severity="warning" sx={{ borderRadius: "6px", py: 0.5 }}>
        Está <strong>inspeccionando</strong> el portal de este profesional. Puede visualizar todas sus actas y registros; las
        acciones vinculantes (firmas digitales, envíos e informes) permanecen bloqueadas para su custodia profesional.
      </Alert>
    )}
  </Stack>
);

export default PortalSupervisionBar;
