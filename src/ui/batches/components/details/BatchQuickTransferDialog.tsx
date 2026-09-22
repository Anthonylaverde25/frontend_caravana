import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { useMemo, useState } from 'react';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useCompany } from '@/contexts/CompanyContext';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import { useBatches } from '@/features/batches/hooks/useBatches';
import { useBulkTransferCaravans } from '@/features/caravans/hooks/useBulkTransferCaravans';

interface BatchQuickTransferDialogProps {
  open: boolean;
  onClose: () => void;
  batch: any;
}

export default function BatchQuickTransferDialog({
  open,
  onClose,
  batch,
}: BatchQuickTransferDialogProps) {
  const theme = useTheme();
  const { activeCompanyId } = useCompany();
  const { data: allCaravans = [], isLoading: isLoadingCaravans } = useCaravans(
    open ? activeCompanyId : null,
    'own'
  );
  const { data: allBatches = [], isLoading: isLoadingBatches } = useBatches();
  const { mutate: transfer, isPending } = useBulkTransferCaravans();

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [targetBatchId, setTargetBatchId] = useState<string>('__RESERVE__');
  const [movementDate, setMovementDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [reason, setReason] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Caravans belonging to this batch
  const batchCaravans = useMemo(() => {
    if (!batch?.id) return [];
    return allCaravans.filter((c: any) => c.batch_id === batch.id);
  }, [allCaravans, batch?.id]);

  // Destination batches (exclude current batch)
  const candidateBatches = useMemo(() => {
    return allBatches.filter((b: any) => b.id !== batch?.id);
  }, [allBatches, batch?.id]);

  // Filtered caravans by search
  const filteredCaravans = useMemo(() => {
    if (!searchTerm.trim()) return batchCaravans;
    const term = searchTerm.toLowerCase();
    return batchCaravans.filter((c: any) =>
      c.identification.toLowerCase().includes(term)
    );
  }, [batchCaravans, searchTerm]);

  // Calculations for preview
  const selectedCaravans = useMemo(() => {
    return batchCaravans.filter((c: any) => selectedIds.includes(c.id));
  }, [batchCaravans, selectedIds]);

  const movingMass = useMemo(() => {
    return selectedCaravans.reduce(
      (sum: number, c: any) => sum + (c.entry_weight ?? 0),
      0
    );
  }, [selectedCaravans]);

  const handleToggle = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds(batchCaravans.map((c: any) => c.id));
  };

  const handleClear = () => {
    setSelectedIds([]);
  };

  const handleSelectHeavyHalf = () => {
    const sorted = [...batchCaravans].sort(
      (a: any, b: any) => (b.entry_weight ?? 0) - (a.entry_weight ?? 0)
    );
    const halfCount = Math.ceil(sorted.length / 2);
    setSelectedIds(sorted.slice(0, halfCount).map((c: any) => c.id));
  };

  const handleSelectLightHalf = () => {
    const sorted = [...batchCaravans].sort(
      (a: any, b: any) => (a.entry_weight ?? 0) - (b.entry_weight ?? 0)
    );
    const halfCount = Math.ceil(sorted.length / 2);
    setSelectedIds(sorted.slice(0, halfCount).map((c: any) => c.id));
  };

  const handleSubmit = () => {
    if (selectedIds.length === 0) return;

    const resolvedTargetId =
      targetBatchId === '__RESERVE__' ? null : Number(targetBatchId);

    transfer(
      {
        caravanIds: selectedIds,
        targetBatchId: resolvedTargetId,
        movementDate: movementDate || null,
        reason:
          reason.trim() ||
          `Egreso / Traslado de ${selectedIds.length} cabezas desde ${batch.name}`,
      },
      {
        onSuccess: () => {
          setSelectedIds([]);
          onClose();
        },
      }
    );
  };

  const filledInputStyle = {
    '& .MuiFilledInput-root': {
      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc',
      borderRadius: '6px',
      border: '1px solid',
      borderColor: 'divider',
      '&:hover': {
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9',
      },
      '&.Mui-focused': {
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9',
        borderColor: 'primary.main',
      },
      '&:before, &:after': { display: 'none' },
    },
  };

  if (!batch) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: '8px',
          boxShadow: 1,
          bgcolor: 'background.paper',
        },
      }}
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
        <Box>
          <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
            Egresar / Trasladar Animales
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Lote Origen: <Box component="span" sx={{ fontWeight: 700, color: 'primary.main' }}>{batch.name}</Box> ({batchCaravans.length} cabezas actuales)
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Destination and Date configuration */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField
              select
              label="Lote de Destino"
              value={targetBatchId}
              onChange={(e) => setTargetBatchId(e.target.value)}
              variant="filled"
              fullWidth
              sx={filledInputStyle}
              helperText="Selecciona a dónde se mueven los animales"
            >
              <MenuItem value="__RESERVE__">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FuseSvgIcon size={16} sx={{ color: 'warning.main' }}>
                    heroicons-outline:archive-box
                  </FuseSvgIcon>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    Lote Reserva del Sistema
                  </Typography>
                </Box>
              </MenuItem>
              <Divider sx={{ my: 0.5 }} />
              {candidateBatches.map((b: any) => (
                <MenuItem key={b.id} value={String(b.id)}>
                  {b.name} ({b.caravans_count ?? 0} cabezas)
                </MenuItem>
              ))}
            </TextField>

            <TextField
              type="date"
              label="Fecha de Egreso / Movimiento"
              value={movementDate}
              onChange={(e) => setMovementDate(e.target.value)}
              variant="filled"
              fullWidth
              InputLabelProps={{ shrink: true }}
              helperText="Fecha en que se dibujará el escalón en el gráfico"
              sx={filledInputStyle}
            />
          </Box>

          {/* Reason */}
          <TextField
            label="Motivo u Observación (Opcional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ej: Clasificación por peso para recría"
            variant="filled"
            fullWidth
            sx={filledInputStyle}
          />

          <Divider />

          {/* Animal selection header & quick chips */}
          <Box>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              flexWrap="wrap"
              gap={1}
              sx={{ mb: 1.5 }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Seleccionar Animales a Egresar ({selectedIds.length} de {batchCaravans.length} seleccionados)
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip
                  label="Todos"
                  size="small"
                  onClick={handleSelectAll}
                  clickable
                  variant={selectedIds.length === batchCaravans.length && batchCaravans.length > 0 ? 'filled' : 'outlined'}
                  color="primary"
                  sx={{ fontWeight: 600 }}
                />
                <Chip
                  label="50% Más Pesados"
                  size="small"
                  onClick={handleSelectHeavyHalf}
                  clickable
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
                <Chip
                  label="50% Más Livianos"
                  size="small"
                  onClick={handleSelectLightHalf}
                  clickable
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
                <Chip
                  label="Desmarcar"
                  size="small"
                  onClick={handleClear}
                  clickable
                  variant="outlined"
                  disabled={selectedIds.length === 0}
                  sx={{ fontWeight: 600 }}
                />
              </Stack>
            </Stack>

            {/* Search filter */}
            <TextField
              size="small"
              placeholder="Buscar caravana..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="filled"
              fullWidth
              InputProps={{
                startAdornment: (
                  <FuseSvgIcon size={18} sx={{ color: 'text.secondary', mr: 1 }}>
                    heroicons-outline:magnifying-glass
                  </FuseSvgIcon>
                ),
              }}
              sx={{ mb: 1.5, ...filledInputStyle }}
            />

            {/* Animal list */}
            {isLoadingCaravans ? (
              <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={24} />
              </Box>
            ) : batchCaravans.length === 0 ? (
              <Alert severity="warning" sx={{ fontSize: '0.8rem' }}>
                Este lote no posee animales registrados actualmente para egresar.
              </Alert>
            ) : (
              <Box
                sx={{
                  maxHeight: 220,
                  overflowY: 'auto',
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: '6px',
                  bgcolor: theme.palette.mode === 'dark' ? 'background.default' : '#fafafa',
                }}
              >
                <List dense disablePadding>
                  {filteredCaravans.map((caravan: any) => {
                    const isChecked = selectedIds.includes(caravan.id);
                    return (
                      <ListItem key={caravan.id} disablePadding divider>
                        <ListItemButton
                          onClick={() => handleToggle(caravan.id)}
                          dense
                          sx={{ py: 0.5 }}
                        >
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <Checkbox
                              edge="start"
                              checked={isChecked}
                              tabIndex={-1}
                              disableRipple
                              size="small"
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                  {caravan.identification}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                  ({caravan.sex === 'M' ? 'Macho' : 'Hembra'})
                                </Typography>
                              </Stack>
                            }
                            secondary={
                              caravan.entry_weight != null
                                ? `Peso: ${caravan.entry_weight} kg`
                                : 'Sin peso registrado'
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
              </Box>
            )}
          </Box>

          {/* Live Preview Panel */}
          {selectedIds.length > 0 && (
            <Box
              sx={{
                p: 2,
                borderRadius: '6px',
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(234, 88, 12, 0.1)' : '#fff7ed',
                border: '1px solid',
                borderColor: '#ea580c',
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#ea580c', textTransform: 'uppercase' }}>
                Impacto en el Gráfico del Lote
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mt: 1 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Animales que salen</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedIds.length} cabezas</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Kilos a restar</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{movingMass.toLocaleString('es-AR')} kg</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Lote origen quedará con</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {batchCaravans.length - selectedIds.length} cabezas
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          px: 3,
          bgcolor: theme.palette.mode === 'dark' ? 'background.default' : '#f8fafc',
          borderTop: 1,
          borderColor: 'divider',
          gap: 1.5,
        }}
      >
        <Button onClick={onClose} variant="text" sx={{ fontWeight: 600, textTransform: 'none' }}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={selectedIds.length === 0 || isPending}
          sx={{
            px: 3,
            fontWeight: 700,
            borderRadius: '6px',
            textTransform: 'none',
            boxShadow: 'none',
            bgcolor: '#ea580c',
            '&:hover': { bgcolor: '#c2410c' },
          }}
        >
          {isPending
            ? 'Transfiriendo...'
            : `Confirmar Egreso (${selectedIds.length} cabezas)`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
