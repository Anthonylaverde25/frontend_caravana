import React from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { Veterinarian } from "@/core/veterinary/domain/VeterinaryTypes";

export interface IssueFormValues {
  veterinarian_id: number | "";
  label: string;
  ttl_hours: number;
  send_email: boolean;
  recipient_email: string;
  sender_note: string;
}

interface Props {
  values: IssueFormValues;
  veterinarians: Veterinarian[];
  isSubmitting: boolean;
  onChange: (
    field: keyof IssueFormValues,
    value: string | number | boolean,
  ) => void;
  onSubmit: () => void;
}

const TTL_OPTIONS = [
  { value: 24, label: "24 horas" },
  { value: 72, label: "72 horas (recomendado)" },
  { value: 168, label: "7 días" },
  { value: 720, label: "30 días" },
];

/**
 * Issuing a link, with delivery folded into the same act.
 *
 * The email is offered here and nowhere else because the plaintext token exists only in the
 * response to this request: there is no later moment at which the system could send it.
 */
export const PortalAccessIssueForm: React.FC<Props> = ({
  values,
  veterinarians,
  isSubmitting,
  onChange,
  onSubmit,
}) => {
  const selectedVet = veterinarians.find(
    (v) => v.id === values.veterinarian_id,
  );
  const fallbackEmail = selectedVet?.email ?? "";

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        border: 1,
        borderColor: "divider",
        borderRadius: "8px",
        bgcolor: "background.paper",
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: "8px",
            bgcolor: "action.hover",
            color: "primary.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FuseSvgIcon size={20}>heroicons-outline:link</FuseSvgIcon>
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontSize: "1.1rem", fontWeight: 600 }}>
            Emitir un acceso temporal
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Para un profesional o laboratorio externo, sin cuenta en el sistema.
          </Typography>
        </Box>
      </Stack>

      <Stack spacing={2}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <TextField
            select
            required
            label="Profesional destinatario"
            value={values.veterinarian_id}
            onChange={(e) =>
              onChange("veterinarian_id", Number(e.target.value))
            }
            variant="filled"
            size="small"
            sx={{ bgcolor: "action.hover", flex: 2 }}
            helperText={
              selectedVet ? `M.P. ${selectedVet.license_number}` : " "
            }
          >
            {veterinarians.map((vet) => (
              <MenuItem key={vet.id} value={vet.id}>
                {vet.name} — M.P. {vet.license_number}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Motivo del acceso"
            value={values.label}
            onChange={(e) => onChange("label", e.target.value)}
            variant="filled"
            size="small"
            sx={{ bgcolor: "action.hover", flex: 2 }}
            placeholder="Raspajes Lote Recría 3"
            helperText="Aparece en el asunto del correo."
          />

          <TextField
            select
            label="Vigencia"
            value={values.ttl_hours}
            onChange={(e) => onChange("ttl_hours", Number(e.target.value))}
            variant="filled"
            size="small"
            sx={{ bgcolor: "action.hover", flex: 1 }}
          >
            {TTL_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={values.send_email}
              onChange={(e) => onChange("send_email", e.target.checked)}
            />
          }
          label="Enviar el enlace por correo al emitirlo"
        />

        {values.send_email && (
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              label="Correo del destinatario"
              value={values.recipient_email}
              onChange={(e) => onChange("recipient_email", e.target.value)}
              variant="filled"
              size="small"
              type="email"
              sx={{ bgcolor: "action.hover", flex: 1 }}
              placeholder={fallbackEmail || "destinatario@laboratorio.com"}
              helperText={
                fallbackEmail
                  ? `Si lo deja vacío se usa el del profesional (${fallbackEmail}).`
                  : "El profesional no tiene correo cargado: indique uno."
              }
            />
            <TextField
              label="Nota para el destinatario (opcional)"
              value={values.sender_note}
              onChange={(e) => onChange("sender_note", e.target.value)}
              variant="filled"
              size="small"
              sx={{ bgcolor: "action.hover", flex: 2 }}
              placeholder="Enlace solicitado por el profesional para los raspajes de entore."
            />
          </Stack>
        )}

        <Alert severity="info" sx={{ borderRadius: "6px" }}>
          El enlace se muestra <strong>una sola vez</strong>. El sistema guarda
          únicamente su hash, así que después no puede recuperarse ni
          reenviarse: si se pierde, hay que reemitirlo.
        </Alert>

        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            onClick={onSubmit}
            disabled={isSubmitting || values.veterinarian_id === ""}
            startIcon={
              <FuseSvgIcon size={18}>
                heroicons-outline:paper-airplane
              </FuseSvgIcon>
            }
            sx={{
              px: 4,
              fontWeight: 700,
              borderRadius: "6px",
              textTransform: "none",
              boxShadow: "none",
            }}
          >
            {isSubmitting
              ? "Emitiendo..."
              : values.send_email
                ? "Emitir y enviar por correo"
                : "Emitir acceso"}
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
};
