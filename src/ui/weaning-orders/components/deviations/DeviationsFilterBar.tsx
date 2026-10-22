import React from 'react';
import { Chip, InputAdornment, MenuItem, Stack, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { WEANING_DEVIATION_KINDS, WEANING_DEVIATION_LABELS, WeaningDeviationKind } from '@/features/weaning-orders/types';
import type { PeriodFilter, ReviewFilter } from './deviationRows';

export const PERIOD_LABELS: Record<PeriodFilter, string> = {
  '30': 'Últimos 30 días',
  '90': 'Últimos 90 días',
  '365': 'Último año',
  all: 'Todo'
};

const SHORT_LABELS: Record<WeaningDeviationKind, string> = { ...WEANING_DEVIATION_LABELS, WEANING_TYPE: 'Tipo', LATE: 'Tardío' };

const toggleSx = { px: 1.5, textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', whiteSpace: 'nowrap' } as const;

interface DeviationsFilterBarProps {
  search: string;
  onSearch: (value: string) => void;
  period: PeriodFilter;
  onPeriod: (value: PeriodFilter) => void;
  kind: WeaningDeviationKind | 'ALL';
  onKind: (value: WeaningDeviationKind | 'ALL') => void;
  kindCounts: Record<WeaningDeviationKind | 'ALL', number>;
  review: ReviewFilter;
  onReview: (value: ReviewFilter) => void;
  reviewCounts: Record<ReviewFilter, number>;
  /** `?orderCode=`: the order the drawer came from, removable. */
  orderCode: string | null;
  onClearOrder: () => void;
}

/** Search, period, kind of deviation and review state: what the audit table shows. */
export const DeviationsFilterBar: React.FC<DeviationsFilterBarProps> = (props) => (
  <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap" useFlexGap>
    <TextField
      size="small"
      placeholder="Buscar cría u orden…"
      value={props.search}
      onChange={(e) => props.onSearch(e.target.value)}
      sx={{ width: { xs: '100%', sm: 280 }, '& .MuiOutlinedInput-root': { borderRadius: '6px', bgcolor: 'background.paper' } }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <FuseSvgIcon size={16} color="action">
              heroicons-outline:magnifying-glass
            </FuseSvgIcon>
          </InputAdornment>
        )
      }}
    />
    <TextField
      select
      size="small"
      value={props.period}
      onChange={(e) => props.onPeriod(e.target.value as PeriodFilter)}
      inputProps={{ 'aria-label': 'Período' }}
      sx={{ minWidth: 170, '& .MuiOutlinedInput-root': { borderRadius: '6px', bgcolor: 'background.paper', fontSize: '0.84rem' } }}
    >
      {(Object.keys(PERIOD_LABELS) as PeriodFilter[]).map((key) => (
        <MenuItem key={key} value={key} sx={{ fontSize: '0.84rem' }}>
          {PERIOD_LABELS[key]}
        </MenuItem>
      ))}
    </TextField>
    {props.orderCode && (
      <Chip
        label={`Orden ${props.orderCode}`}
        onDelete={props.onClearOrder}
        color="primary"
        variant="outlined"
        sx={{ fontWeight: 700, fontFamily: 'monospace', height: 32 }}
      />
    )}
    <ToggleButtonGroup
      size="small"
      exclusive
      value={props.kind}
      onChange={(_, value) => value && props.onKind(value)}
      aria-label="Tipo de desvío"
      sx={{ height: 38, bgcolor: 'background.paper' }}
    >
      <ToggleButton value="ALL" sx={toggleSx}>
        Todos ({props.kindCounts.ALL})
      </ToggleButton>
      {WEANING_DEVIATION_KINDS.map((kind) => (
        <ToggleButton key={kind} value={kind} sx={toggleSx}>
          {SHORT_LABELS[kind]} ({props.kindCounts[kind]})
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
    <ToggleButtonGroup
      size="small"
      exclusive
      value={props.review}
      onChange={(_, value) => value && props.onReview(value)}
      aria-label="Revisión"
      sx={{ height: 38, bgcolor: 'background.paper' }}
    >
      <ToggleButton value="pending" sx={toggleSx}>
        Sin revisar ({props.reviewCounts.pending})
      </ToggleButton>
      <ToggleButton value="reviewed" sx={toggleSx}>
        Revisados ({props.reviewCounts.reviewed})
      </ToggleButton>
      <ToggleButton value="all" sx={toggleSx}>
        Todos ({props.reviewCounts.all})
      </ToggleButton>
    </ToggleButtonGroup>
  </Stack>
);

export default DeviationsFilterBar;
