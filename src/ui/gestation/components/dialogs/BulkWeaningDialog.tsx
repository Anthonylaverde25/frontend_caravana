import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useBatches } from '@/features/batches/hooks/useBatches';
import { useBulkWean } from '@/features/caravans/hooks/useBulkWean';
import { toast } from 'sonner';
import QuickCreateWeaningBatchDialog, { DraftWeaningBatch } from '@/ui/batches/components/QuickCreateWeaningBatchDialog';

import { BulkWeaningStatsCards } from './bulk-weaning/BulkWeaningStatsCards';
import { BulkWeaningBatchSection } from './bulk-weaning/BulkWeaningBatchSection';
import { BulkWeaningWeightsTable } from './bulk-weaning/BulkWeaningWeightsTable';

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

/**
 * BulkWeaningDialog
 * Thin orchestrator container component adhering to the canonical service wizard visual standard.
 */
export const BulkWeaningDialog: React.FC<BulkWeaningDialogProps> = ({
  open,
  onClose,
  selectedCalves,
}) => {
  const { data: batches = [], isLoading: isLoadingBatches } = useBatches();
  const bulkWeanMutation = useBulkWean();

  // Form states
  const [targetBatchId, setTargetBatchId] = useState<string>('');
  const [draftBatch, setDraftBatch] = useState<DraftWeaningBatch | null>(null);
  const [quickCreateBatchOpen, setQuickCreateBatchOpen] = useState(false);
  const [weaningDate, setWeaningDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [weights, setWeights] = useState<Record<number, string>>({});

  const hasWeaningBatches = batches.some(
    (b: any) =>
      b.batch_type_code === 'WEANING' ||
      b.name?.toLowerCase().includes('destete') ||
      b.types?.some((t: any) => t.code === 'WEANING')
  );

  // Reset fields on open
  useEffect(() => {
    if (open) {
      setTargetBatchId('');
      setDraftBatch(null);
      setWeaningDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      const initialWeights: Record<number, string> = {};
      selectedCalves.forEach((c) => {
        initialWeights[c.calf_id] = '';
      });
      setWeights(initialWeights);
    }
  }, [open, selectedCalves]);

  const handleWeightChange = (calfId: number, value: string) => {
    setWeights((prev) => ({
      ...prev,
      [calfId]: value,
    }));
  };

  const isDraftSelected = targetBatchId === '__DRAFT_NEW_BATCH__';
  const selectedBatchInfo = isDraftSelected
    ? draftBatch
    : batches.find((b: any) => b.id === parseInt(targetBatchId));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!targetBatchId) {
      toast.error('Debe seleccionar un lote de destete');
      return;
    }

    const effectiveTargetBatchId = isDraftSelected ? null : parseInt(targetBatchId);

    const weaningsPayload = [];

    for (const calf of selectedCalves) {
      const wVal = weights[calf.calf_id];
      const weightNum = parseFloat(wVal);
      if (isNaN(weightNum) || weightNum <= 0) {
        toast.error(`Debe ingresar un peso válido mayor a 0 para la cría ${calf.calf_identification}`);
        return;
      }

      weaningsPayload.push({
        caravanId: calf.calf_id,
        targetBatchId: effectiveTargetBatchId as any,
        weaningDate,
        weaningWeight: weightNum,
        newCategory: null,
        notes: notes.trim() || null,
      });
    }

    try {
      await bulkWeanMutation.mutateAsync({
        weanings: weaningsPayload,
        newBatch: isDraftSelected && draftBatch ? {
          name: draftBatch.name,
          farm_id: draftBatch.farm_id,
          activity_id: draftBatch.activity_id,
          batch_type_id: draftBatch.batch_type_id,
        } : null,
      });
      onClose();
    } catch (err) {
      // Error handled by mutation
    }
  };

  const countMale = selectedCalves.filter((c) => c.calf_sex === 'M').length;
  const countFemale = selectedCalves.filter((c) => c.calf_sex === 'H').length;
  const isSubmitting = bulkWeanMutation.isPending;

  const calfCountLabel =
    selectedCalves.length === 1 ? '1 cría seleccionada' : `${selectedCalves.length} crías seleccionadas`;

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '8px',
          boxShadow: 1,
          bgcolor: 'background.paper',
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        {/* Canonical Header matching CreateServiceBatchWizardDialog */}
        <Box
          sx={{
            p: 2,
            px: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'text.primary' }}>
            Destete Masivo ({calfCountLabel})
          </Typography>
          <IconButton
            onClick={isSubmitting ? undefined : onClose}
            size="small"
            sx={{ color: 'primary.main' }}
          >
            <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
          </IconButton>
        </Box>

        {/* Dialog Content */}
        <DialogContent sx={{ p: 3, bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Summary Metric Cards */}
          <BulkWeaningStatsCards
            totalCount={selectedCalves.length}
            maleCount={countMale}
            femaleCount={countFemale}
          />

          {/* Section 1: General Batch & Target Parameters */}
          <BulkWeaningBatchSection
            targetBatchId={targetBatchId}
            setTargetBatchId={setTargetBatchId}
            batches={batches}
            isLoadingBatches={isLoadingBatches}
            isSubmitting={isSubmitting}
            hasWeaningBatches={hasWeaningBatches || !!draftBatch}
            onOpenQuickCreate={() => setQuickCreateBatchOpen(true)}
            weaningDate={weaningDate}
            setWeaningDate={setWeaningDate}
            notes={notes}
            setNotes={setNotes}
            selectedBatchInfo={selectedBatchInfo}
            draftBatch={draftBatch}
          />

          {/* Section 2: Individual Weights Table */}
          <BulkWeaningWeightsTable
            selectedCalves={selectedCalves}
            weights={weights}
            onWeightChange={handleWeightChange}
            disabled={isSubmitting}
          />
        </DialogContent>

        {/* Canonical Action Bar matching CreateServiceBatchWizardDialog */}
        <DialogActions
          sx={{
            p: 2,
            px: 3,
            bgcolor: 'background.default',
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Button
            onClick={onClose}
            disabled={isSubmitting}
            variant="text"
            sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'none' }}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || isLoadingBatches}
            sx={{
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              px: 3.5,
              fontWeight: 700,
              borderRadius: '6px',
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': { bgcolor: 'primary.dark' },
            }}
            startIcon={
              isSubmitting ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <FuseSvgIcon size={18}>heroicons-outline:check</FuseSvgIcon>
              )
            }
          >
            {isSubmitting ? 'Procesando Destetes...' : 'Confirmar Destete Masivo'}
          </Button>
        </DialogActions>
      </form>

      {/* Quick Create Batch Sub-Dialog */}
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

export default BulkWeaningDialog;
