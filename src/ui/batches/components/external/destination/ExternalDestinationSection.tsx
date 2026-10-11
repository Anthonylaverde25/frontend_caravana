import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { toast } from 'sonner';
import { useOwnActiveBatches } from '@/features/batches/hooks/useOwnActiveBatches';
import { ExternalBatchForm, ExternalFormSection, filledSx } from '../externalFormParts';
import { DestinationRule, adjustRules, needsTransitBatch, ruleLabel, rulesForSameBatch, uncovered } from './coverage';
import DestinationBatchField from './DestinationBatchField';
import DistributeDestinationsDialog from './DistributeDestinationsDialog';
import { useDistributionLines } from './useDistributionLines';

type DestinationMode = 'SAME' | 'DISTRIBUTE' | 'LATER';

const MODES: { value: DestinationMode; label: string }[] = [
  { value: 'SAME', label: 'Asignar a lote propio' },
  { value: 'DISTRIBUTE', label: 'Distribuir' },
  { value: 'LATER', label: 'Asignar después' }
];

/**
 * Where the animals of the purchase go when they are received: all to one own batch, distributed
 * by category and sex, or to a transit batch to assign later. Keeps `needs_transit_batch` in the
 * form, which is what decides whether the transit batch's name is asked, and drops the rules a
 * change of the troop leaves without meaning.
 */
export const ExternalDestinationSection: React.FC<{ form: ExternalBatchForm }> = ({ form }) => {
  const { watch, setValue, formState } = form;
  const { batches } = useOwnActiveBatches();
  const [isDistributing, setIsDistributing] = useState(false);
  const mode = watch('destination_mode');
  const sameBatchId = watch('same_batch_id');
  // The form's input type leaves every field optional; the schema guarantees them.
  const watchedRules = watch('destinations');
  const rules = useMemo(() => (watchedRules ?? []) as DestinationRule[], [watchedRules]);
  const composition = watch('sex_composition');
  const lines = useDistributionLines(watch('categories'));
  const sameError = formState.errors.same_batch_id?.message;

  const needsTransit = useMemo(() => {
    if (mode === 'SAME') return false;
    if (mode === 'LATER') return true;
    return needsTransitBatch(lines, composition, rules);
  }, [mode, lines, composition, rules]);

  useEffect(() => {
    if (watch('needs_transit_batch') !== needsTransit) setValue('needs_transit_batch', needsTransit);
  }, [needsTransit, setValue, watch]);

  // A line removed or a troop that is no longer of both sexes leaves some rules without meaning.
  useEffect(() => {
    if (mode !== 'DISTRIBUTE' || lines.length === 0) return;

    const adjusted = adjustRules(rules, lines, composition);

    if (
      adjusted.dropped > 0 ||
      adjusted.rules.length !== rules.length ||
      adjusted.rules.some((r, i) => r.sex_scope !== rules[i]?.sex_scope)
    ) {
      setValue('destinations', adjusted.rules);

      if (adjusted.dropped > 0)
        toast.warning(
          'Un destino dejó de aplicar con los cambios de la tropa y se quitó: revisá la distribución.'
        );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines, composition]);

  const left = uncovered(lines, composition, rules);

  return (
    <ExternalFormSection title="Destino de los animales">
      <TextField
        select
        fullWidth
        label="Destino de los animales"
        variant="filled"
        value={mode ?? 'SAME'}
        onChange={(e) =>
          setValue('destination_mode', e.target.value as DestinationMode, { shouldValidate: formState.isSubmitted })
        }
        sx={filledSx}
      >
        {MODES.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

      {mode === 'SAME' && (
        <DestinationBatchField
          label="Lote propio de destino"
          value={sameBatchId ?? null}
          batches={batches}
          subtitle="Toda la tropa"
          emptyLabel="Elegí un lote"
          error={sameError}
          helperText="Los animales entran directo a este lote cuando se reciben."
          onChange={(batchId) =>
            setValue('same_batch_id', batchId, { shouldValidate: formState.isSubmitted })
          }
        />
      )}

      {mode === 'DISTRIBUTE' && (
        <Box sx={{ border: 1, borderColor: 'divider', borderRadius: '6px', p: 1.5 }}>
          <Stack spacing={0.5}>
            {rules.length === 0 && (
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Ninguna categoría tiene destino todavía.
              </Typography>
            )}
            {rules.map((rule) => (
              <Typography
                key={`${rule.category_position}-${rule.sex_scope}`}
                variant="body2"
              >
                {ruleLabel(
                  lines.find((l) => l.position === rule.category_position),
                  rule.sex_scope
                )}{' '}
                →{' '}
                <strong>
                  {batches.find((b) => b.id === rule.destination_batch_id)?.name ??
                    `Lote #${rule.destination_batch_id}`}
                </strong>
              </Typography>
            ))}
            {left.map((pair) => (
              <Typography
                key={`${pair.position}-${pair.sex}`}
                variant="body2"
                color="text.secondary"
              >
                {ruleLabel(
                  lines.find((l) => l.position === pair.position),
                  pair.sex
                )}{' '}
                → asignar después
              </Typography>
            ))}
          </Stack>
          <Button
            size="small"
            onClick={() => setIsDistributing(true)}
            startIcon={<FuseSvgIcon size={16}>heroicons-outline:arrows-pointing-out</FuseSvgIcon>}
            sx={{ mt: 1, textTransform: 'none', fontWeight: 600 }}
          >
            {rules.length === 0 ? 'Distribuir…' : 'Editar distribución'}
          </Button>
        </Box>
      )}

      {mode === 'LATER' && (
        <Typography
          variant="caption"
          color="text.secondary"
        >
          Los animales entran a un lote de tránsito y se asignan a un lote propio después.
        </Typography>
      )}

      <DistributeDestinationsDialog
        open={isDistributing}
        lines={lines}
        composition={composition}
        rules={rules}
        batches={batches}
        onClose={() => setIsDistributing(false)}
        onApply={(next) => {
          setValue('destinations', next);
          setIsDistributing(false);
        }}
      />
    </ExternalFormSection>
  );
};

export default ExternalDestinationSection;
