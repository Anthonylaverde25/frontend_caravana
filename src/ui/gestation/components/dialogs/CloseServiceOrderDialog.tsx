import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  Typography,
  Stack,
  CircularProgress,
  Box,
  Divider,
  TextField,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Alert,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useSnackbar } from 'notistack';
import { ServiceOrder, useCloseServiceOrderWithBullWithdrawal } from '@/features/gestation/hooks/useServiceOrders';
import { Batch } from '@/core/batches/domain/entities/Batch';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';
import { computeServiceOrderTemporalStatus } from '@/ui/gestation/utils/serviceOrderTemporalStatus';

interface CloseServiceOrderDialogProps {
  open: boolean;
  onClose: () => void;
  order: ServiceOrder | null;
  batch: Batch | null;
  batches: Batch[];
  caravans: Caravan[];
  onSuccess?: () => void;
}

export const CloseServiceOrderDialog: React.FC<CloseServiceOrderDialogProps> = ({
  open,
  onClose,
  order,
  batch,
  batches,
  caravans,
  onSuccess,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const { mutate: closeService, isPending } = useCloseServiceOrderWithBullWithdrawal();

  // Mode: COMMON (all bulls to one batch) vs INDIVIDUAL (custom per bull)
  const [destinationMode, setDestinationMode] = useState<'COMMON' | 'INDIVIDUAL'>('COMMON');
  const [withdrawalDate, setWithdrawalDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [commonDestinationBatchId, setCommonDestinationBatchId] = useState<number | ''>('');
  const [individualDestinations, setIndividualDestinations] = useState<Record<number, number>>({});
  const [observations, setObservations] = useState('');

  // Filter operational target batches for resting
  const operationalBatches = useMemo(() => {
    return batches.filter((b) => b.isOperational() && b.id !== batch?.id);
  }, [batches, batch]);

  // Default suggested resting batch (prefer name containing 'toro' or 'descanso')
  const defaultRestingBatch = useMemo(() => {
    return (
      operationalBatches.find(
        (b) =>
          b.name.toLowerCase().includes('toro') ||
          b.name.toLowerCase().includes('descanso') ||
          b.name.toLowerCase().includes('reproductor')
      ) ||
      operationalBatches[0] ||
      null
    );
  }, [operationalBatches]);

  // Active bulls in this order
  const activeBulls = useMemo(() => {
    if (!order) return [];
    let activeIds: number[] = [];

    if (order.male_details && order.male_details.length > 0) {
      activeIds = order.male_details
        .filter((d) => d.status === 'ACTIVE')
        .map((d) => d.male_caravan_id);
    } else if (order.active_male_caravan_ids && order.active_male_caravan_ids.length > 0) {
      activeIds = order.active_male_caravan_ids;
    } else {
      activeIds = order.male_caravan_ids || [];
    }

    const caravanMap = new Map<number, Caravan>();
    caravans.forEach((c) => caravanMap.set(c.id, c));

    return activeIds.reduce<Caravan[]>((acc, id) => {
      const found = caravanMap.get(id);
      if (found) acc.push(found);
      return acc;
    }, []);
  }, [order, caravans]);

  // Compute temporal context
  const temporal = useMemo(() => {
    return computeServiceOrderTemporalStatus(order);
  }, [order]);

  // Reset state upon opening
  useEffect(() => {
    if (open) {
      setWithdrawalDate(new Date().toISOString().slice(0, 10));
      setDestinationMode('COMMON');
      const initialBatchId = defaultRestingBatch?.id ?? (operationalBatches[0]?.id || '');
      setCommonDestinationBatchId(initialBatchId);

      const initialMap: Record<number, number> = {};
      activeBulls.forEach((b) => {
        if (typeof initialBatchId === 'number') {
          initialMap[b.id] = initialBatchId;
        }
      });
      setIndividualDestinations(initialMap);
      setObservations('');
    }
  }, [open, defaultRestingBatch, operationalBatches, activeBulls]);

  // Synchronize individual destinations when common batch changes
  const handleCommonBatchChange = (batchId: number) => {
    setCommonDestinationBatchId(batchId);
    setIndividualDestinations((prev) => {
      const next = { ...prev };
      activeBulls.forEach((b) => {
        next[b.id] = batchId;
      });
      return next;
    });
  };

  const handleIndividualBatchChange = (bullId: number, batchId: number) => {
    setIndividualDestinations((prev) => ({
      ...prev,
      [bullId]: batchId,
    }));
  };

  const isFormValid = useMemo(() => {
    if (!withdrawalDate) return false;
    if (activeBulls.length === 0) return true;

    if (destinationMode === 'COMMON') {
      return typeof commonDestinationBatchId === 'number' && commonDestinationBatchId > 0;
    }

    // Individual mode: each bull must have a destination
    return activeBulls.every((b) => Boolean(individualDestinations[b.id]));
  }, [withdrawalDate, activeBulls, destinationMode, commonDestinationBatchId, individualDestinations]);

  const handleSubmit = () => {
    if (!order || !isFormValid) return;

    const payload: {
      id: number;
      withdrawalDate: string;
      observations?: string;
      defaultDestinationBatchId?: number | null;
      bullDestinations?: { male_caravan_id: number; destination_batch_id: number }[];
    } = {
      id: order.id,
      withdrawalDate,
      observations: observations.trim() || undefined,
    };

    if (destinationMode === 'COMMON') {
      payload.defaultDestinationBatchId = Number(commonDestinationBatchId);
    } else {
      payload.bullDestinations = activeBulls.map((b) => ({
        male_caravan_id: b.id,
        destination_batch_id: individualDestinations[b.id] || Number(commonDestinationBatchId),
      }));
    }

    closeService(payload, {
      onSuccess: () => {
        enqueueSnackbar('¡Servicio finalizado exitosamente! Torada retirada a potrero de descanso.', {
          variant: 'success',
        });
        onClose();
        onSuccess?.();
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.message || err?.message || 'Error al finalizar el servicio';
        enqueueSnackbar(msg, { variant: 'error' });
      },
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '8px',
          boxShadow: 1,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1.5,
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 38,
              height: 38,
              borderRadius: '8px',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2',
              color: '#dc2626',
            }}
          >
            <FuseSvgIcon size={22}>lucide:flag</FuseSvgIcon>
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.2 }}>
              Finalizar Servicio Reproductivo
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Retiro total de torada y apertura de ventana hacia el tacto rectal
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" disabled={isPending}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2.5 }}>
        <Stack spacing={2.5}>
          {/* Order Context Banner */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: '8px',
              bgcolor: (theme) => theme.palette.background.default,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {batch?.name || `Lote #${order?.batch_id}`}
              </Typography>
              <Chip
                label={order?.code || 'ORDEN'}
                size="small"
                variant="outlined"
                sx={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.72rem' }}
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Inicio:{' '}
                <strong>
                  {order?.actual_start_date || order?.planned_start_date || 'Sin fecha'}
                </strong>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Fin Planificado:{' '}
                <strong>{temporal.effectivePlannedEndDate || '90 días'}</strong>
              </Typography>
              <Chip
                label={temporal.label}
                size="small"
                color={temporal.chipColor}
                sx={{ fontWeight: 700, height: 22, fontSize: '0.7rem' }}
              />
            </Box>
          </Paper>

          {/* Section 1: Effective Withdrawal Date */}
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', mb: 0.8, display: 'block' }}>
              1. Fecha Efectiva de Retiro de Toros
            </Typography>
            <TextField
              type="date"
              fullWidth
              variant="filled"
              size="small"
              value={withdrawalDate}
              onChange={(e) => setWithdrawalDate(e.target.value)}
              helperText="Indica cuándo fueron o serán desalojados los reproductores del potrero"
              InputLabelProps={{ shrink: true }}
              disabled={isPending}
            />
          </Box>

          <Divider />

          {/* Section 2: Resting Destination Batches */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary' }}>
                2. Lote(s) de Destino para la Torada ({activeBulls.length} machos)
              </Typography>
            </Box>

            <RadioGroup
              row
              value={destinationMode}
              onChange={(e) => setDestinationMode(e.target.value as 'COMMON' | 'INDIVIDUAL')}
              sx={{ mb: 1.5 }}
            >
              <FormControlLabel
                value="COMMON"
                control={<Radio size="small" />}
                label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Lote común para todos</Typography>}
              />
              <FormControlLabel
                value="INDIVIDUAL"
                control={<Radio size="small" />}
                label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Diferenciar por toro</Typography>}
              />
            </RadioGroup>

            {destinationMode === 'COMMON' ? (
              <TextField
                select
                fullWidth
                variant="filled"
                size="small"
                label="Lote de Toros en Descanso"
                value={commonDestinationBatchId}
                onChange={(e) => handleCommonBatchChange(Number(e.target.value))}
                disabled={isPending}
                helperText="Todos los toros activos regresarán juntos a este lote"
              >
                {operationalBatches.map((b) => (
                  <MenuItem key={b.id} value={b.id}>
                    {b.name}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <Paper variant="outlined" sx={{ borderRadius: '6px', overflow: 'hidden' }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: (theme) => theme.palette.action.hover }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>Toro</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>Lote Destino</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activeBulls.map((bull) => (
                      <TableRow key={bull.id}>
                        <TableCell sx={{ py: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: 'monospace', color: '#2563eb' }}>
                            #{bull.identification}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {bull.breed || 'Sin raza'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1 }}>
                          <TextField
                            select
                            size="small"
                            variant="filled"
                            fullWidth
                            value={individualDestinations[bull.id] || ''}
                            onChange={(e) => handleIndividualBatchChange(bull.id, Number(e.target.value))}
                            disabled={isPending}
                          >
                            {operationalBatches.map((b) => (
                              <MenuItem key={b.id} value={b.id}>
                                {b.name}
                              </MenuItem>
                            ))}
                          </TextField>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            )}
          </Box>

          {/* Section 3: Observations */}
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', mb: 0.8, display: 'block' }}>
              3. Observaciones Zootécnicas de Cierre
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={2}
              variant="filled"
              size="small"
              placeholder="Ej: Toros retirados en buen estado corporal. Sin bajas sanitarias. Quedan 100 vientres listos para tacto en 60 días."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              disabled={isPending}
            />
          </Box>

          {/* Zootechnical Advisory Note */}
          <Alert severity="info" icon={<FuseSvgIcon size={20}>lucide:info</FuseSvgIcon>} sx={{ borderRadius: '6px' }}>
            <Typography variant="caption" sx={{ lineHeight: 1.4 }}>
              <strong>Efecto en el Rodeo:</strong> Al confirmar, las caravanas de los toros se transferirán al lote de descanso con movimiento auditado. La orden pasará a estado completado y los vientres iniciarán el período de reposo previo al diagnóstico de preñez (tacto rectal en 60 días).
            </Typography>
          </Alert>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          justifyContent: 'space-between',
        }}
      >
        <Button onClick={onClose} disabled={isPending} sx={{ textTransform: 'none', fontWeight: 600 }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={!isFormValid || isPending}
          startIcon={
            isPending ? <CircularProgress size={16} color="inherit" /> : <FuseSvgIcon size={18}>lucide:check-circle</FuseSvgIcon>
          }
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: '6px',
            bgcolor: '#dc2626',
            '&:hover': { bgcolor: '#b91c1c' },
          }}
        >
          {isPending ? 'Finalizando...' : 'Confirmar Retiro & Cerrar Servicio'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CloseServiceOrderDialog;
