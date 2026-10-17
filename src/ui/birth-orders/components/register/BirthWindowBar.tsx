import React from 'react';
import { Box, Stack, Tooltip, Typography } from '@mui/material';
import { GESTATION_STAGE_LABELS } from '@/features/birth-orders/types';
import { daysToDue, formatDate } from '../birthOrderFormat';
import type { BirthRollFemale } from '../grid/birthRollTypes';

interface BirthWindowBarProps {
  females: BirthRollFemale[];
}

/** The stages in calving order: the head of the season calves first. */
const SEGMENTS: { key: string; color: string }[] = [
  { key: 'head', color: 'primary.dark' },
  { key: 'body', color: 'primary.main' },
  { key: 'tail', color: 'primary.light' },
  { key: 'none', color: 'grey.400' }
];

const windowOf = (females: BirthRollFemale[]): string => {
  const dues = females
    .map((f) => f.dueDate?.slice(0, 10))
    .filter((d): d is string => Boolean(d))
    .sort();

  if (dues.length === 0) return 'Sin FPP';

  const first = formatDate(dues[0]);
  const last = formatDate(dues[dues.length - 1]);

  return first === last ? first : `${first} → ${last}`;
};

/**
 * The expected calving of the sheet, in the shape of the tacto progress bar: the FPP window, how
 * the females split by gestation stage and how many are already past their due date.
 */
export const BirthWindowBar: React.FC<BirthWindowBarProps> = ({ females }) => {
  const total = females.length;
  const countOf = (key: string) => females.filter((f) => (f.stage && f.stage in GESTATION_STAGE_LABELS ? f.stage : 'none') === key).length;
  const segments = SEGMENTS.map((segment) => ({ ...segment, count: countOf(segment.key) })).filter((segment) => segment.count > 0);
  const overdue = females.filter((f) => f.overdueReportedAt || (daysToDue(f.dueDate) ?? 0) < 0).length;
  const byStage = segments
    .filter((segment) => segment.key !== 'none')
    .map((segment) => `${segment.count} ${GESTATION_STAGE_LABELS[segment.key].toLowerCase()}`);
  const withoutStage = segments.find((segment) => segment.key === 'none')?.count ?? 0;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 0.5 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Parición esperada
        </Typography>
        <Typography variant="caption" sx={{ fontWeight: 800 }}>
          {windowOf(females)}
        </Typography>
      </Stack>
      <Stack direction="row" spacing={0.25} sx={{ height: 6, borderRadius: 3, overflow: 'hidden', bgcolor: 'action.hover' }}>
        {segments.map((segment) => (
          <Tooltip key={segment.key} title={`${GESTATION_STAGE_LABELS[segment.key] ?? 'Sin estadio'}: ${segment.count}`}>
            <Box sx={{ flex: segment.count, bgcolor: segment.color }} />
          </Tooltip>
        ))}
      </Stack>
      <Typography variant="caption" sx={{ display: 'block', mt: 0.75, color: 'text.secondary' }}>
        {total} preñada(s){byStage.length > 0 && ` · ${byStage.join(' · ')}`}
        {overdue > 0 && (
          <Box component="span" sx={{ color: 'warning.dark', fontWeight: 700 }}>
            {' '}
            · {overdue} con FPP vencida
          </Box>
        )}
      </Typography>
      {withoutStage > 0 && (
        <Typography variant="caption" sx={{ display: 'block', color: 'text.disabled' }}>
          Sin estadio ni FPP: {withoutStage} (el tacto no lo estimó)
        </Typography>
      )}
    </Box>
  );
};

export default BirthWindowBar;
