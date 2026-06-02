import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  useTheme
} from '@mui/material';
import { useBatches } from '@/features/batches/hooks/useBatches';
import { useBulkWean } from '@/features/caravans/hooks/useBulkWean';
import { toast } from 'sonner';

interface SelectedCalf {
  calf_id: number;
  calf_identification: string;
  calf_sex: string | null;
  mother_identification: string;
}

interface BulkWeaningDialogProps {
  open: boolean;
  onClose: () => void;
  selectedCalves: SelectedCalf[];
}

const BulkWeaningDialog: React.FC<BulkWeaningDialogProps> = ({
  open,
  onClose,
  selectedCalves
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { data: batches = [], isLoading: isLoadingBatches } = useBatches();
  const bulkWeanMutation = useBulkWean();

  // Common fields states
  const [targetBatchId, setTargetBatchId] = useState<string>('');
  const [weaningDate, setWeaningDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [categoryMode, setCategoryMode] = useState<string>('auto'); // auto, no_change, novillito, vaquillona
  const [notes, setNotes] = useState<string>('');

  // Table weights states
  const [weights, setWeights] = useState<Record<number, string>>({});

  // Reset fields on open
  useEffect(() => {
    if (open) {
      setTargetBatchId('');
      setWeaningDate(new Date().toISOString().split('T')[0]);
      setCategoryMode('auto');
      setNotes('');
      // Initialize weights object
      const initialWeights: Record<number, string> = {};
      selectedCalves.forEach(c => {
        initialWeights[c.calf_id] = '';
      });
      setWeights(initialWeights);
    }
  }, [open, selectedCalves]);

  const handleWeightChange = (calfId: number, value: string) => {
    setWeights(prev => ({
      ...prev,
      [calfId]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!targetBatchId) {
      toast.error('Debe seleccionar un lote de destino');
      return;
    }

    // Validate weights
    const weaningsPayload = [];
    for (const calf of selectedCalves) {
      const wVal = weights[calf.calf_id];
      const weightNum = parseFloat(wVal);
      if (isNaN(weightNum) || weightNum <= 0) {
        toast.error(`Debe ingresar un peso válido mayor a 0 para la cría ${calf.calf_identification}`);
        return;
      }

      // Resolve category
      let resolvedCategory: string | null = null;
      if (categoryMode === 'auto') {
        if (calf.calf_sex === 'M') {
          resolvedCategory = 'novillito';
        } else if (calf.calf_sex === 'H') {
          resolvedCategory = 'vaquillona';
        }
      } else if (categoryMode === 'novillito') {
        resolvedCategory = 'novillito';
      } else if (categoryMode === 'vaquillona') {
        resolvedCategory = 'vaquillona';
      }

      weaningsPayload.push({
        caravanId: calf.calf_id,
        targetBatchId: parseInt(targetBatchId),
        weaningDate,
        weaningWeight: weightNum,
        newCategory: resolvedCategory,
        notes: notes.trim() || null
      });
    }

    try {
      await bulkWeanMutation.mutateAsync(weaningsPayload);
      onClose();
    } catch (err) {
      // Error handled by mutation
    }
  };

  const countMale = selectedCalves.filter(c => c.calf_sex === 'M').length;
  const countFemale = selectedCalves.filter(c => c.calf_sex === 'H').length;

  const isSubmitting = bulkWeanMutation.isPending;

  const tableHeaderStyle = {
    px: 2,
    py: 1,
    borderBottom: '2px solid',
    borderColor: theme.palette.divider,
    fontSize: '0.75rem',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const cellStyle = {
    px: 2,
    py: 1,
    fontSize: '0.8rem',
    borderBottom: '1px solid',
    borderColor: theme.palette.divider
  };

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 0,
          border: '1px solid',
          borderColor: theme.palette.divider,
          boxShadow: 'none'
        }
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid', borderColor: 'divider', px: 3, py: 2 }}>
          Destete Masivo ({selectedCalves.length} crías seleccionadas)
        </DialogTitle>

        <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Summary Banner */}
          <Box
            sx={{
              p: 2,
              bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8f9fa',
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              Crías seleccionadas: {selectedCalves.length}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                Machos: {countMale}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                Hembras: {countFemale}
              </Typography>
            </Box>
          </Box>

          {/* Common Fields */}
          <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', color: 'primary.main', mb: -1.5 }}>
            1. Datos Comunes (Se aplicarán a todas las crías)
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              select
              label="Lote de Destino"
              value={targetBatchId}
              onChange={(e) => setTargetBatchId(e.target.value)}
              required
              fullWidth
              size="small"
              disabled={isLoadingBatches || isSubmitting}
              InputLabelProps={{ shrink: true }}
              SelectProps={{ displayEmpty: true }}
            >
              <MenuItem value="" disabled>
                Seleccione un lote...
              </MenuItem>
              {batches.map((batch: any) => (
                <MenuItem key={batch.id} value={batch.id}>
                  {batch.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Fecha del Destete"
              type="date"
              value={weaningDate}
              onChange={(e) => setWeaningDate(e.target.value)}
              required
              fullWidth
              size="small"
              disabled={isSubmitting}
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              select
              label="Cambiar Categoría"
              value={categoryMode}
              onChange={(e) => setCategoryMode(e.target.value)}
              fullWidth
              size="small"
              disabled={isSubmitting}
              InputLabelProps={{ shrink: true }}
            >
              <MenuItem value="auto">Auto por Sexo (Machos → Novillito, Hembras → Vaquillona)</MenuItem>
              <MenuItem value="no_change">No cambiar (Permanecer como Ternero/a)</MenuItem>
              <MenuItem value="novillito">Cambiar todos a Novillito</MenuItem>
              <MenuItem value="vaquillona">Cambiar todos a Vaquillona</MenuItem>
            </TextField>

            <TextField
              label="Observaciones"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              size="small"
              disabled={isSubmitting}
              InputLabelProps={{ shrink: true }}
              placeholder="Notas generales..."
            />
          </Box>

          {/* Calves weights Table */}
          <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', color: 'primary.main', mb: -1.5 }}>
            2. Pesos Individuales (Obligatorio)
          </Typography>

          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              maxHeight: 280,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 0
            }}
          >
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={tableHeaderStyle}>Caravana Cría</TableCell>
                  <TableCell sx={tableHeaderStyle}>Madre</TableCell>
                  <TableCell sx={tableHeaderStyle}>Sexo</TableCell>
                  <TableCell sx={{ ...tableHeaderStyle, width: '30%' }}>Peso al Destete (kg)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedCalves.map((calf) => (
                  <TableRow key={calf.calf_id} hover>
                    <TableCell sx={{ ...cellStyle, fontWeight: 700, fontFamily: 'monospace' }}>
                      {calf.calf_identification}
                    </TableCell>
                    <TableCell sx={{ ...cellStyle, fontFamily: 'monospace', color: 'text.secondary' }}>
                      {calf.mother_identification}
                    </TableCell>
                    <TableCell sx={cellStyle}>
                      {calf.calf_sex === 'M' ? 'Macho' : calf.calf_sex === 'H' ? 'Hembra' : '-'}
                    </TableCell>
                    <TableCell sx={cellStyle}>
                      <TextField
                        type="number"
                        inputProps={{ min: 0.1, step: 0.1 }}
                        value={weights[calf.calf_id] || ''}
                        onChange={(e) => handleWeightChange(calf.calf_id, e.target.value)}
                        required
                        fullWidth
                        size="small"
                        disabled={isSubmitting}
                        placeholder="Ej: 180"
                        sx={{
                          '& .MuiInputBase-input': {
                            py: 0.75,
                            fontSize: '0.8rem',
                            fontFamily: 'monospace'
                          }
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider', gap: 1.5 }}>
          <Button
            onClick={onClose}
            disabled={isSubmitting}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 0,
              color: 'text.secondary'
            }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting || isLoadingBatches}
            startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{
              textTransform: 'none',
              fontWeight: 800,
              borderRadius: 0,
              boxShadow: 'none',
              color: '#ffffff',
              bgcolor: isDark ? '#1a56db' : '#2563eb',
              '&:hover': {
                bgcolor: isDark ? '#1e429f' : '#1d4ed8'
              }
            }}
          >
            {isSubmitting ? 'Procesando Destetes...' : 'Confirmar Destete Masivo'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default BulkWeaningDialog;
