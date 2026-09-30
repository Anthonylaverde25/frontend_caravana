import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  IconButton,
  InputAdornment,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { BirthHistoryRecord } from '@/features/gestation/hooks/useBirthHistory';
import { CalfBatchGroup, useCalvesByBatch } from './useCalvesByBatch';

type Height = number | string | Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', number | string>>;

interface WeaningCalvesByBatchSelectorProps {
  births: BirthHistoryRecord[];
  /** Calves already on the order: not offered again. */
  excludeIds?: number[];
  selected: number[];
  onChange: (ids: number[]) => void;
  /** Height of the sheet; a CSS value (or one per breakpoint) fills a tall layout. */
  maxHeight?: Height;
}

const COLUMNS = 5;

const committedCount = (group: CalfBatchGroup) => group.committed.reduce((sum, c) => sum + c.count, 0);

const sexLabel = (sex: string | null) => (sex === 'M' ? 'Macho' : sex === 'H' ? 'Hembra' : '-');

/**
 * Calves at foot as a sheet grouped by batch: every batch starts open and can be folded. All the
 * batches (header checkbox), a whole batch (its row) or calf by calf. The search and sex filter
 * narrow what is shown, and the batch and header checkboxes act on what is shown.
 */
export const WeaningCalvesByBatchSelector: React.FC<WeaningCalvesByBatchSelectorProps> = ({
  births,
  excludeIds,
  selected,
  onChange,
  maxHeight = 380
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const groups = useCalvesByBatch(births, excludeIds);
  const [search, setSearch] = useState('');
  const [sexFilter, setSexFilter] = useState<'ALL' | 'M' | 'H'>('ALL');
  const [folded, setFolded] = useState<Set<string>>(new Set());
  const chosen = useMemo(() => new Set(selected), [selected]);
  const term = search.trim().toLowerCase();

  const shown = useMemo(
    () =>
      groups
        .map((group) => ({
          ...group,
          calves: group.calves.filter(
            (c) =>
              (term === '' || c.calf_identification.toLowerCase().includes(term) || c.mother_identification.toLowerCase().includes(term)) &&
              (sexFilter === 'ALL' || c.calf_sex === sexFilter)
          )
        }))
        .filter((group) => group.calves.length > 0 || (term === '' && sexFilter === 'ALL' && group.committed.length > 0)),
    [groups, term, sexFilter]
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

  // The spreadsheet look of the births list (GestationBirthsView).
  const border = { borderRight: '1px solid', borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderRight: 0 } };
  const headSx = {
    ...border,
    px: 1.5,
    py: 1.25,
    fontSize: '0.75rem',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottomWidth: 2,
    bgcolor: isDark ? 'background.default' : '#f8f9fa'
  } as const;
  const cellSx = { ...border, px: 1.5, py: 0.25, fontSize: '0.85rem' } as const;
  const groupBg = isDark ? 'rgba(255, 255, 255, 0.06)' : '#eef2ef';
  const selectedBg = isDark ? 'rgba(237, 108, 2, 0.08)' : 'rgba(255, 152, 0, 0.05)';

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

      <TableContainer sx={{ maxHeight, border: '1px solid', borderColor: 'divider', borderRadius: '4px' }}>
        <Table stickyHeader size="small" sx={{ minWidth: 560 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...headSx, width: 48, px: 1 }}>
                <Tooltip title={term === '' ? 'Todos los lotes' : 'Todas las visibles'}>
                  <span>
                    <Checkbox
                      size="small"
                      checked={shownIds.length > 0 && shownChosen === shownIds.length}
                      indeterminate={shownChosen > 0 && shownChosen < shownIds.length}
                      disabled={shownIds.length === 0}
                      onChange={(e) => setMany(shownIds, e.target.checked)}
                    />
                  </span>
                </Tooltip>
              </TableCell>
              <TableCell sx={headSx}>Caravana cría</TableCell>
              <TableCell sx={headSx}>Caravana madre</TableCell>
              <TableCell sx={headSx}>Sexo</TableCell>
              <TableCell sx={headSx}>Nacimiento</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {shown.length === 0 ? (
              <TableRow>
                <TableCell colSpan={COLUMNS} align="center" sx={{ ...cellSx, py: 6, color: 'text.disabled', fontStyle: 'italic' }}>
                  {term === '' ? 'No hay crías al pie disponibles para una orden nueva.' : 'Ninguna cría coincide con la búsqueda.'}
                </TableCell>
              </TableRow>
            ) : (
              shown.map((group) => {
                const ids = group.calves.map((c) => c.calf_id);
                const picked = ids.filter((id) => chosen.has(id)).length;
                const males = group.calves.filter((c) => c.calf_sex === 'M').length;
                const females = group.calves.filter((c) => c.calf_sex === 'H').length;
                const open = isOpen(group.key);

                return (
                  <React.Fragment key={group.key}>
                    <TableRow>
                      <TableCell sx={{ ...cellSx, px: 1, bgcolor: groupBg }}>
                        <Checkbox
                          size="small"
                          checked={ids.length > 0 && picked === ids.length}
                          indeterminate={picked > 0 && picked < ids.length}
                          disabled={ids.length === 0}
                          onChange={(e) => setMany(ids, e.target.checked)}
                        />
                      </TableCell>
                      <TableCell colSpan={COLUMNS - 1} sx={{ ...cellSx, bgcolor: groupBg, py: 0.5 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <IconButton size="small" onClick={() => toggleFolded(group.key)} disabled={ids.length === 0 || term !== ''}>
                            <FuseSvgIcon size={16}>{open ? 'heroicons-outline:chevron-down' : 'heroicons-outline:chevron-right'}</FuseSvgIcon>
                          </IconButton>
                          <Typography sx={{ fontWeight: 800, fontSize: '0.85rem' }}>{group.name}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ flexGrow: 1 }}>
                            {picked} de {ids.length} · {males} M · {females} H
                          </Typography>
                          {group.committed.length > 0 && (
                            <Tooltip title={group.committed.map((c) => `${c.count} en ${c.code}`).join(' · ')}>
                              <Typography variant="caption" color="text.secondary" sx={{ cursor: 'help', whiteSpace: 'nowrap' }}>
                                {committedCount(group)} en{' '}
                                {group.committed.length === 1 ? `orden ${group.committed[0].code}` : `${group.committed.length} órdenes abiertas`}
                              </Typography>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>

                    {open &&
                      group.calves.map((calf) => {
                        const isChosen = chosen.has(calf.calf_id);

                        return (
                          <TableRow
                            key={calf.calf_id}
                            hover
                            onClick={() => setMany([calf.calf_id], !isChosen)}
                            sx={{ cursor: 'pointer', bgcolor: isChosen ? selectedBg : 'transparent' }}
                          >
                            <TableCell sx={{ ...cellSx, px: 1 }}>
                              <Checkbox size="small" checked={isChosen} tabIndex={-1} disableRipple />
                            </TableCell>
                            <TableCell sx={{ ...cellSx, fontFamily: 'monospace', fontWeight: 800 }}>{calf.calf_identification}</TableCell>
                            <TableCell sx={{ ...cellSx, fontFamily: 'monospace' }}>{calf.mother_identification}</TableCell>
                            <TableCell sx={cellSx}>{sexLabel(calf.calf_sex)}</TableCell>
                            <TableCell sx={{ ...cellSx, color: 'text.secondary' }}>{calf.birth_date}</TableCell>
                          </TableRow>
                        );
                      })}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};

export default WeaningCalvesByBatchSelector;
