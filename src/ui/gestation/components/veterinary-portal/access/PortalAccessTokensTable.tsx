import React from "react";
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { VeterinaryPortalAccessToken } from "@/core/veterinary/domain/VeterinaryTypes";

interface Props {
  tokens: VeterinaryPortalAccessToken[];
  isLoading: boolean;
  busyTokenId: number | null;
  onReissue: (token: VeterinaryPortalAccessToken) => void;
  onRevoke: (token: VeterinaryPortalAccessToken) => void;
}

const scopeOf = (token: VeterinaryPortalAccessToken): string => {
  if (token.is_scoped_to_act) return `Acta ${token.protocol_number ?? ""}`;
  if (token.batch_name) return `Lote ${token.batch_name}`;
  return "Tropas asignadas";
};

const stateOf = (
  token: VeterinaryPortalAccessToken,
): { label: string; color: "success" | "default" | "error" } => {
  if (token.revoked_at) return { label: "Revocado", color: "error" };
  if (!token.is_usable) return { label: "Vencido", color: "default" };
  return { label: "Vigente", color: "success" };
};

/**
 * Everything the establishment has handed out, and what can still be done about it.
 *
 * Note there is no "resend": only the token hash is stored, so the row cannot reproduce the
 * link. "Reemitir" is the honest replacement — a new secret, the old grant revoked.
 */
export const PortalAccessTokensTable: React.FC<Props> = ({
  tokens,
  isLoading,
  busyTokenId,
  onReissue,
  onRevoke,
}) => (
  <Paper
    elevation={0}
    sx={{
      border: 1,
      borderColor: "divider",
      borderRadius: "8px",
      bgcolor: "background.paper",
    }}
  >
    <Stack
      direction="row"
      spacing={1.5}
      alignItems="center"
      sx={{ p: 2, px: 2.5 }}
    >
      <FuseSvgIcon size={20} color="action">
        heroicons-outline:key
      </FuseSvgIcon>
      <Box sx={{ flex: 1 }}>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, lineHeight: 1.2 }}
        >
          Accesos emitidos
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Quién tiene una llave abierta al portal de este establecimiento.
        </Typography>
      </Box>
      <Chip
        size="small"
        label={tokens.length}
        sx={{ fontWeight: 700, borderRadius: "6px" }}
      />
    </Stack>

    <Box sx={{ overflowX: "auto" }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>Profesional</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Motivo</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Alcance</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Vence</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Usos</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
            <TableCell sx={{ fontWeight: 700 }} align="right">
              Acciones
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={7}>
                <Typography variant="body2" color="text.secondary">
                  Cargando accesos…
                </Typography>
              </TableCell>
            </TableRow>
          )}

          {!isLoading && tokens.length === 0 && (
            <TableRow>
              <TableCell colSpan={7}>
                <Typography variant="body2" color="text.secondary">
                  Todavía no se emitió ningún acceso temporal.
                </Typography>
              </TableCell>
            </TableRow>
          )}

          {!isLoading &&
            tokens.map((token) => {
              const state = stateOf(token);
              const busy = busyTokenId === token.id;

              return (
                <TableRow key={token.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {token.veterinarian_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      M.P. {token.license_number}
                    </Typography>
                  </TableCell>
                  <TableCell>{token.label ?? "—"}</TableCell>
                  <TableCell>{scopeOf(token)}</TableCell>
                  <TableCell>{token.expires_at}</TableCell>
                  <TableCell>
                    {token.used_count}
                    {token.max_uses ? ` / ${token.max_uses}` : ""}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={state.label}
                      color={state.color}
                      variant={
                        state.color === "default" ? "outlined" : "filled"
                      }
                      sx={{ fontWeight: 600, borderRadius: "6px" }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="flex-end"
                    >
                      <Button
                        size="small"
                        variant="outlined"
                        disabled={busy}
                        onClick={() => onReissue(token)}
                        sx={{
                          textTransform: "none",
                          borderRadius: "6px",
                          fontWeight: 600,
                        }}
                      >
                        {busy ? "Reemitiendo…" : "Reemitir y enviar"}
                      </Button>
                      {!token.revoked_at && (
                        <Button
                          size="small"
                          color="error"
                          disabled={busy}
                          onClick={() => onRevoke(token)}
                          sx={{
                            textTransform: "none",
                            borderRadius: "6px",
                            fontWeight: 600,
                          }}
                        >
                          Revocar
                        </Button>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </Box>
  </Paper>
);
