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
  CircularProgress,
  useTheme
} from '@mui/material';
import { useBatches } from '@/features/batches/hooks/useBatches';
import { useWeanCaravan } from '@/features/caravans/hooks/useWeanCaravan';
import { toast } from 'sonner';

interface WeaningDialogProps {
  open: boolean;
  onClose: () => void;
  calfId: number;
  calfIdentification: string;
  motherIdentification: string;
  calfSex: string | null;
}

const WeaningDialog: React.FC<WeaningDialogProps> = ({
  open,
  onClose,
  calfId,
  calfIdentification,
  motherIdentification,
  calfSex
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { data: batches = [], isLoading: isLoadingBatches } = useBatches();
  const weanMutation = useWeanCaravan();

  // Form states
  const [targetBatchId, setTargetBatchId] = useState<string>('');
  const [weaningDate, setWeaningDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [weaningWeight, setWeaningWeight] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('no_change');
  const [notes, setNotes] = useState<string>('');

  // Set default category based on sex when dialog opens
  useEffect(() => {
    if (open) {
      if (calfSex === 'M') {
        setNewCategory('novillito');
      } else if (calfSex === 'H') {
        setNewCategory('vaquillona');
      } else {
        setNewCategory('no_change');
      }
      // Reset other states
      setTargetBatchId('');
      setWeaningWeight('');
      setNotes('');
      setWeaningDate(new Date().toISOString().split('T')[0]);
    }
  }, [open, calfSex]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!targetBatchId) {
      toast.error('Debe seleccionar un lote de destino');
      return;
    }

    const weightNum = parseFloat(weaningWeight);
    if (isNaN(weightNum) || weightNum <= 0) {
      toast.error('Debe ingresar un peso válido mayor a 0');
      return;
    }

    try {
      await weanMutation.mutateAsync({
        caravanId: calfId,
        targetBatchId: parseInt(targetBatchId),
        weaningDate,
        weaningWeight: weightNum,
        newCategory: newCategory === 'no_change' ? null : newCategory,
        notes: notes.trim() || null
      });
      onClose();
    } catch (err) {
      // Error handled by mutation
    }
  };

  const isSubmitting = weanMutation.isPending;

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      maxWidth="sm"
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
          Registrar Destete de Ternero
        </DialogTitle>

        <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Metadata Display */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 2,
              p: 2,
              bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8f9fa',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                CRÍA (TERNERO)
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 800, fontFamily: 'monospace' }}>
                {calfIdentification}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                MADRE
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 800, fontFamily: 'monospace' }}>
                {motherIdentification}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                SEXO
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 800 }}>
                {calfSex === 'M' ? 'Macho' : calfSex === 'H' ? 'Hembra' : 'No especificado'}
              </Typography>
            </Box>
          </Box>

          {/* Form Fields */}
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

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              label="Peso al Destete (kg)"
              type="number"
              inputProps={{ min: 0.1, step: 0.1 }}
              value={weaningWeight}
              onChange={(e) => setWeaningWeight(e.target.value)}
              required
              fullWidth
              size="small"
              disabled={isSubmitting}
              InputLabelProps={{ shrink: true }}
              placeholder="Ej: 180"
            />

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

          <TextField
            select
            label="Cambiar Categoría"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            fullWidth
            size="small"
            disabled={isSubmitting}
            InputLabelProps={{ shrink: true }}
          >
            <MenuItem value="no_change">No cambiar (Permanecer como Ternero/a)</MenuItem>
            <MenuItem value="novillito">Novillito</MenuItem>
            <MenuItem value="vaquillona">Vaquillona</MenuItem>
          </TextField>

          <TextField
            label="Observaciones"
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            size="small"
            disabled={isSubmitting}
            InputLabelProps={{ shrink: true }}
            placeholder="Añada notas sobre el proceso de destete..."
          />
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
            {isSubmitting ? 'Destetando...' : 'Confirmar Destete'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default WeaningDialog;
