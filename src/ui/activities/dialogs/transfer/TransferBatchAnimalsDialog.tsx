import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  IconButton,
  Stack,
  Typography
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useCompany } from '@/contexts/CompanyContext';
import { useActivities } from '@/features/activities/hooks/useActivities';
import { useBatchTypes } from '@/features/batch-types/hooks/useBatchTypes';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import { useBulkTransferCaravans } from '@/features/caravans/hooks/useBulkTransferCaravans';
import { ActivityBatch } from '@/core/activities/domain/entities/Activity';
import TransferDestinationStep, { NewBatchDraft } from './TransferDestinationStep';
import TransferAnimalsStep from './TransferAnimalsStep';

interface TransferBatchAnimalsDialogProps {
  open: boolean;
  onClose: () => void;
  /** Source batch, as shown on the production sheet. */
  batch: (ActivityBatch & { activityName?: string }) | null;
}

const EMPTY_DRAFT: NewBatchDraft = { name: '' };

/**
 * Moves animals from one batch to another.
 *
 * This is what advances livestock through production stages: a batch never changes
 * its (activity, type) pair, so the transfer of its caravans is the movement, and it
 * is what makes it possible to open one weaning batch into several specialised ones.
 */
export default function TransferBatchAnimalsDialog({
  open,
  onClose,
  batch
}: TransferBatchAnimalsDialogProps) {
  const { activeCompanyId } = useCompany();
  const { data: activities = [] } = useActivities(activeCompanyId);
  const { data: batchTypes = [], isLoading: isLoadingBatchTypes } = useBatchTypes();
  const { data: caravans = [], isLoading: isLoadingCaravans } = useCaravans(
    open ? activeCompanyId : null,
    'own'
  );
  const { mutate: transfer, isPending } = useBulkTransferCaravans();

  const [mode, setMode] = useState<'existing' | 'new'>('new');
  const [targetBatchId, setTargetBatchId] = useState<number | undefined>(undefined);
  const [draft, setDraft] = useState<NewBatchDraft>(EMPTY_DRAFT);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const batchCaravans = useMemo(
    () => caravans.filter((c: any) => c.batch_id === batch?.id),
    [caravans, batch?.id]
  );

  // Every animal of the batch is preselected: the whole batch is the usual case and
  // the partial transfer is the exception.
  useEffect(() => {
    if (!open) return;

    setMode('new');
    setTargetBatchId(undefined);
    setDraft(EMPTY_DRAFT);
    setSelectedIds(batchCaravans.map((c: any) => c.id));
  }, [open, batch?.id, batchCaravans.length]);

  const candidateBatches = useMemo(
    () =>
      activities
        .filter((activity) => activity.isEnabled !== false)
        .flatMap((activity) =>
          activity.batches.map((b) => ({
            id: b.id,
            name: b.name,
            activityId: activity.id,
            activityName: activity.name,
            batchTypeId: b.batchTypeId ?? null,
            batchTypeName: b.batchTypeName ?? null,
            count: b.count
          }))
        )
        .filter((b) => b.id !== batch?.id),
    [activities, batch?.id]
  );

  const destinationActivity = activities.find((a) => a.id === draft.activityId);
  // The management system belongs to the batch, not to the stage: a destination batch
  // of any productive activity declares whether it is penned or grazing.
  const declaresManagement = Boolean(destinationActivity) && destinationActivity?.code !== 'INTERNAL';
  const isManagementUndeclared =
    declaresManagement && draft.isConfined !== true && draft.isConfined !== false;

  const isDestinationReady =
    mode === 'existing'
      ? !!draft.activityId && !!targetBatchId
      : !!draft.activityId && !!draft.name.trim() && !!draft.batchTypeId && !isManagementUndeclared;

  const canSubmit = isDestinationReady && selectedIds.length > 0 && !isPending;

  const handleSubmit = () => {
    if (!canSubmit) return;

    transfer(
      {
        caravanIds: selectedIds,
        targetBatchId: mode === 'existing' ? targetBatchId : null,
        newBatch:
          mode === 'new'
            ? {
                name: draft.name.trim(),
                activity_id: draft.activityId,
                batch_type_id: draft.batchTypeId,
                // Sent only when answered: an unanswered question leaves the new
                // batch with its management system undeclared.
                ...(draft.isConfined === true || draft.isConfined === false
                  ? { is_confined: draft.isConfined }
                  : {})
              }
            : null,
        reason: batch ? `Transferencia desde el lote: ${batch.name}` : null
      },
      { onSuccess: () => onClose() }
    );
  };

  if (!batch) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
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
          borderColor: 'divider'
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
            Transferir Animales
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Desde {batch.name}
            {batch.batchTypeName ? ` · ${batch.batchTypeName}` : ''}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'primary.main' }}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Alert severity="info" sx={{ fontSize: '0.75rem', py: 0.5 }}>
            El lote de origen conserva su actividad, su tipo y su sistema de manejo: lo que se
            mueve son los animales, y el movimiento queda registrado en el historial de cada
            caravana.
          </Alert>

          <TransferDestinationStep
            mode={mode}
            onModeChange={(next) => {
              // The destination stage carries over between the two paths; the answer that
              // belonged to the path being left does not.
              setMode(next);
              setTargetBatchId(undefined);
            }}
            activities={activities}
            batchTypes={batchTypes}
            isLoadingBatchTypes={isLoadingBatchTypes}
            candidateBatches={candidateBatches}
            targetBatchId={targetBatchId}
            onTargetBatchChange={setTargetBatchId}
            draft={draft}
            onDraftChange={setDraft}
          />

          <Divider />

          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              ANIMALES A TRANSFERIR
            </Typography>
            <Box sx={{ mt: 1 }}>
              <TransferAnimalsStep
                caravans={batchCaravans as any}
                isLoading={isLoadingCaravans}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
              />
            </Box>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{ p: 2, px: 3, bgcolor: 'background.default', borderTop: 1, borderColor: 'divider', gap: 1.5 }}
      >
        <Button onClick={onClose} variant="text" sx={{ fontWeight: 600, textTransform: 'none' }}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          variant="contained"
          sx={{ px: 4, fontWeight: 700, borderRadius: '6px', textTransform: 'none', boxShadow: 'none' }}
        >
          {isPending ? 'Transfiriendo...' : `Transferir ${selectedIds.length} animales`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
