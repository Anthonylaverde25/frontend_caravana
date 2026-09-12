import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useSnackbar } from 'notistack';
import {
  useDiagnosticProtocol,
  useVoidDiagnosticProtocol,
} from '@/features/gestation/hooks/useVeterinaryProtocols';
import { LabSampleStatus } from '@/core/veterinary/domain/VeterinaryTypes';
import { apiErrorMessage } from '@/core/veterinary/domain/apiErrorMessage';

interface ProtocolDetailDialogProps {
  protocolId: number | null;
  onClose: () => void;
}

const STATUS_LABEL: Record<LabSampleStatus, string> = {
  NEGATIVE_CLEARED: 'Negativo',
  POSITIVE_DETECTED: 'Positivo',
  PENDING_RESULTS: 'Pendiente',
};

const statusColor = (status: LabSampleStatus): 'success' | 'error' | 'warning' =>
  status === 'POSITIVE_DETECTED' ? 'error' : status === 'PENDING_RESULTS' ? 'warning' : 'success';

/**
 * The evidentiary chain in one place: the frozen signature, the determinations, and the
 * original photo — always reached through a short lived signed URL, never a public path.
 */
export const ProtocolDetailDialog: React.FC<ProtocolDetailDialogProps> = ({ protocolId, onClose }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { data: protocol, isLoading } = useDiagnosticProtocol(protocolId);
  const voidProtocol = useVoidDiagnosticProtocol();

  const [voidMode, setVoidMode] = useState(false);
  const [voidReason, setVoidReason] = useState('');

  const handleClose = () => {
    setVoidMode(false);
    setVoidReason('');
    onClose();
  };

  const handleVoid = async () => {
    if (!protocol || voidReason.trim().length < 5) {
      enqueueSnackbar('Indique el motivo de la anulación (mínimo 5 caracteres).', { variant: 'warning' });
      return;
    }

    try {
      await voidProtocol.mutateAsync({ id: protocol.id, reason: voidReason.trim() });
      enqueueSnackbar('Protocolo anulado. Se revirtieron los hallazgos y se recalculó la aptitud.', {
        variant: 'success',
      });
      handleClose();
    } catch (error: unknown) {
      enqueueSnackbar(apiErrorMessage(error, 'No se pudo anular el protocolo.'), { variant: 'error' });
    }
  };

  return (
    <Dialog
      open={protocolId !== null}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      PaperProps={{ sx: { borderRadius: '8px', boxShadow: 1, bgcolor: 'background.paper' } }}
    >
      <Box
        sx={{
          p: 2,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
          Protocolo {protocol?.protocol_number ?? ''}
        </Typography>
        <IconButton onClick={handleClose} size="small" sx={{ color: 'primary.main' }}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {protocol && (
          <Stack spacing={2}>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              <Chip
                size="small"
                label={protocol.status}
                color={protocol.status === 'VOIDED' ? 'default' : 'primary'}
                variant={protocol.status === 'VOIDED' ? 'outlined' : 'filled'}
              />
              <Chip
                size="small"
                label={protocol.verification_status === 'VERIFIED' ? 'Verificado por M.V.' : 'Transcripción sin aval'}
                color={protocol.verification_status === 'VERIFIED' ? 'success' : 'warning'}
                variant="outlined"
              />
              <Chip
                size="small"
                variant="outlined"
                label={protocol.source_channel === 'PORTAL_VET' ? 'Portal veterinario' : 'Digitalizado por el productor'}
              />
            </Stack>

            {protocol.status === 'VOIDED' && (
              <Alert severity="warning" sx={{ fontSize: '0.8rem' }}>
                Protocolo anulado el {protocol.voided_at}. Motivo: {protocol.void_reason}
              </Alert>
            )}

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                Firma profesional
              </Typography>
              {protocol.is_signed ? (
                <Typography variant="body2">
                  {protocol.signed_veterinarian_name} — M.P. {protocol.signed_license_number} ·{' '}
                  {protocol.signed_at}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Sin firma profesional: el dato fue transcripto por el establecimiento.
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary">
                La matrícula queda congelada al firmar; editar el catálogo no altera este documento.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Evidencia documental ({protocol.attachments.length})
              </Typography>

              <Stack direction="row" flexWrap="wrap" gap={1}>
                {protocol.attachments.map((attachment) => (
                  <Button
                    key={attachment.id}
                    size="small"
                    variant="outlined"
                    href={attachment.download_url ?? undefined}
                    target="_blank"
                    rel="noopener"
                    disabled={!attachment.download_url}
                    startIcon={<FuseSvgIcon size={16}>heroicons-outline:document-magnifying-glass</FuseSvgIcon>}
                    sx={{ textTransform: 'none' }}
                  >
                    {attachment.file_name}
                    {attachment.needs_conversion ? ' (HEIC)' : ''}
                  </Button>
                ))}
                {protocol.attachments.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    Sin archivos adjuntos.
                  </Typography>
                )}
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Determinaciones ({protocol.samples_count})
              </Typography>

              <TableContainer sx={{ maxHeight: 260 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Caravana</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Patógeno</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Ronda</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>Resultado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {protocol.lab_samples.map((sample) => (
                      <TableRow key={sample.id} hover>
                        <TableCell>{sample.caravan_number ?? sample.caravan_id}</TableCell>
                        <TableCell>{sample.pathogen_name ?? sample.pathogen_code ?? '—'}</TableCell>
                        <TableCell>{sample.sample_round}º</TableCell>
                        <TableCell align="center">
                          <Chip
                            size="small"
                            label={STATUS_LABEL[sample.status]}
                            color={statusColor(sample.status)}
                            sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {protocol.status !== 'VOIDED' && (
              <Box>
                <Divider sx={{ mb: 2 }} />
                {!voidMode ? (
                  <Button
                    variant="text"
                    color="error"
                    onClick={() => setVoidMode(true)}
                    sx={{ fontWeight: 600, textTransform: 'none' }}
                    startIcon={<FuseSvgIcon size={16}>heroicons-outline:x-circle</FuseSvgIcon>}
                  >
                    Anular protocolo (corregir transcripción)
                  </Button>
                ) : (
                  <Stack spacing={1.5}>
                    <Alert severity="warning" sx={{ fontSize: '0.8rem' }}>
                      Anular revierte los hallazgos derivados y recalcula la aptitud de todas las
                      caravanas alcanzadas. Un protocolo confirmado no se edita: se anula y se reemite.
                    </Alert>
                    <TextField
                      label="Motivo de la anulación"
                      value={voidReason}
                      onChange={(event) => setVoidReason(event.target.value)}
                      variant="filled"
                      fullWidth
                      multiline
                      minRows={2}
                      sx={{ bgcolor: 'action.hover' }}
                    />
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button onClick={() => setVoidMode(false)} variant="text" sx={{ textTransform: 'none' }}>
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleVoid}
                        color="error"
                        variant="contained"
                        disabled={voidProtocol.isPending}
                        sx={{ textTransform: 'none', fontWeight: 700, boxShadow: 'none' }}
                      >
                        Confirmar anulación
                      </Button>
                    </Stack>
                  </Stack>
                )}
              </Box>
            )}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProtocolDetailDialog;
