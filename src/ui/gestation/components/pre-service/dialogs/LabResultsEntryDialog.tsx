import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Chip,
  Box,
  Stack,
  MenuItem,
  CircularProgress,
  IconButton,
  Tooltip,
  Paper,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useSnackbar } from 'notistack';
import { useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/utils/axios';
import { BullHealthEvaluation, Pathogen, BullLabSample } from '@/core/pre-service/domain/BullHealthEvaluation';

interface LabResultsEntryDialogProps {
  open: boolean;
  onClose: () => void;
  bulls: BullHealthEvaluation[];
  pathogens: Pathogen[];
}

interface PendingSampleRow {
  sample_id: number;
  caravan_id: number;
  caravan_number: string;
  sample_type: 'PREPUCE_SCRAPE' | 'BLOOD_SEROLOGY';
  sample_round: number;
  sample_date: string;
  tube_number: string;
  selected_status: 'NEGATIVE_CLEARED' | 'POSITIVE_DETECTED';
  selected_pathogen_id: string;
}

export const LabResultsEntryDialog: React.FC<LabResultsEntryDialogProps> = ({
  open,
  onClose,
  bulls,
  pathogens,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const [protocolNumber, setProtocolNumber] = useState('');
  const [resultDate, setResultDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract all pending lab samples from bulls
  const initialRows: PendingSampleRow[] = useMemo(() => {
    const rows: PendingSampleRow[] = [];
    bulls.forEach((b) => {
      if (b.lab_samples && Array.isArray(b.lab_samples)) {
        b.lab_samples.forEach((sample) => {
          if (sample.status === 'PENDING_RESULTS') {
            rows.push({
              sample_id: sample.id,
              caravan_id: b.caravan_id,
              caravan_number: b.caravan_number,
              sample_type: sample.sample_type,
              sample_round: sample.sample_round,
              sample_date: sample.sample_date,
              tube_number: sample.tube_number || 'S/N',
              selected_status: 'NEGATIVE_CLEARED',
              selected_pathogen_id: '',
            });
          }
        });
      }
    });
    return rows;
  }, [bulls]);

  const [sampleRows, setSampleRows] = useState<PendingSampleRow[]>([]);

  React.useEffect(() => {
    if (open) {
      setSampleRows(initialRows);
      setProtocolNumber(`LAB-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
    }
  }, [open, initialRows]);

  const handleUpdateStatus = (sampleId: number, status: 'NEGATIVE_CLEARED' | 'POSITIVE_DETECTED') => {
    setSampleRows((prev) =>
      prev.map((r) =>
        r.sample_id === sampleId
          ? {
              ...r,
              selected_status: status,
              selected_pathogen_id: status === 'NEGATIVE_CLEARED' ? '' : r.selected_pathogen_id,
            }
          : r
      )
    );
  };

  const handleUpdatePathogen = (sampleId: number, pathogenId: string) => {
    setSampleRows((prev) =>
      prev.map((r) => (r.sample_id === sampleId ? { ...r, selected_pathogen_id: pathogenId } : r))
    );
  };

  const handleMarkAllNegative = () => {
    setSampleRows((prev) =>
      prev.map((r) => ({
        ...r,
        selected_status: 'NEGATIVE_CLEARED',
        selected_pathogen_id: '',
      }))
    );
    enqueueSnackbar('Se marcaron todas las muestras como Negativas (Libres de patógenos).', {
      variant: 'info',
    });
  };

  const handleSubmit = async () => {
    if (!protocolNumber.trim()) {
      enqueueSnackbar('Ingrese el número de protocolo oficial del laboratorio.', { variant: 'warning' });
      return;
    }

    if (sampleRows.length === 0) {
      enqueueSnackbar('No hay muestras pendientes para procesar.', { variant: 'info' });
      return;
    }

    // Verify positive rows have a pathogen
    const invalidPositive = sampleRows.find(
      (r) => r.selected_status === 'POSITIVE_DETECTED' && !r.selected_pathogen_id
    );
    if (invalidPositive) {
      enqueueSnackbar(
        `Seleccione el patógeno detectado para el toro ${invalidPositive.caravan_number}.`,
        { variant: 'error' }
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await axiosInstance.post('/api/pre-service/lab-results', {
        protocol_number: protocolNumber,
        result_date: resultDate,
        notes: notes || null,
        results: sampleRows.map((r) => ({
          sample_id: r.sample_id,
          status: r.selected_status,
          pathogen_id: r.selected_pathogen_id ? parseInt(r.selected_pathogen_id, 10) : null,
        })),
      });

      enqueueSnackbar(
        `Protocolo analítico ${protocolNumber} procesado exitosamente (${sampleRows.length} muestras resueltas).`,
        { variant: 'success' }
      );
      queryClient.invalidateQueries({ queryKey: ['preServiceBulls'] });
      onClose();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Error al guardar los resultados de laboratorio.';
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const primaryColor = isDark ? '#60a5fa' : '#0a6ed1';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '8px',
          bgcolor: 'background.paper',
        },
      }}
    >
      <DialogTitle
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '8px',
              bgcolor: alpha(primaryColor, 0.12),
              color: primaryColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FuseSvgIcon size={22}>heroicons-outline:document-check</FuseSvgIcon>
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              Cargar Informe Oficial de Laboratorio
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Actualización diferida de raspajes prepuciales (ETS) y serología sanguínea (Brucelosis)
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose} disabled={isSubmitting}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2.5 }}>
        <Stack spacing={2.5}>
          {/* Header Metadata Inputs */}
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'action.hover', borderRadius: '8px', border: '1px solid', borderColor: 'divider' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                required
                size="small"
                label="N° Protocolo de Laboratorio"
                value={protocolNumber}
                onChange={(e) => setProtocolNumber(e.target.value)}
                placeholder="Ej: LAB-2026-894"
                sx={{ flex: 1 }}
              />

              <TextField
                required
                size="small"
                type="date"
                label="Fecha de Informe"
                value={resultDate}
                onChange={(e) => setResultDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ width: { xs: '100%', sm: 180 } }}
              />

              <TextField
                size="small"
                label="Laboratorio Emisor / Notas"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Laboratorio San Jerónimo"
                sx={{ flex: 1.2 }}
              />
            </Stack>
          </Paper>

          {/* Quick Bulk Action */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Muestras Pendientes ({sampleRows.length} tubos en espera)
            </Typography>

            <Button
              size="small"
              variant="outlined"
              color="success"
              onClick={handleMarkAllNegative}
              startIcon={<FuseSvgIcon size={16}>heroicons-outline:check</FuseSvgIcon>}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '6px' }}
            >
              ✓ Aprobar Tropa Negativa Completa (Todos Limpios)
            </Button>
          </Box>

          {/* Samples Table */}
          {sampleRows.length === 0 ? (
            <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: '8px', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="body2" color="text.secondary">
                No hay muestras de laboratorio en espera de resultados. Todos los toros muestreados ya cuentan con dictamen analítico.
              </Typography>
            </Paper>
          ) : (
            <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px', overflow: 'hidden' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem' }}>Caravana</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem' }}>Tipo de Muestra</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem' }}>N° Tubo</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem' }}>Fecha Muestra</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem', textAlign: 'center' }}>Resultado</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem' }}>Patógeno Detectado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sampleRows.map((row) => (
                    <TableRow key={row.sample_id} hover>
                      <TableCell sx={{ fontWeight: 800, fontFamily: 'monospace' }}>
                        {row.caravan_number}
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={
                            row.sample_type === 'PREPUCE_SCRAPE'
                              ? `Raspaje ETS (R${row.sample_round})`
                              : 'Serología Sangre'
                          }
                          color={row.sample_type === 'PREPUCE_SCRAPE' ? 'warning' : 'primary'}
                          sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                        />
                      </TableCell>

                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
                        {row.tube_number}
                      </TableCell>

                      <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                        {row.sample_date}
                      </TableCell>

                      <TableCell sx={{ textAlign: 'center' }}>
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Button
                            size="small"
                            variant={row.selected_status === 'NEGATIVE_CLEARED' ? 'contained' : 'outlined'}
                            color="success"
                            onClick={() => handleUpdateStatus(row.sample_id, 'NEGATIVE_CLEARED')}
                            sx={{
                              minWidth: 75,
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              py: 0.25,
                              textTransform: 'none',
                            }}
                          >
                            ✓ Negativo
                          </Button>

                          <Button
                            size="small"
                            variant={row.selected_status === 'POSITIVE_DETECTED' ? 'contained' : 'outlined'}
                            color="error"
                            onClick={() => handleUpdateStatus(row.sample_id, 'POSITIVE_DETECTED')}
                            sx={{
                              minWidth: 75,
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              py: 0.25,
                              textTransform: 'none',
                            }}
                          >
                            ✕ Positivo
                          </Button>
                        </Stack>
                      </TableCell>

                      <TableCell sx={{ minWidth: 160 }}>
                        {row.selected_status === 'POSITIVE_DETECTED' ? (
                          <TextField
                            select
                            size="small"
                            fullWidth
                            value={row.selected_pathogen_id}
                            onChange={(e) => handleUpdatePathogen(row.sample_id, e.target.value)}
                            label="Seleccionar Patógeno"
                            error={!row.selected_pathogen_id}
                            sx={{ '& .MuiInputBase-root': { fontSize: '0.75rem', py: 0.2 } }}
                          >
                            {pathogens.map((p) => (
                              <MenuItem key={p.id} value={String(p.id)}>
                                {p.name} ({p.code})
                              </MenuItem>
                            ))}
                          </TextField>
                        ) : (
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                            Sin hallazgos patológicos
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button onClick={onClose} disabled={isSubmitting} sx={{ textTransform: 'none' }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={isSubmitting || sampleRows.length === 0}
          startIcon={
            isSubmitting ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <FuseSvgIcon size={18}>heroicons-outline:check</FuseSvgIcon>
            )
          }
          sx={{ fontWeight: 600, textTransform: 'none', px: 2.5 }}
        >
          {isSubmitting ? 'Guardando...' : 'Confirmar y Actualizar Dictamen'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LabResultsEntryDialog;
