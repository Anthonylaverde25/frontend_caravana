import React, { useState } from 'react';
import { Box, FormControlLabel, Stack, Switch, Typography } from '@mui/material';
import type { Batch } from '@/core/batches/domain/entities/Batch';
import type { DestinationSexScope, SexComposition } from '@/features/entry-orders/types';
import { DestinationRule, DistributionLine, ruleLabel, splittable } from './coverage';
import DestinationBatchField from './DestinationBatchField';

interface DistributionLineRowProps {
  line: DistributionLine;
  composition: SexComposition | null | undefined;
  /** The rules of this line only. */
  rules: DestinationRule[];
  batches: Batch[];
  /** Names of the batches the rules point to, for one that is not in `batches`. */
  batchNames: Record<number, string>;
  onChange: (rules: DestinationRule[]) => void;
}

/**
 * One category line of the troop: where its animals go. A line that admits both sexes in a troop
 * of both can send the males and the females to different batches ("Separar machos y hembras").
 * Its head per sex are not known until the animals arrive, so only the line's head are shown.
 */
export const DistributionLineRow: React.FC<DistributionLineRowProps> = ({
  line,
  composition,
  rules,
  batches,
  batchNames,
  onChange
}) => {
  const canSplit = splittable(line, composition);
  // Kept apart from the rules: a line can be split before any batch is chosen for its sexes.
  const [splitWanted, setSplitWanted] = useState(() => rules.some((r) => r.sex_scope !== 'ALL'));
  const isSplit = canSplit && splitWanted;
  const batchOf = (scope: DestinationSexScope) =>
    rules.find((r) => r.sex_scope === scope)?.destination_batch_id ?? null;

  const set = (scope: DestinationSexScope, batchId: number | null) => {
    const others = rules.filter((r) => r.sex_scope !== scope);

    onChange(
      batchId == null
        ? others
        : [...others, { category_position: line.position, sex_scope: scope, destination_batch_id: batchId }]
    );
  };

  // Splitting starts both sexes where the whole line was going; joining keeps the males' batch.
  const toggleSplit = (split: boolean) => {
    setSplitWanted(split);

    const from = split ? batchOf('ALL') : (batchOf('M') ?? batchOf('H'));

    onChange(
      from == null
        ? []
        : split
          ? [
              { category_position: line.position, sex_scope: 'M', destination_batch_id: from },
              { category_position: line.position, sex_scope: 'H', destination_batch_id: from }
            ]
          : [{ category_position: line.position, sex_scope: 'ALL', destination_batch_id: from }]
    );
  };

  const field = (scope: DestinationSexScope, label: string) => (
    <DestinationBatchField
      label={label}
      value={batchOf(scope)}
      batches={batches}
      subtitle={ruleLabel(line, scope)}
      fallbackName={batchOf(scope) != null ? batchNames[batchOf(scope) as number] : null}
      onChange={(batchId) => set(scope, batchId)}
    />
  );

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 1 }}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
        >
          <Box
            sx={{
              width: 26,
              height: 26,
              borderRadius: '6px',
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontFamily: 'monospace',
              fontSize: '0.8rem'
            }}
          >
            {line.position}
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>{line.categoryName}</Typography>
          {line.headCount != null && (
            <Typography
              variant="caption"
              color="text.secondary"
            >
              {line.headCount} cab.
            </Typography>
          )}
        </Stack>
        {canSplit && (
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={isSplit}
                onChange={(e) => toggleSplit(e.target.checked)}
              />
            }
            label={
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                Separar machos y hembras
              </Typography>
            }
            sx={{ mr: 0 }}
          />
        )}
      </Stack>

      {isSplit ? (
        <Stack spacing={1.5}>
          {field('M', 'Machos')}
          {field('H', 'Hembras')}
        </Stack>
      ) : (
        field('ALL', 'Destino')
      )}
    </Box>
  );
};

export default DistributionLineRow;
