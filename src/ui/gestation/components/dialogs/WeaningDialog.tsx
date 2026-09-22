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
  Divider,
  Chip,
  useTheme
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useBatches } from '@/features/batches/hooks/useBatches';
import { useWeanCaravan } from '@/features/caravans/hooks/useWeanCaravan';
import { toast } from 'sonner';
import QuickCreateWeaningBatchDialog, { DraftWeaningBatch } from '@/ui/batches/components/QuickCreateWeaningBatchDialog';

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
  const [draftBatch, setDraftBatch] = useState<DraftWeaningBatch | null>(null);
  const [quickCreateBatchOpen, setQuickCreateBatchOpen] = useState(false);
  const [weaningDate, setWeaningDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [weaningWeight, setWeaningWeight] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const weaningBatches = batches.filter(
    (b: any) =>
      b.batch_type_code === 'WEANING' ||
      b.name?.toLowerCase().includes('destete') ||
      b.types?.some((t: any) => t.code === 'WEANING')
  );

  const hasWeaningBatches = weaningBatches.length > 0;

  useEffect(() => {
    if (open) {
      setTargetBatchId('');
      setDraftBatch(null);
      setWeaningWeight('');
      setNotes('');
      setWeaningDate(new Date().toISOString().split('T')[0]);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!targetBatchId) {
      toast.error('Debe seleccionar un lote de destete');
      return;
    }

    const weightNum = parseFloat(weaningWeight);
    if (isNaN(weightNum) || weightNum <= 0) {
      toast.error('Debe ingresar un peso válido mayor a 0');
      return;
    }

    const isDraft = targetBatchId === '__DRAFT_NEW_BATCH__';
    const effectiveTargetBatchId = isDraft ? null : parseInt(targetBatchId);

    try {
      await weanMutation.mutateAsync({
        caravanId: calfId,
        targetBatchId: effectiveTargetBatchId,
        newBatch: isDraft && draftBatch ? {
          name: draftBatch.name,
          farm_id: draftBatch.farm_id,
          activity_id: draftBatch.activity_id,
          batch_type_id: draftBatch.batch_type_id,
        } : null,
        weaningDate,
        weaningWeight: weightNum,
        newCategory: null,
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
          borderRadius: '8px',
          boxShadow: 1,
          bgcolor: 'background.paper',
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
            label="Lote de Destete *"
            value={targetBatchId}
            onChange={(e) => {
              const newId = e.target.value;
              if (newId === '__NEW_WEANING_BATCH__') {
                setQuickCreateBatchOpen(true);
                return;
              }
              setTargetBatchId(newId);
            }}
            required
            fullWidth
            size="small"
            disabled={isLoadingBatches || isSubmitting}
            InputLabelProps={{ shrink: true }}
            SelectProps={{ displayEmpty: true }}
          >
            <MenuItem value="" disabled>
              Seleccione un lote de destete...
            </MenuItem>
            {draftBatch && (
              <MenuItem value="__DRAFT_NEW_BATCH__">
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#8b5cf6' }} />
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#8b5cf6' }}>
                      {draftBatch.name}
                    </Typography>
                  </Box>
                  <Chip
                    label="Nuevo (Al confirmar)"
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      bgcolor: 'rgba(139, 92, 246, 0.15)',
                      color: '#8b5cf6',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                    }}
                  />
                </Box>
              </MenuItem>
            )}
            {weaningBatches.map((batch: any) => (
              <MenuItem key={batch.id} value={batch.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#8b5cf6' }} />
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {batch.name}
                      {batch.farm_name && (
                        <Typography component="span" variant="caption" sx={{ color: 'text.secondary', ml: 1 }}>
                          ({batch.farm_name})
                        </Typography>
                      )}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box
                      component="span"
                      sx={{
                        px: 1,
                        py: 0.25,
                        borderRadius: '4px',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        bgcolor: 'rgba(139, 92, 246, 0.15)',
                        color: '#8b5cf6',
                        border: '1px solid rgba(139, 92, 246, 0.3)'
                      }}
                    >
                      Destete
                    </Box>
                  </Box>
                </Box>
              </MenuItem>
            ))}

            <Divider />
            <MenuItem
              value="__NEW_WEANING_BATCH__"
              sx={{
                fontWeight: 800,
                color: '#8b5cf6',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                py: 1,
                '&:hover': { bgcolor: 'rgba(139, 92, 246, 0.08)' }
              }}
            >
              <FuseSvgIcon size={18} sx={{ color: '#8b5cf6' }}>heroicons-outline:plus-circle</FuseSvgIcon>
              + Crear Lote de Destete...
            </MenuItem>
          </TextField>

          {!hasWeaningBatches && !draftBatch && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: -1, px: 0.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic', fontSize: '0.75rem' }}>
                ¿No tienes un lote de destete creado?
              </Typography>
              <Button
                size="small"
                variant="text"
                onClick={() => setQuickCreateBatchOpen(true)}
                startIcon={<FuseSvgIcon size={14}>heroicons-outline:plus</FuseSvgIcon>}
                sx={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'none', color: '#8b5cf6', p: 0.2 }}
              >
                Crear Lote de Destete
              </Button>
            </Box>
          )}

          {targetBatchId && (() => {
            const isDraft = targetBatchId === '__DRAFT_NEW_BATCH__';
            const b = isDraft ? draftBatch : batches.find((item: any) => item.id === parseInt(targetBatchId));
            if (!b) return null;
            return (
              <Box
                sx={{
                  p: 1.5,
                  bgcolor: 'action.hover',
                  borderRadius: '6px',
                  borderLeft: '4px solid',
                  borderColor: '#8b5cf6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {b.name}
                  </Typography>
                  <Box
                    component="span"
                    sx={{
                      px: 0.75,
                      py: 0.2,
                      borderRadius: '4px',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      bgcolor: 'rgba(139, 92, 246, 0.15)',
                      color: '#8b5cf6',
                    }}
                  >
                    LOTE DE DESTETE
                  </Box>
                  {isDraft && (
                    <Box
                      component="span"
                      sx={{
                        px: 0.75,
                        py: 0.2,
                        borderRadius: '4px',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        bgcolor: 'rgba(16, 185, 129, 0.15)',
                        color: '#059669',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                      }}
                    >
                      NUEVO (SE CREARÁ EN DB AL CONFIRMAR)
                    </Box>
                  )}
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    • Actividad: <strong>{b.activity_name || 'Cría'}</strong>
                    {b.farm_name ? ` • Establecimiento: ${b.farm_name}` : ''}
                  </Typography>
                </Box>
              </Box>
            );
          })()}

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

      <QuickCreateWeaningBatchDialog
        open={quickCreateBatchOpen}
        onClose={() => setQuickCreateBatchOpen(false)}
        onCreated={(draft) => {
          setDraftBatch(draft);
          setTargetBatchId('__DRAFT_NEW_BATCH__');
          setQuickCreateBatchOpen(false);
        }}
      />
    </Dialog>
  );
};

export default WeaningDialog;
