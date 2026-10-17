import { Alert, Box, FormControlLabel, MenuItem, Radio, RadioGroup, Stack, TextField, Typography } from '@mui/material';
import type { ServiceClosureBullAction, ServiceClosureRemainingFemalesAction } from '@/features/gestation/hooks/useServiceOrders';
import type { BatchOption } from '../../diagnosis-entry/DiagnosisEntryRow';
import type { ClosingDecisions, ProjectedClosing } from './closeDiagnosisModel';

interface BullsDecisionStepProps {
  bulls: { id: number; identification: string }[];
  projection: ProjectedClosing;
  decisions: ClosingDecisions;
  onDecisions: (patch: Partial<ClosingDecisions>) => void;
  destinations: BatchOption[];
}

const BULL_OPTIONS: { value: ServiceClosureBullAction; label: string; help: string }[] = [
  { value: 'MOVE_NOW', label: 'Trasladar ahora', help: 'Los toros salen del lote el día del cierre.' },
  { value: 'SCHEDULE', label: 'Programar el traslado', help: 'Se emite una orden de transferencia para el día indicado.' },
  { value: 'STAY', label: 'Permanecen en el lote', help: 'Los toros siguen con las vacas.' },
];

const fieldSx = { bgcolor: 'action.hover' };

/**
 * Step 3, once the diagnoses are confirmed: what happens with the bulls still in the batch. If
 * they do not leave now, the non-pregnant females that would stay with them must leave the batch
 * or go on in a continuation order: otherwise they would be exposed with no order recording it.
 */
export default function BullsDecisionStep({ bulls, projection, decisions, onDecisions, destinations }: BullsDecisionStepProps) {
  const keepsBulls = decisions.bullAction !== null && decisions.bullAction !== 'MOVE_NOW';
  const batchSelect = (label: string, value: number | null, onChange: (id: number | null) => void) => (
    <TextField
      select
      SelectProps={{ displayEmpty: true }}
      fullWidth
      variant="filled"
      label={label}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
      sx={fieldSx}
    >
      {destinations.map((batch) => (
        <MenuItem key={batch.id} value={batch.id}>{batch.name}</MenuItem>
      ))}
    </TextField>
  );

  return (
    <Stack spacing={2.5}>
      <Typography variant="body2">
        Toros en el lote: <strong>{bulls.map((bull) => bull.identification).join(', ')}</strong>
      </Typography>

      <RadioGroup
        value={decisions.bullAction ?? ''}
        onChange={(e) => {
          const bullAction = e.target.value as ServiceClosureBullAction;
          onDecisions({
            bullAction,
            remainingAction: bullAction === 'SCHEDULE' && decisions.remainingAction === 'CONTINUE_SERVICE' ? null : decisions.remainingAction,
          });
        }}
      >
        {BULL_OPTIONS.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio size="small" />}
            label={
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{option.label}</Typography>
                <Typography variant="caption" color="text.secondary">{option.help}</Typography>
              </Box>
            }
          />
        ))}
      </RadioGroup>

      {decisions.bullAction === 'MOVE_NOW' && (
        <Stack spacing={2}>
          {batchSelect('Lote de destino de los toros', decisions.bullDestinationBatchId, (id) => onDecisions({ bullDestinationBatchId: id }))}
          {projection.emptiesInServiceBatch > 0 && (
            <TextField
              select
              SelectProps={{ displayEmpty: true }}
              fullWidth
              variant="filled"
              label={`Vacías que siguen en el lote de servicio (${projection.emptiesInServiceBatch})`}
              InputLabelProps={{ shrink: true }}
              value={decisions.emptiesTargetBatchId ?? ''}
              onChange={(e) => onDecisions({ emptiesTargetBatchId: e.target.value === '' ? null : Number(e.target.value) })}
              sx={fieldSx}
            >
              <MenuItem value=""><em>Quedan en el lote</em></MenuItem>
              {destinations.map((batch) => (
                <MenuItem key={batch.id} value={batch.id}>Salen a: {batch.name}</MenuItem>
              ))}
            </TextField>
          )}
        </Stack>
      )}

      {decisions.bullAction === 'SCHEDULE' && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          {batchSelect('Lote de destino de los toros', decisions.bullDestinationBatchId, (id) => onDecisions({ bullDestinationBatchId: id }))}
          <TextField
            type="date"
            variant="filled"
            label="Fecha programada"
            value={decisions.scheduledMovementDate}
            onChange={(e) => onDecisions({ scheduledMovementDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
            sx={{ ...fieldSx, minWidth: 200 }}
          />
        </Stack>
      )}

      {keepsBulls && projection.nonPregnantInServiceBatch > 0 && (
        <Box>
          <Alert severity="warning" sx={{ fontSize: '0.8rem', py: 0.5, mb: 1.5 }}>
            {projection.nonPregnantInServiceBatch} vientre(s) no preñado(s) quedarían con los toros después del cierre.
          </Alert>
          <RadioGroup
            value={decisions.remainingAction ?? ''}
            onChange={(e) => onDecisions({ remainingAction: e.target.value as ServiceClosureRemainingFemalesAction })}
          >
            <FormControlLabel value="MOVE_OUT" control={<Radio size="small" />} label="Salen del lote de servicio ahora" />
            <FormControlLabel
              value="CONTINUE_SERVICE"
              disabled={decisions.bullAction === 'SCHEDULE'}
              control={<Radio size="small" />}
              label={
                decisions.bullAction === 'SCHEDULE'
                  ? 'Siguen en servicio (no disponible si el traslado de los toros se programa)'
                  : 'Siguen en servicio con estos toros: se abre una orden de continuación'
              }
            />
          </RadioGroup>
          {decisions.remainingAction === 'MOVE_OUT' &&
            batchSelect('Lote al que salen', decisions.remainingTargetBatchId, (id) => onDecisions({ remainingTargetBatchId: id }))}
        </Box>
      )}
    </Stack>
  );
}
