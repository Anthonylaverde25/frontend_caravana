import React, { useMemo, useState } from 'react';
import {
  Button,
  Checkbox,
  Chip,
  InputAdornment,
  Stack,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import SheetGrid from '@/components/sheet-grid/SheetGrid';
import SheetGridEmptyRow from '@/components/sheet-grid/SheetGridEmptyRow';
import SheetGridGroupRow from '@/components/sheet-grid/SheetGridGroupRow';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';
import PregnantFemaleSelectRow from './PregnantFemaleSelectRow';
import type { FemaleBatchGroup } from './usePregnantFemalesByBatch';

type Height = number | string | Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', number | string>>;
type StageFilter = 'ALL' | 'head' | 'body' | 'tail';

interface PregnantFemalesByBatchSelectorProps {
  groups: FemaleBatchGroup[];
  selected: number[];
  onChange: (ids: number[]) => void;
  maxHeight?: Height;
}

const COLUMNS = 5;

/**
 * Pregnant females as a sheet grouped by batch, soonest due first. All the batches (header
 * checkbox), a whole batch (its row) or female by female; the stage and the "due until" filters
 * narrow what is shown — the head of the season, for instance — and the checkboxes act on what is shown.
 */
export const PregnantFemalesByBatchSelector: React.FC<PregnantFemalesByBatchSelectorProps> = ({ groups, selected, onChange, maxHeight = 380 }) => {
  const { headSx } = useGridCellStyles();
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState<StageFilter>('ALL');
  const [dueUntil, setDueUntil] = useState('');
  const [folded, setFolded] = useState<Set<string>>(new Set());
  const chosen = useMemo(() => new Set(selected), [selected]);
  const term = search.trim().toLowerCase();
  const filtering = term !== '' || stage !== 'ALL' || dueUntil !== '';

  const shown = useMemo(
    () =>
      groups
        .map((group) => ({
          ...group,
          females: group.females.filter(
            (f) =>
              (term === '' || f.identification.toLowerCase().includes(term)) &&
              (stage === 'ALL' || f.stage === stage) &&
              (dueUntil === '' || (f.dueDate != null && f.dueDate.slice(0, 10) <= dueUntil))
          )
        }))
        .filter((group) => group.females.length > 0 || (!filtering && group.committed.length > 0)),
    [groups, term, stage, dueUntil, filtering]
  );
  const shownIds = shown.flatMap((g) => g.females.map((f) => f.caravanId));
  const shownChosen = shownIds.filter((id) => chosen.has(id)).length;
  const chosenBatches = groups.filter((g) => g.females.some((f) => chosen.has(f.caravanId))).length;

  const setMany = (ids: number[], on: boolean) => {
    const next = new Set(chosen);
    ids.forEach((id) => (on ? next.add(id) : next.delete(id)));
    onChange([...next]);
  };

  const toggleFolded = (key: string) =>
    setFolded((prev) => {
      const next = new Set(prev);

      if (next.has(key)) next.delete(key);
      else next.add(key);

      return next;
    });

  const toggleSx = { px: 1.25, py: 0.5, textTransform: 'none', fontWeight: 600, fontSize: '0.8rem' } as const;

  return (
    <Stack spacing={1.5}>
      <Stack direction={{ xs: 'column', xl: 'row' }} spacing={1} alignItems={{ xl: 'center' }}>
        <TextField
          size="small"
          placeholder="Buscar vientre…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: { sm: 200 }, flex: 1 }}
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
        <ToggleButtonGroup size="small" exclusive value={stage} onChange={(_, value) => value && setStage(value)} sx={{ height: 38 }}>
          <ToggleButton value="ALL" sx={toggleSx}>
            Todos
          </ToggleButton>
          <ToggleButton value="head" sx={toggleSx}>
            Cabeza
          </ToggleButton>
          <ToggleButton value="body" sx={toggleSx}>
            Cuerpo
          </ToggleButton>
          <ToggleButton value="tail" sx={toggleSx}>
            Cola
          </ToggleButton>
        </ToggleButtonGroup>
        <TextField
          size="small"
          type="date"
          label="FPP hasta"
          value={dueUntil}
          onChange={(e) => setDueUntil(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ width: 170 }}
        />
      </Stack>

      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 1.5, py: 1, borderRadius: '6px', bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}
      >
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Chip size="small" color="primary" label={`${selected.length} vientre(s)`} sx={{ fontWeight: 700 }} />
          <Chip size="small" variant="outlined" label={`${chosenBatches} lote(s)`} sx={{ fontWeight: 600 }} />
          <Typography variant="caption" color="text.secondary">
            {shownChosen} de {shownIds.length} visibles
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
          {selected.length > 0 && (
            <Button size="small" color="inherit" onClick={() => onChange([])} sx={{ textTransform: 'none', color: 'text.secondary' }}>
              Desmarcar todo
            </Button>
          )}
          {shownIds.length > 0 && (
            <Button size="small" variant="outlined" onClick={() => setMany(shownIds, true)} sx={{ textTransform: 'none', fontWeight: 600 }}>
              Marcar visibles ({shownIds.length})
            </Button>
          )}
        </Stack>
      </Stack>

      <SheetGrid minWidth={560} maxHeight={maxHeight}>
        <TableHead>
          <TableRow>
            <TableCell align="center" sx={{ ...headSx, width: 44, px: 0 }}>
              <Checkbox
                size="small"
                checked={shownIds.length > 0 && shownChosen === shownIds.length}
                indeterminate={shownChosen > 0 && shownChosen < shownIds.length}
                disabled={shownIds.length === 0}
                onChange={(e) => setMany(shownIds, e.target.checked)}
              />
            </TableCell>
            <TableCell sx={{ ...headSx, minWidth: 200 }}>Vientre</TableCell>
            <TableCell sx={{ ...headSx, width: 140 }}>FPP</TableCell>
            <TableCell sx={{ ...headSx, width: 120 }}>Estadio</TableCell>
            <TableCell sx={{ ...headSx, minWidth: 160 }}>Toro(s)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {shown.length === 0 ? (
            <SheetGridEmptyRow colSpan={COLUMNS}>
              {filtering ? 'Ningún vientre coincide con el filtro.' : 'No hay vientres preñados disponibles para una orden nueva.'}
            </SheetGridEmptyRow>
          ) : (
            shown.map((group) => {
              const ids = group.females.map((f) => f.caravanId);
              const picked = ids.filter((id) => chosen.has(id)).length;
              const open = term !== '' || !folded.has(group.key);
              const committed = group.committed.reduce((sum, c) => sum + c.count, 0);

              return (
                <React.Fragment key={group.key}>
                  <SheetGridGroupRow
                    colSpan={COLUMNS}
                    name={group.name}
                    caption={`${picked} de ${ids.length}`}
                    check={{
                      checked: ids.length > 0 && picked === ids.length,
                      indeterminate: picked > 0 && picked < ids.length,
                      disabled: ids.length === 0,
                      onChange: (on) => setMany(ids, on)
                    }}
                    fold={{ open, disabled: ids.length === 0 || term !== '', onToggle: () => toggleFolded(group.key) }}
                    trailing={
                      committed > 0 && (
                        <Tooltip title={group.committed.map((c) => `${c.count} en ${c.code}`).join(' · ')}>
                          <Typography variant="caption" color="text.secondary" sx={{ cursor: 'help', whiteSpace: 'nowrap' }}>
                            {committed} en {group.committed.length === 1 ? `orden ${group.committed[0].code}` : `${group.committed.length} órdenes abiertas`}
                          </Typography>
                        </Tooltip>
                      )
                    }
                  />

                  {open &&
                    group.females.map((female) => (
                      <PregnantFemaleSelectRow
                        key={female.caravanId}
                        female={female}
                        chosen={chosen.has(female.caravanId)}
                        onToggle={() => setMany([female.caravanId], !chosen.has(female.caravanId))}
                      />
                    ))}
                </React.Fragment>
              );
            })
          )}
        </TableBody>
      </SheetGrid>
    </Stack>
  );
};

export default PregnantFemalesByBatchSelector;
