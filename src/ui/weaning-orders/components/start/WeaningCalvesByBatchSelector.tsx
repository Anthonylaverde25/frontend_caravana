import React, { useMemo, useState } from 'react';
import { Button, Chip, InputAdornment, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { BirthHistoryRecord } from '@/features/gestation/hooks/useBirthHistory';
import { calfGroupKey, useCalvesByBatch } from './useCalvesByBatch';
import WeaningCalvesGrid from './WeaningCalvesGrid';
import type { CalfDestinationCell, CalfMeasureCells } from './WeaningCalfSelectRow';
import WeaningUntaggedCalvesNotice from './WeaningUntaggedCalvesNotice';

type Height = number | string | Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', number | string>>;

interface WeaningCalvesByBatchSelectorProps {
  births: BirthHistoryRecord[];
  /** Calves already on the order: not offered again. */
  excludeIds?: number[];
  selected: number[];
  onChange: (ids: number[]) => void;
  /** Calves the screen opened with: their batches are the only ones shown at first. */
  focusIds?: number[];
  /** The order being executed: its own calves are offered, not counted as held. */
  heldBy?: string | null;
  /** Height of the sheet; a CSS value (or one per breakpoint) fills a tall layout. */
  maxHeight?: Height;
  /** The "Lote destino" column, when each calf goes to its own batch. */
  destination?: CalfDestinationCell;
  /** The "Peso (kg)" and "Observaciones" columns, when the weaning already happened. */
  measures?: CalfMeasureCells;
  /** Shown right above the grid, e.g. the bar that gives a batch to several calves at once. */
  toolbar?: React.ReactNode;
}

/**
 * Calves at foot as a sheet grouped by batch: every batch starts open and can be folded. All the
 * batches (header checkbox), a whole batch (its row) or calf by calf. The search and sex filter
 * narrow what is shown, and the batch and header checkboxes act on what is shown.
 *
 * Opened with calves already chosen (from "Crías al pie"), only their batches are shown at first;
 * "Ver todos los lotes" brings the rest back to add calves from another one.
 */
export const WeaningCalvesByBatchSelector: React.FC<WeaningCalvesByBatchSelectorProps> = ({
  births,
  excludeIds,
  selected,
  onChange,
  focusIds = [],
  heldBy = null,
  maxHeight = 380,
  destination,
  measures,
  toolbar
}) => {
  const groups = useCalvesByBatch(births, excludeIds, heldBy);
  const [search, setSearch] = useState('');
  const [sexFilter, setSexFilter] = useState<'ALL' | 'M' | 'H'>('ALL');
  const [folded, setFolded] = useState<Set<string>>(new Set());
  const chosen = useMemo(() => new Set(selected), [selected]);
  const term = search.trim().toLowerCase();
  const [initialScope] = useState<Set<string> | null>(() => {
    if (focusIds.length === 0) return null;

    const chosenIds = new Set(focusIds);
    const keys = new Set(births.filter((b) => chosenIds.has(b.calf_id)).map(calfGroupKey));

    return keys.size > 0 ? keys : null;
  });
  const [scoped, setScoped] = useState(initialScope !== null);
  const inScope = useMemo(
    () => (scoped && initialScope ? groups.filter((group) => initialScope.has(group.key)) : groups),
    [groups, scoped, initialScope]
  );

  const shown = useMemo(
    () =>
      inScope
        .map((group) => ({
          ...group,
          calves: group.calves.filter(
            (c) =>
              (term === '' || c.calf_identification.toLowerCase().includes(term) || c.mother_identification.toLowerCase().includes(term)) &&
              (sexFilter === 'ALL' || c.calf_sex === sexFilter)
          )
        }))
        .filter((group) => group.calves.length > 0 || (term === '' && sexFilter === 'ALL' && group.committed.length > 0)),
    [inScope, term, sexFilter]
  );
  const shownIds = shown.flatMap((g) => g.calves.map((c) => c.calf_id));
  const shownChosen = shownIds.filter((id) => chosen.has(id)).length;

  const selectedStats = useMemo(() => {
    const byId = new Map(births.map((b) => [b.calf_id, b]));
    const chosenList = selected.map((id) => byId.get(id)).filter(Boolean);
    const chosenBatches = new Set(chosenList.map((b) => b?.calf_batch_id)).size;
    const males = chosenList.filter((b) => b?.calf_sex === 'M').length;
    const females = chosenList.filter((b) => b?.calf_sex === 'H').length;

    return {
      total: chosenList.length,
      males,
      females,
      batches: chosenBatches
    };
  }, [births, selected]);

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

  // A search always shows its matches.
  const isOpen = (key: string) => term !== '' || !folded.has(key);

  return (
    <Stack spacing={1.5}>
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={1.5}
        alignItems={{ lg: 'center' }}
        justifyContent="space-between"
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }} sx={{ flex: 1 }}>
          <TextField
            size="small"
            placeholder="Buscar cría o madre…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: { sm: 220 }, flex: { sm: 1 } }}
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
          <ToggleButtonGroup
            size="small"
            value={sexFilter}
            exclusive
            onChange={(_, val) => val && setSexFilter(val)}
            sx={{ height: 38 }}
          >
            <ToggleButton value="ALL" sx={{ px: 1.5, py: 0.5, textTransform: 'none', fontWeight: 600, fontSize: '0.8rem' }}>
              Todos
            </ToggleButton>
            <ToggleButton value="M" sx={{ px: 1.5, py: 0.5, textTransform: 'none', fontWeight: 600, fontSize: '0.8rem' }}>
              ♂ Machos
            </ToggleButton>
            <ToggleButton value="H" sx={{ px: 1.5, py: 0.5, textTransform: 'none', fontWeight: 600, fontSize: '0.8rem' }}>
              ♀ Hembras
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          {initialScope && groups.length > initialScope.size && (
            <Button
              size="small"
              color="inherit"
              onClick={() => setScoped((value) => !value)}
              startIcon={<FuseSvgIcon size={15}>{scoped ? 'heroicons-outline:eye' : 'heroicons-outline:funnel'}</FuseSvgIcon>}
              sx={{ textTransform: 'none', fontSize: '0.78rem', fontWeight: 600, color: 'text.secondary' }}
            >
              {scoped ? `Ver todos los lotes (${groups.length})` : 'Sólo lotes de la selección'}
            </Button>
          )}
          {selected.length > 0 && (
            <Button
              size="small"
              color="inherit"
              onClick={() => onChange([])}
              sx={{ textTransform: 'none', fontSize: '0.78rem', color: 'text.secondary' }}
            >
              Desmarcar todo
            </Button>
          )}
          {shownIds.length > 0 && (
            <Button
              size="small"
              variant="outlined"
              onClick={() => setMany(shownIds, true)}
              sx={{ textTransform: 'none', fontSize: '0.78rem', fontWeight: 600, height: 34 }}
            >
              Marcar visibles ({shownIds.length})
            </Button>
          )}
        </Stack>
      </Stack>

      {/* Live Selection Metrics Bar */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        alignItems={{ sm: 'center' }}
        justifyContent="space-between"
        sx={{
          px: 1.5,
          py: 1,
          borderRadius: '6px',
          bgcolor: 'action.hover',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Chip
            size="small"
            color="primary"
            label={`${selectedStats.total} seleccionada(s)`}
            sx={{ fontWeight: 700, fontSize: '0.8rem' }}
          />
          <Chip
            size="small"
            variant="outlined"
            label={`♂ ${selectedStats.males} Macho(s)`}
            sx={{ fontWeight: 600, fontSize: '0.78rem' }}
          />
          <Chip
            size="small"
            variant="outlined"
            label={`♀ ${selectedStats.females} Hembra(s)`}
            sx={{ fontWeight: 600, fontSize: '0.78rem' }}
          />
          <Chip
            size="small"
            variant="outlined"
            label={`${selectedStats.batches} Lote(s)`}
            sx={{ fontWeight: 600, fontSize: '0.78rem' }}
          />
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
          {shownChosen} de {shownIds.length} visibles en grilla
        </Typography>
      </Stack>

      <WeaningUntaggedCalvesNotice groups={inScope} />

      {toolbar}

      <WeaningCalvesGrid
        groups={shown}
        chosen={chosen}
        searching={term !== ''}
        isOpen={isOpen}
        onToggleFolded={toggleFolded}
        onSetMany={setMany}
        maxHeight={maxHeight}
        destination={destination}
        measures={measures}
      />
    </Stack>
  );
};

export default WeaningCalvesByBatchSelector;
