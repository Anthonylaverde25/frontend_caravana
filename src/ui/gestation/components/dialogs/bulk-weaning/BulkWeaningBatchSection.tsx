import React from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

interface BulkWeaningBatchSectionProps {
  targetBatchId: string;
  setTargetBatchId: (val: string) => void;
  batches: any[];
  isLoadingBatches: boolean;
  isSubmitting: boolean;
  hasWeaningBatches: boolean;
  onOpenQuickCreate: () => void;
  weaningDate: string;
  setWeaningDate: (val: string) => void;
  notes: string;
  setNotes: (val: string) => void;
  selectedBatchInfo: any;
  draftBatch?: any;
}

export const BulkWeaningBatchSection: React.FC<BulkWeaningBatchSectionProps> = ({
  targetBatchId,
  setTargetBatchId,
  batches,
  isLoadingBatches,
  isSubmitting,
  hasWeaningBatches,
  onOpenQuickCreate,
  weaningDate,
  setWeaningDate,
  notes,
  setNotes,
  selectedBatchInfo,
  draftBatch,
}) => {
  const isSelectedWeaning =
    selectedBatchInfo?.batch_type_code === 'WEANING' ||
    selectedBatchInfo?.isDraft ||
    selectedBatchInfo?.name?.toLowerCase().includes('destete');

  const weaningBatches = batches.filter(
    (b: any) =>
      b.batch_type_code === 'WEANING' ||
      b.name?.toLowerCase().includes('destete') ||
      b.types?.some((t: any) => t.code === 'WEANING')
  );

  return (
    <Stack spacing={2}>
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 700,
          color: 'text.primary',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <FuseSvgIcon size={18} sx={{ color: 'primary.main' }}>
          heroicons-outline:adjustments-horizontal
        </FuseSvgIcon>
        1. Parámetros Generales de Destino
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, alignItems: 'start' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <TextField
            select
            label="Lote de Destete *"
            value={targetBatchId}
            onChange={(e) => {
              if (e.target.value === '__NEW_WEANING_BATCH__') {
                onOpenQuickCreate();
                return;
              }
              setTargetBatchId(e.target.value);
            }}
            required
            fullWidth
            size="small"
            variant="filled"
            disabled={isLoadingBatches || isSubmitting}
            InputLabelProps={{ shrink: true }}
            SelectProps={{ displayEmpty: true }}
            sx={{ bgcolor: 'action.hover' }}
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
                        border: '1px solid rgba(139, 92, 246, 0.3)',
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
                '&:hover': { bgcolor: 'rgba(139, 92, 246, 0.08)' },
              }}
            >
              <FuseSvgIcon size={18} sx={{ color: '#8b5cf6' }}>
                heroicons-outline:plus-circle
              </FuseSvgIcon>
              + Crear Lote de Destete...
            </MenuItem>
          </TextField>

          {weaningBatches.length === 0 && !draftBatch && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 0.5, mt: 0.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic', fontSize: '0.72rem' }}>
                ¿No tienes un lote de destete?
              </Typography>
              <Button
                size="small"
                variant="text"
                onClick={onOpenQuickCreate}
                startIcon={<FuseSvgIcon size={14}>heroicons-outline:plus</FuseSvgIcon>}
                sx={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'none', color: '#8b5cf6', p: 0.2 }}
              >
                Crear Lote de Destete
              </Button>
            </Box>
          )}
        </Box>

        <TextField
          label="Fecha del Destete *"
          type="date"
          value={weaningDate}
          onChange={(e) => setWeaningDate(e.target.value)}
          required
          fullWidth
          size="small"
          variant="filled"
          disabled={isSubmitting}
          InputLabelProps={{ shrink: true }}
          sx={{ bgcolor: 'action.hover' }}
        />
      </Box>

      {selectedBatchInfo && (
        <Paper
          variant="outlined"
          sx={{
            p: 1.5,
            borderRadius: '8px',
            bgcolor: 'action.hover',
            border: 1,
            borderColor: 'divider',
            borderLeft: 4,
            borderLeftColor: '#8b5cf6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {selectedBatchInfo.name}
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
            {selectedBatchInfo.isDraft && (
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
              • Actividad: <strong>{selectedBatchInfo.activity_name || 'Cría'}</strong>
              {selectedBatchInfo.farm_name ? ` • Campo: ${selectedBatchInfo.farm_name}` : ''}
            </Typography>
          </Box>
        </Paper>
      )}

      <TextField
        label="Observaciones Generales"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        fullWidth
        size="small"
        variant="filled"
        disabled={isSubmitting}
        InputLabelProps={{ shrink: true }}
        placeholder="Notas de destete, sanitación, etc."
        sx={{ bgcolor: 'action.hover' }}
      />
    </Stack>
  );
};

export default BulkWeaningBatchSection;
