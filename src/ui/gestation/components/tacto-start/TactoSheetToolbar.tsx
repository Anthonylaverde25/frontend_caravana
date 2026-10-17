import { Button, Chip, InputAdornment, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { NotDiagnosedReason } from '@/features/gestation/hooks/useServiceOrders';
import DiagnosisBulkBar from '../diagnosis-entry/DiagnosisBulkBar';
import type { EntryResult } from '../diagnosis-entry/diagnosisEntryModel';
import { TACTO_FILTER_LABELS, type TactoFemaleFilter } from './tactoStart';

export const TACTO_FILTERS: TactoFemaleFilter[] = ['pending', 'provisional', 'diagnosed', 'stated', 'all'];

interface TactoSheetToolbarProps {
  search: string;
  onSearch: (value: string) => void;
  filter: TactoFemaleFilter;
  onFilter: (filter: TactoFemaleFilter) => void;
  counts: Record<TactoFemaleFilter, number>;
  statedCount: number;
  shownCount: number;
  selectedCount: number;
  allowNotDiagnosed: boolean;
  onSelectShown: () => void;
  onClearSelection: () => void;
  onApply: (result: EntryResult, reason?: NotDiagnosedReason) => void;
}

const toggleSx = { px: 1.25, py: 0.5, textTransform: 'none', fontWeight: 600, fontSize: '0.8rem' } as const;

/**
 * Above the tacto sheet: search, filters (with how many each one shows), what the round already
 * has and the same result for the selected females.
 */
export default function TactoSheetToolbar(props: TactoSheetToolbarProps) {
  const { search, onSearch, filter, onFilter, counts, statedCount, shownCount, selectedCount } = props;

  return (
    <Stack spacing={1.5}>
      <Stack direction={{ xs: 'column', xl: 'row' }} spacing={1} alignItems={{ xl: 'center' }}>
        <TextField
          size="small"
          placeholder="Buscar vientre…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          sx={{ minWidth: { sm: 200 }, flex: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FuseSvgIcon size={16} color="action">
                  heroicons-outline:magnifying-glass
                </FuseSvgIcon>
              </InputAdornment>
            ),
          }}
        />
        <ToggleButtonGroup size="small" exclusive value={filter} onChange={(_, value) => value && onFilter(value)} sx={{ flexWrap: 'wrap' }}>
          {TACTO_FILTERS.map((f) => (
            <ToggleButton key={f} value={f} sx={toggleSx}>
              {TACTO_FILTER_LABELS[f]} ({counts[f]})
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>

      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 1.5, py: 1, borderRadius: '6px', bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}
      >
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Chip size="small" color="primary" label={`${statedCount} con resultado`} sx={{ fontWeight: 700 }} />
          <Typography variant="caption" color="text.secondary">
            {shownCount} visibles · {selectedCount} marcados
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
          {selectedCount > 0 && (
            <Button size="small" color="inherit" onClick={props.onClearSelection} sx={{ textTransform: 'none', color: 'text.secondary' }}>
              Desmarcar
            </Button>
          )}
          {shownCount > 0 && (
            <Button size="small" variant="outlined" onClick={props.onSelectShown} sx={{ textTransform: 'none', fontWeight: 600 }}>
              Marcar visibles ({shownCount})
            </Button>
          )}
        </Stack>
      </Stack>

      <DiagnosisBulkBar selectedCount={selectedCount} allowNotDiagnosed={props.allowNotDiagnosed} onApply={props.onApply} />
    </Stack>
  );
}
