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
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Box,
  Divider,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';
import { Batch } from '@/core/batches/domain/entities/Batch';
import { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import { useReplaceServiceBull } from '@/features/gestation/hooks/useReplaceServiceBull';

import RetiredBullSummaryCard from './RetiredBullSummaryCard';
import ReplacementReasonSelector from './ReplacementReasonSelector';
import ReplacementDestinationStep from './ReplacementDestinationStep';
import ReplacementBullSelector from './ReplacementBullSelector';

interface ReplaceServiceBullDialogProps {
  open: boolean;
  onClose: () => void;
  bull: Caravan | null;
  order: ServiceOrder | null;
  batches: Batch[];
  caravans: Caravan[];
  onSuccess?: () => void;
}

const STEPS = ['Diagnóstico y Destino', 'Toro Suplente y Confirmación'];

export const ReplaceServiceBullDialog: React.FC<ReplaceServiceBullDialogProps> = ({
  open,
  onClose,
  bull,
  order,
  batches,
  caravans,
  onSuccess,
}) => {
  const [activeStep, setActiveStep] = useState(0);

  // Form states
  const [reason, setReason] = useState('LAMENESS_FOOT');
  const [destinationBatchId, setDestinationBatchId] = useState<number | null>(null);
  const [replacementDate, setReplacementDate] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  });
  const [notes, setNotes] = useState('');
  const [replacementMaleId, setReplacementMaleId] = useState<number | null>(null);

  const { mutate: replaceBull, isPending } = useReplaceServiceBull();

  // Find original donor batch (procedencia original del toro)
  const defaultDonorBatch = useMemo(() => {
    if (!bull) return null;
    // Si el toro tiene lote previo registrado o buscamos un lote operativo de torada
    return batches.find((b) => b.isOperational() && b.name.toLowerCase().includes('toro')) ||
      batches.find((b) => b.isOperational()) || null;
  }, [bull, batches]);

  // Reset form when opened with a new bull
  useEffect(() => {
    if (open && bull) {
      setActiveStep(0);
      setReason('LAMENESS_FOOT');
      setDestinationBatchId(defaultDonorBatch?.id ?? null);
      setReplacementDate(new Date().toISOString().slice(0, 16));
      setNotes('');
      setReplacementMaleId(null);
    }
  }, [open, bull, defaultDonorBatch]);

  // Exclude caravans already in this order or the retired bull itself
  const excludeCaravanIds = useMemo(() => {
    const list = order?.all_male_caravan_ids ? [...order.all_male_caravan_ids] : (order?.male_caravan_ids ? [...order.male_caravan_ids] : []);
    if (bull && !list.includes(bull.id)) list.push(bull.id);
    return list;
  }, [order, bull]);

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = () => {
    if (!order || !bull || !replacementMaleId) return;

    replaceBull(
      {
        serviceOrderId: order.id,
        retired_male_caravan_id: bull.id,
        replacement_male_caravan_id: replacementMaleId,
        replacement_date: replacementDate,
        reason,
        destination_batch_id: reason === 'DEATH' ? null : destinationBatchId,
        notes: notes.trim() || null,
      },
      {
        onSuccess: () => {
          onClose();
          if (onSuccess) onSuccess();
        },
      }
    );
  };

  if (!bull || !order) return null;

  return (
    <Dialog
      open={open}
      onClose={isPending ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '8px',
          boxShadow: 1,
        },
      }}
    >
      {/* Encabezado Canónico */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
            Sustituir Reproductor en Servicio
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Orden {order.code} • Reporte de novedad clínica y reemplazo de torada
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} disabled={isPending}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </DialogTitle>

      {/* Stepper Superior */}
      <Box sx={{ px: 3, pt: 2.5, pb: 1 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>{label}</Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* Contenido del Modal */}
      <DialogContent sx={{ px: 3, py: 2 }}>
        {activeStep === 0 && (
          <Stack spacing={2.5}>
            <RetiredBullSummaryCard
              bull={bull}
              originalDonorBatchName={defaultDonorBatch?.name}
            />

            <ReplacementReasonSelector
              selectedReason={reason}
              onSelectReason={setReason}
            />

            <ReplacementDestinationStep
              batches={batches.filter((b) => b.isOperational())}
              destinationBatchId={destinationBatchId}
              onDestinationBatchChange={setDestinationBatchId}
              defaultDonorBatch={defaultDonorBatch}
              reason={reason}
              replacementDate={replacementDate}
              onReplacementDateChange={setReplacementDate}
              notes={notes}
              onNotesChange={setNotes}
            />
          </Stack>
        )}

        {activeStep === 1 && (
          <Stack spacing={2.5}>
            <ReplacementBullSelector
              selectedReplacementId={replacementMaleId}
              onSelectReplacementId={setReplacementMaleId}
              excludeCaravanIds={excludeCaravanIds}
              allCaravans={caravans}
            />
          </Stack>
        )}
      </DialogContent>

      <Divider />

      {/* Barra de Acciones */}
      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
        <Button
          onClick={activeStep === 0 ? onClose : handleBack}
          disabled={isPending}
          variant="outlined"
          color="inherit"
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px' }}
        >
          {activeStep === 0 ? 'Cancelar' : 'Anterior'}
        </Button>

        {activeStep === 0 ? (
          <Button
            onClick={handleNext}
            variant="contained"
            color="primary"
            disabled={!reason}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px', px: 3 }}
          >
            Siguiente: Seleccionar Suplente
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={!replacementMaleId || isPending}
            startIcon={isPending ? <CircularProgress size={18} color="inherit" /> : <FuseSvgIcon size={18}>heroicons-outline:arrows-right-left</FuseSvgIcon>}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '6px', px: 3 }}
          >
            {isPending ? 'Procesando Reemplazo...' : 'Confirmar Sustitución'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ReplaceServiceBullDialog;
