import React from 'react';
import { InputAdornment, MenuItem, Stack, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import {
  BIRTH_SHEET_FILTERS,
  BIRTH_SHEET_FILTER_LABELS,
  BIRTH_STAGE_FILTER_LABELS,
  type BirthSheetFilter,
  type BirthSheetQuery,
  type BirthStageFilter
} from './registerBirths';

interface RegisterBirthsSheetToolbarProps {
  query: BirthSheetQuery;
  onQuery: (query: BirthSheetQuery) => void;
  counts: Record<BirthSheetFilter, number>;
}

const toggleSx = { px: 1.25, py: 0.5, textTransform: 'none', fontWeight: 600, fontSize: '0.8rem' } as const;

/** Above the calving sheet: search, the result filter (with its counts) and the gestation stage. */
export const RegisterBirthsSheetToolbar: React.FC<RegisterBirthsSheetToolbarProps> = ({ query, onQuery, counts }) => (
  <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1} alignItems={{ lg: 'center' }}>
    <TextField
      size="small"
      placeholder="Buscar vientre…"
      value={query.search}
      onChange={(e) => onQuery({ ...query, search: e.target.value })}
      sx={{ minWidth: { sm: 220 }, flex: 1 }}
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
    <ToggleButtonGroup size="small" exclusive value={query.filter} onChange={(_, value) => value && onQuery({ ...query, filter: value })}>
      {BIRTH_SHEET_FILTERS.map((filter) => (
        <ToggleButton key={filter} value={filter} sx={toggleSx}>
          {BIRTH_SHEET_FILTER_LABELS[filter]} ({counts[filter]})
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
    <TextField
      select
      size="small"
      value={query.stage}
      onChange={(e) => onQuery({ ...query, stage: e.target.value as BirthStageFilter })}
      sx={{ minWidth: 180 }}
    >
      {(Object.keys(BIRTH_STAGE_FILTER_LABELS) as BirthStageFilter[]).map((stage) => (
        <MenuItem key={stage} value={stage}>
          {BIRTH_STAGE_FILTER_LABELS[stage]}
        </MenuItem>
      ))}
    </TextField>
  </Stack>
);

export default RegisterBirthsSheetToolbar;
