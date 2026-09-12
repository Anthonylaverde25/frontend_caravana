import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { useSnackbar } from "notistack";
import { useIssueVeterinaryPortalToken } from "@/features/gestation/hooks/useVeterinaryProtocols";
import { IssuedPortalToken, PortalDirectoryRow } from "@/core/veterinary/domain/VeterinaryTypes";
import { apiErrorMessage } from "@/core/veterinary/domain/apiErrorMessage";

interface Props {
  open: boolean;
  row: PortalDirectoryRow | null;
  onClose: () => void;
}

/** ADR-16: how wide the grant is. One act is the narrowest; standing covers all their work. */
const TTL_OPTIONS = [
  { hours: 24, label: "24 horas" },
  { hours: 72, label: "3 días" },
  { hours: 168, label: "1 semana" },
  { hours: 720, label: "30 días" },
];

/**
 * Mints a portal link for one professional, and optionally mails it to them.
 *
 * The link is shown once and never again: only its SHA-256 hash is stored, so there is no screen
 * anywhere that can recover it later. That is why this dialog stays open after issuing, with the
 * URL on it — closing it early is how an act ends up unreachable and somebody mints a second
 * credential for a professional who already holds one.
 */
export const PortalLinkDialog: React.FC<Props> = ({ open, row, onClose }) => {
  const { enqueueSnackbar } = useSnackbar();
  const issueToken = useIssueVeterinaryPortalToken();

  const [ttlHours, setTtlHours] = useState(72);
  const [label, setLabel] = useState("");
  const [sendEmail, setSendEmail] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [senderNote, setSenderNote] = useState("");
  const [issued, setIssued] = useState<IssuedPortalToken | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      setTtlHours(72);
      setLabel("");
      // Sending is off by default: it leaves the building, so it is a decision and not a default.
      setSendEmail(false);
      setRecipient(row?.email ?? "");
      setSenderNote("");
      setIssued(null);
      setCopied(false);
    }
  }, [open, row?.email]);

  if (!row) return null;

  const accessUrl = issued?.token?.access_url ?? null;
  const emailResult = issued?.email;

  const handleIssue = async () => {
    if (sendEmail && !recipient.trim()) {
      enqueueSnackbar("Indicá a qué dirección enviar el enlace.", { variant: "warning" });
      return;
    }

    try {
      const result = await issueToken.mutateAsync({
        veterinarian_id: row.veterinarian_id,
        label: label.trim() || null,
        ttl_hours: ttlHours,
        send_email: sendEmail,
        recipient_email: sendEmail ? recipient.trim() : null,
        sender_note: senderNote.trim() || null,
      });

      setIssued(result);

      if (sendEmail && result.email?.sent) {
        enqueueSnackbar(`Enlace enviado a ${result.email.recipient}.`, { variant: "success" });
      } else if (sendEmail) {
        // The grant exists either way; the link on screen is the only remaining copy.
        enqueueSnackbar(
          result.email?.error ?? "El enlace se generó, pero el correo no salió. Copialo de la pantalla.",
          { variant: "warning", autoHideDuration: 9000 },
        );
      }
    } catch (error: unknown) {
      enqueueSnackbar(apiErrorMessage(error, "No se pudo generar el enlace."), { variant: "error" });
    }
  };

  const handleCopy = async () => {
    if (!accessUrl) return;

    try {
      await navigator.clipboard.writeText(accessUrl);
      setCopied(true);
    } catch {
      // Clipboard access can be refused; the URL is on screen and selectable regardless.
      enqueueSnackbar("No se pudo copiar automáticamente. Seleccioná el enlace y copialo.", {
        variant: "info",
      });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={issueToken.isPending ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: "8px", bgcolor: "background.paper" } }}
    >
      <Box
        sx={{
          p: 2,
          px: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontSize: "1.05rem", fontWeight: 700 }}>
            Enlace al portal de {row.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            M.P. {row.license_number}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" disabled={issueToken.isPending}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          {accessUrl ? (
            <>
              <Alert severity="success" sx={{ borderRadius: "6px" }}>
                Enlace generado. <strong>Se muestra una sola vez</strong>: del enlace sólo se guarda
                su hash, así que no hay ninguna pantalla que pueda recuperarlo después.
              </Alert>

              <TextField
                label="Enlace de acceso"
                value={accessUrl}
                variant="filled"
                size="small"
                fullWidth
                InputProps={{ readOnly: true, sx: { fontFamily: "monospace", fontSize: "0.8rem" } }}
                onFocus={(e) => e.target.select()}
                sx={{ bgcolor: "action.hover" }}
              />

              <Stack direction="row" spacing={1.5} alignItems="center">
                <Button
                  onClick={handleCopy}
                  variant={copied ? "outlined" : "contained"}
                  startIcon={
                    <FuseSvgIcon size={16}>
                      {copied ? "heroicons-outline:check" : "heroicons-outline:clipboard"}
                    </FuseSvgIcon>
                  }
                  sx={{ fontWeight: 700, textTransform: "none", boxShadow: "none" }}
                >
                  {copied ? "Copiado" : "Copiar enlace"}
                </Button>
                {issued?.token?.expires_at && (
                  <Typography variant="caption" color="text.secondary">
                    Vence el {issued.token.expires_at}
                  </Typography>
                )}
              </Stack>

              {emailResult?.sent && (
                <Alert severity="info" sx={{ borderRadius: "6px" }}>
                  También se envió por correo a <strong>{emailResult.recipient}</strong>.
                </Alert>
              )}
              {emailResult && !emailResult.sent && emailResult.error && (
                <Alert severity="warning" sx={{ borderRadius: "6px" }}>
                  El correo no salió: {emailResult.error} El enlace de arriba sigue siendo válido.
                </Alert>
              )}
            </>
          ) : (
            <>
              {row.has_portal_account && (
                <Alert severity="info" sx={{ borderRadius: "6px" }}>
                  {row.name} <strong>ya tiene cuenta</strong> ({row.email ?? "sin correo cargado"}),
                  así que entra al portal con su usuario. Un enlace temporal es útil de todos modos
                  para que abra su portal sin iniciar sesión.
                </Alert>
              )}

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  select
                  label="Vigencia"
                  value={ttlHours}
                  onChange={(e) => setTtlHours(Number(e.target.value))}
                  variant="filled"
                  size="small"
                  sx={{ bgcolor: "action.hover", flex: 1 }}
                >
                  {TTL_OPTIONS.map((option) => (
                    <MenuItem key={option.hours} value={option.hours}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Referencia (opcional)"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  variant="filled"
                  size="small"
                  sx={{ bgcolor: "action.hover", flex: 2 }}
                  helperText="Para reconocerlo después en la lista de accesos."
                />
              </Stack>

              <Divider />

              <FormControlLabel
                control={
                  <Checkbox checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} />
                }
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Enviarlo por correo al profesional
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Sale del establecimiento, así que se manda sólo si lo pedís.
                    </Typography>
                  </Box>
                }
                sx={{ alignItems: "flex-start", ml: 0, "& .MuiCheckbox-root": { pt: 0 } }}
              />

              {sendEmail && (
                <Stack spacing={2} sx={{ pl: { sm: 4 }, borderLeft: { sm: 2 }, borderColor: "divider" }}>
                  <TextField
                    type="email"
                    label="Destinatario"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    variant="filled"
                    size="small"
                    required
                    sx={{ bgcolor: "action.hover" }}
                    helperText={
                      row.email
                        ? "Precargado con el correo de su ficha."
                        : "Su ficha no tiene correo: escribí la dirección."
                    }
                  />
                  <TextField
                    label="Nota para el correo (opcional)"
                    value={senderNote}
                    onChange={(e) => setSenderNote(e.target.value)}
                    variant="filled"
                    size="small"
                    multiline
                    rows={2}
                    sx={{ bgcolor: "action.hover" }}
                    placeholder="Ej: Te paso el acceso para que firmes las actas del lote 4."
                  />
                </Stack>
              )}
            </>
          )}
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          px: 3,
          bgcolor: "background.default",
          borderTop: 1,
          borderColor: "divider",
          justifyContent: "space-between",
        }}
      >
        <Button onClick={onClose} variant="text" sx={{ fontWeight: 600, textTransform: "none" }}>
          {accessUrl ? "Listo" : "Cancelar"}
        </Button>
        {!accessUrl && (
          <Button
            onClick={handleIssue}
            disabled={issueToken.isPending}
            variant="contained"
            startIcon={
              issueToken.isPending ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <FuseSvgIcon size={18}>heroicons-outline:link</FuseSvgIcon>
              )
            }
            sx={{ px: 3, fontWeight: 700, textTransform: "none", boxShadow: "none" }}
          >
            {sendEmail ? "Generar y enviar" : "Generar enlace"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PortalLinkDialog;
