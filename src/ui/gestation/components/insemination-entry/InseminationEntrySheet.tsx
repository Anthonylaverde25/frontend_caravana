import { useMemo, useState } from 'react';
import { Checkbox, Stack, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import SheetGrid, { type SheetGridHeight } from '@/components/sheet-grid/SheetGrid';
import SheetGridEmptyRow from '@/components/sheet-grid/SheetGridEmptyRow';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';
import type { SemenOption } from '@/features/semen/hooks/useSemenOptions';
import InseminationEntryRow from './InseminationEntryRow';
import InseminationSheetToolbar from './InseminationSheetToolbar';
import { INSEMINATION_FILTERS, type InseminationFemale, type InseminationFilter } from './inseminationEntryModel';
import type { InseminationEntryController } from './useInseminationEntryState';

const COLUMNS: { label: string; minWidth: number }[] = [
  { label: 'Semen previsto', minWidth: 160 },
  { label: 'Semen', minWidth: 200 },
  { label: 'Partida', minWidth: 170 },
  { label: 'Pajuelas', minWidth: 90 },
  { label: 'Fecha', minWidth: 150 },
  { label: 'Termo', minWidth: 130 },
  { label: 'Observación', minWidth: 150 },
];

interface InseminationEntrySheetProps {
  females: InseminationFemale[];
  entry: InseminationEntryController;
  options: SemenOption[];
  byId: Map<number, SemenOption>;
  tanks: { id: number; code: string; name: string }[];
  onVoid: (inseminationId: number) => void;
  maxHeight?: SheetGridHeight;
}

const matches = (female: InseminationFemale, filter: InseminationFilter) =>
  filter === 'all' || (filter === 'pending' ? female.live.length === 0 : female.live.length > 0);

/** The insemination sheet (patrón de planilla): one row per female of the order (DB10). */
export default function InseminationEntrySheet({ females, entry, options, byId, tanks, onVoid, maxHeight = 480 }: InseminationEntrySheetProps) {
  const { headSx: head } = useGridCellStyles();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<InseminationFilter>(() => (females.some((f) => f.live.length === 0) ? 'pending' : 'all'));
  const term = search.trim().toLowerCase();

  const counts = Object.fromEntries(INSEMINATION_FILTERS.map((f) => [f, females.filter((female) => matches(female, f)).length])) as Record<InseminationFilter, number>;
  const shown = useMemo(
    () => females.filter((female) => (matches(female, filter) || entry.selected.has(female.id)) && (term === '' || female.identification.toLowerCase().includes(term))),
    [females, filter, term, entry.selected]
  );
  const selectable = shown.filter((female) => entry.editable.has(female.id)).map((female) => female.id);
  const shownSelected = selectable.filter((id) => entry.selected.has(id)).length;

  return (
    <Stack spacing={1.5}>
      <InseminationSheetToolbar
        search={search}
        onSearch={setSearch}
        filter={filter}
        onFilter={setFilter}
        counts={counts}
        shownSelectable={selectable.length}
        selectedCount={entry.selected.size}
        onSelectShown={() => entry.selectMany(selectable, true)}
        onClearSelection={() => entry.selectMany([...entry.selected], false)}
      />
      <SheetGrid minWidth={1300} maxHeight={maxHeight}>
        <TableHead>
          <TableRow>
            <TableCell align="center" sx={{ ...head, width: 44, px: 0 }}>
              <Checkbox
                size="small"
                checked={selectable.length > 0 && shownSelected === selectable.length}
                indeterminate={shownSelected > 0 && shownSelected < selectable.length}
                disabled={selectable.length === 0}
                onChange={(e) => entry.selectMany(selectable, e.target.checked)}
              />
            </TableCell>
            <TableCell sx={{ ...head, minWidth: 180 }}>Caravana</TableCell>
            {COLUMNS.map((column) => (
              <TableCell key={column.label} sx={{ ...head, minWidth: column.minWidth }}>
                {column.label}
              </TableCell>
            ))}
            <TableCell sx={{ ...head, width: 48, borderRight: 0 }} />
          </TableRow>
        </TableHead>
        <TableBody>
          {shown.length === 0 && (
            <SheetGridEmptyRow colSpan={COLUMNS.length + 3}>
              {filter === 'pending' && term === '' ? 'No quedan vientres sin inseminar.' : 'Ningún vientre coincide con el filtro.'}
            </SheetGridEmptyRow>
          )}
          {shown.map((female, index) => (
            <InseminationEntryRow
              key={female.id}
              female={female}
              draft={entry.drafts[female.id]}
              editable={entry.editable.has(female.id)}
              selected={entry.selected.has(female.id)}
              errors={entry.errors[female.id] ?? {}}
              options={options}
              byId={byId}
              tanks={tanks}
              zebra={index % 2 === 1}
              onToggle={() => entry.toggleSelected(female.id)}
              onChange={(patch) => entry.update(female.id, patch)}
              onAddAnother={() => entry.addAnother(female.id)}
              onVoid={onVoid}
            />
          ))}
        </TableBody>
      </SheetGrid>
    </Stack>
  );
}
