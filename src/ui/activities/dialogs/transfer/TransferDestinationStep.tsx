import { Box, MenuItem, Stack, TextField, Typography, alpha } from '@mui/material';
import { useMemo } from 'react';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Activity } from '@/core/activities/domain/entities/Activity';
import { BatchType } from '@/core/batch-types/domain/entities/BatchType';
import BatchTypeSelector from '@/ui/batches/components/create/BatchTypeSelector';
import ManagementSystemSelector from '@/ui/batches/components/create/ManagementSystemSelector';

export interface NewBatchDraft {
  name: string;
  activityId?: number;
  batchTypeId?: number;
  isConfined?: boolean;
}

interface TransferDestinationStepProps {
  mode: 'existing' | 'new';
  onModeChange: (mode: 'existing' | 'new') => void;

  activities: Activity[];
  batchTypes: BatchType[];
  isLoadingBatchTypes?: boolean;

  /** Batches that may receive the animals, already excluding the source batch. */
  candidateBatches: Array<{
    id: number;
    name: string;
    activityId: number;
    activityName: string;
    batchTypeId: number | null;
    batchTypeName: string | null;
    count: number;
  }>;
  targetBatchId?: number;
  onTargetBatchChange: (batchId: number | undefined) => void;

  draft: NewBatchDraft;
  onDraftChange: (draft: NewBatchDraft) => void;
}

const MODES = [
  {
    value: 'new' as const,
    label: 'Crear un lote nuevo',
    description: 'El lote destino se crea junto con la transferencia',
    icon: 'heroicons-outline:plus-circle'
  },
  {
    value: 'existing' as const,
    label: 'Usar un lote existente',
    description: 'Los animales se suman a un lote ya abierto',
    icon: 'heroicons-outline:folder-open'
  }
];

/**
 * Destination of the transfer: a brand new batch, created inside the same transaction
 * as the transfer, or a batch that already exists.
 */
export default function TransferDestinationStep({
  mode,
  onModeChange,
  activities,
  batchTypes,
  isLoadingBatchTypes,
  candidateBatches,
  targetBatchId,
  onTargetBatchChange,
  draft,
  onDraftChange
}: TransferDestinationStepProps) {
  const selectedActivity = activities.find((a) => a.id === draft.activityId);
  // The management system belongs to the batch, not to the stage: a destination batch
  // of any productive activity declares whether it is penned or grazing.
  const declaresManagement = Boolean(selectedActivity) && selectedActivity?.code !== 'INTERNAL';

  // The destination activity governs both paths: it narrows the type catalogue when the
  // batch is created here, and narrows the list of existing batches when it is not. An
  // establishment accumulates batches season after season, and offering every one of them
  // in a single list makes the operator hunt for the handful that belong to the stage the
  // animals are actually going to.
  const batchesInActivity = useMemo(
    () => candidateBatches.filter((b) => b.activityId === draft.activityId),
    [candidateBatches, draft.activityId]
  );

  const enabledActivities = activities.filter((a) => a.isEnabled !== false);

  // What a batch PRODUCES is its type, and that is the whole point of choosing one
  // destination over another: sending a heifer to "Vientres de Reposición" keeps her in
  // the herd, sending her to "Vaquillonas de Recría" sells her. The batch name alone
  // does not say which, so the option carries the type with its catalogue colour.
  const typeOf = (batchTypeId: number | null) =>
    batchTypeId != null ? batchTypes.find((t) => t.id === batchTypeId) : undefined;

  // Same two catalogue rules as the batch creation form: the type must fit the
  // activity unless it is cross-cutting, and it must be one that is picked by hand.
  const filteredBatchTypes = useMemo(() => {
    const selectable = batchTypes.filter((t) => t.is_selectable !== false);

    if (!draft.activityId) return selectable;

    return selectable.filter((t) => t.activity_id === draft.activityId || t.activity_id == null);
  }, [batchTypes, draft.activityId]);

  return (
    <Stack spacing={2.5}>
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        {MODES.map((option) => {
          const isSelected = mode === option.value;

          return (
            <Box
              key={option.value}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => onModeChange(option.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onModeChange(option.value);
                }
              }}
              sx={{
                flex: 1,
                p: 1.5,
                cursor: 'pointer',
                borderRadius: '8px',
                border: 2,
                borderColor: isSelected ? 'primary.main' : 'divider',
                bgcolor: (theme) =>
                  isSelected ? alpha(theme.palette.primary.main, 0.08) : 'action.hover',
                '&:hover': { borderColor: 'primary.main' }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Box sx={{ color: 'primary.main', display: 'flex' }}>
                  <FuseSvgIcon size={18}>{option.icon}</FuseSvgIcon>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
                  {option.label}
                </Typography>
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: '0.68rem', lineHeight: 1.3, display: 'block' }}
              >
                {option.description}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {mode === 'existing' ? (
        <Stack spacing={2.5}>
          <TextField
            select
            label="Etapa / Actividad de destino"
            value={draft.activityId ?? ''}
            onChange={(e) => {
              // The batch already chosen belongs to the previous activity, so it stops
              // being a valid answer the moment the stage changes.
              onTargetBatchChange(undefined);
              onDraftChange({ ...draft, activityId: Number(e.target.value) });
            }}
            variant="filled"
            fullWidth
            required
            sx={{ bgcolor: 'action.hover' }}
          >
            {enabledActivities.map((activity) => (
              <MenuItem key={activity.id} value={activity.id}>
                {activity.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Lote de destino"
            value={batchesInActivity.some((b) => b.id === targetBatchId) ? targetBatchId : ''}
            onChange={(e) => onTargetBatchChange(Number(e.target.value))}
            variant="filled"
            fullWidth
            required
            disabled={!draft.activityId}
            sx={{ bgcolor: 'action.hover' }}
            SelectProps={{
              renderValue: (selected) => {
                const batch = batchesInActivity.find((b) => b.id === Number(selected));

                if (!batch) return '';

                const type = typeOf(batch.batchTypeId);
                const label = type?.name ?? batch.batchTypeName;

                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        flexShrink: 0,
                        bgcolor: type?.color || 'text.disabled'
                      }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                      {batch.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {label ? `· ${label}` : '· sin tipo'}
                    </Typography>
                  </Box>
                );
              }
            }}
            helperText={
              !draft.activityId
                ? 'Elegí primero la etapa de destino'
                : batchesInActivity.length === 0
                  ? `No hay lotes abiertos en ${selectedActivity?.name}. Podés crear uno nuevo.`
                  : `${batchesInActivity.length} ${batchesInActivity.length === 1 ? 'lote disponible' : 'lotes disponibles'}`
            }
          >
            {batchesInActivity.map((batch) => {
              const type = typeOf(batch.batchTypeId);
              const label = type?.name ?? batch.batchTypeName;

              return (
                <MenuItem key={batch.id} value={batch.id} sx={{ py: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, width: '100%' }}>
                    <Box
                      sx={{
                        mt: 0.25,
                        flexShrink: 0,
                        display: 'flex',
                        color: type?.color || 'text.disabled'
                      }}
                    >
                      <FuseSvgIcon size={18}>
                        {type?.icon || 'heroicons-outline:question-mark-circle'}
                      </FuseSvgIcon>
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.25 }}>
                        {batch.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          lineHeight: 1.3,
                          color: label ? 'text.secondary' : 'warning.main',
                          fontStyle: label ? 'normal' : 'italic'
                        }}
                      >
                        {label ?? 'Sin tipo de lote'} ·{' '}
                        {batch.count === 0
                          ? 'sin animales'
                          : `${batch.count} ${batch.count === 1 ? 'cabeza' : 'cabezas'}`}
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              );
            })}
          </TextField>
        </Stack>
      ) : (
        <Stack spacing={2.5}>
          <TextField
            label="Nombre del lote de destino"
            value={draft.name}
            onChange={(e) => onDraftChange({ ...draft, name: e.target.value })}
            variant="filled"
            fullWidth
            required
            sx={{ bgcolor: 'action.hover' }}
          />

          <TextField
            select
            label="Etapa / Actividad de destino"
            value={draft.activityId ?? ''}
            onChange={(e) =>
              onDraftChange({
                ...draft,
                activityId: Number(e.target.value),
                batchTypeId: undefined,
                isConfined: undefined
              })
            }
            variant="filled"
            fullWidth
            required
            sx={{ bgcolor: 'action.hover' }}
          >
            {enabledActivities.map((activity) => (
              <MenuItem key={activity.id} value={activity.id}>
                {activity.name}
              </MenuItem>
            ))}
          </TextField>

          <BatchTypeSelector
            batchTypes={filteredBatchTypes}
            value={draft.batchTypeId}
            onChange={(batchTypeId) => onDraftChange({ ...draft, batchTypeId })}
            isLoading={isLoadingBatchTypes}
          />

          {declaresManagement && (
            <ManagementSystemSelector
              value={draft.isConfined}
              onChange={(isConfined) => onDraftChange({ ...draft, isConfined })}
            />
          )}
        </Stack>
      )}
    </Stack>
  );
}
