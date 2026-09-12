import React from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { IssuedPortalToken } from "@/core/veterinary/domain/VeterinaryTypes";

interface Props {
  issued: IssuedPortalToken;
  onCopy: () => void;
  onDismiss: () => void;
}

/**
 * The one and only moment the link is visible.
 *
 * It stays on screen even when the email failed, because at that point the mail is the only thing
 * that went wrong — the grant exists and this is the last copy of its secret.
 */
export const PortalAccessIssuedBanner: React.FC<Props> = ({
  issued,
  onCopy,
  onDismiss,
}) => {
  const { token, email } = issued;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        border: 2,
        borderColor: "success.main",
        borderRadius: "8px",
        bgcolor: "background.paper",
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <FuseSvgIcon size={22} sx={{ color: "success.main" }}>
            heroicons-outline:check-circle
          </FuseSvgIcon>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, lineHeight: 1.2 }}
            >
              Acceso emitido para {token.veterinarian_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Vence el {token.expires_at}
              {token.label ? ` · ${token.label}` : ""}
            </Typography>
          </Box>
          <Button
            size="small"
            onClick={onDismiss}
            sx={{ textTransform: "none" }}
          >
            Ocultar
          </Button>
        </Stack>

        <TextField
          fullWidth
          value={token.access_url ?? ""}
          variant="filled"
          size="small"
          InputProps={{ readOnly: true }}
          sx={{
            bgcolor: "action.hover",
            "& input": { fontFamily: "monospace", fontSize: "0.8rem" },
          }}
        />

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="contained"
            onClick={onCopy}
            startIcon={
              <FuseSvgIcon size={18}>
                heroicons-outline:clipboard-document
              </FuseSvgIcon>
            }
            sx={{
              fontWeight: 700,
              borderRadius: "6px",
              textTransform: "none",
              boxShadow: "none",
            }}
          >
            Copiar enlace
          </Button>
        </Stack>

        {email.sent && (
          <Alert severity="success" sx={{ borderRadius: "6px" }}>
            Enviado por correo a <strong>{email.recipient}</strong>.
          </Alert>
        )}

        {!email.sent && email.error && (
          <Alert severity="warning" sx={{ borderRadius: "6px" }}>
            <AlertTitle>
              El acceso se emitió, pero el correo no salió
            </AlertTitle>
            {email.error}
            <Box sx={{ mt: 1 }}>
              Copie el enlace de arriba y hágaselo llegar por otro medio:{" "}
              <strong>no volverá a mostrarse</strong>.
            </Box>
          </Alert>
        )}

        <Alert severity="warning" sx={{ borderRadius: "6px" }}>
          Guárdelo ahora. Al salir de esta pantalla el enlace desaparece
          definitivamente.
        </Alert>
      </Stack>
    </Paper>
  );
};
