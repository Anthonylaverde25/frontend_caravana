import React, { useMemo, useState } from 'react';
import {
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
import { dueLabel, stageLabel } from '../birthOrderFormat';
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

const sireText = (count: number, names: string) => (count === 0 ? 'Sin toro' : count === 1 ? names : `${count} candidatos`);

/**
 * Pregnant females as a sheet grouped by batch, soonest due first. All the batches (header
 * checkbox), a whole batch (its row) or female by female; the stage and the "due until" filters
 * narrow what is shown — the head of the season, for instance — and the checkboxes act on what is shown.
 */
export const PregnantFemalesByBatchSelector: React.FC<PregnantFemalesByBatchSelectorProps> = ({ groups, selected, onChange, maxHeight = 380 }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
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

      <TableContainer sx={{ maxHeight, border: '1px solid', borderColor: 'divider', borderRadius: '4px' }}>
        <Table stickyHeader size="small" sx={{ minWidth: 560 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...headSx, width: 48, px: 1 }}>
                <Checkbox
                  size="small"
                  checked={shownIds.length > 0 && shownChosen === shownIds.length}
                  indeterminate={shownChosen > 0 && shownChosen < shownIds.length}
                  disabled={shownIds.length === 0}
                  onChange={(e) => setMany(shownIds, e.target.checked)}
                />
              </TableCell>
              <TableCell sx={headSx}>Vientre</TableCell>
              <TableCell sx={headSx}>FPP</TableCell>
              <TableCell sx={headSx}>Estadio</TableCell>
              <TableCell sx={headSx}>Toro(s)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {shown.length === 0 ? (
              <TableRow>
                <TableCell colSpan={COLUMNS} align="center" sx={{ ...cellSx, py: 6, color: 'text.disabled', fontStyle: 'italic' }}>
                  {filtering ? 'Ningún vientre coincide con el filtro.' : 'No hay vientres preñados disponibles para una orden nueva.'}
                </TableCell>
              </TableRow>
            ) : (
              shown.map((group) => {
                const ids = group.females.map((f) => f.caravanId);
                const picked = ids.filter((id) => chosen.has(id)).length;
                const open = term !== '' || !folded.has(group.key);
                const committed = group.committed.reduce((sum, c) => sum + c.count, 0);

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
                            {picked} de {ids.length}
                          </Typography>
                          {committed > 0 && (
                            <Tooltip title={group.committed.map((c) => `${c.count} en ${c.code}`).join(' · ')}>
                              <Typography variant="caption" color="text.secondary" sx={{ cursor: 'help', whiteSpace: 'nowrap' }}>
                                {committed} en {group.committed.length === 1 ? `orden ${group.committed[0].code}` : `${group.committed.length} órdenes abiertas`}
                              </Typography>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>

                    {open &&
                      group.females.map((female) => {
                        const isChosen = chosen.has(female.caravanId);

                        return (
                          <TableRow
                            key={female.caravanId}
                            hover
                            onClick={() => setMany([female.caravanId], !isChosen)}
                            sx={{ cursor: 'pointer', bgcolor: isChosen ? selectedBg : 'transparent' }}
                          >
                            <TableCell sx={{ ...cellSx, px: 1 }}>
                              <Checkbox size="small" checked={isChosen} tabIndex={-1} disableRipple />
                            </TableCell>
                            <TableCell sx={{ ...cellSx, fontFamily: 'monospace', fontWeight: 800 }}>
                              {female.identification}
                              <Typography component="span" variant="caption" color="text.secondary" sx={{ fontFamily: 'inherit' }}>
                                {' '}
                                · {female.categoryLabel ?? 'Vientre'}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ ...cellSx, whiteSpace: 'nowrap' }}>{dueLabel(female.dueDate)}</TableCell>
                            <TableCell sx={cellSx}>{stageLabel(female.stage)}</TableCell>
                            <TableCell sx={{ ...cellSx, color: 'text.secondary' }}>
                              {sireText(female.sires.length, female.sires.map((s) => s.identification).join(', '))}
                            </TableCell>
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

export default PregnantFemalesByBatchSelector;
