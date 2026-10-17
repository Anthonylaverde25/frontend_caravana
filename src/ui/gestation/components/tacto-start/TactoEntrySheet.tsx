import React, { useMemo, useState } from 'react';
import { Checkbox, Stack, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import SheetGrid from '@/components/sheet-grid/SheetGrid';
import SheetGridEmptyRow from '@/components/sheet-grid/SheetGridEmptyRow';
import SheetGridGroupRow from '@/components/sheet-grid/SheetGridGroupRow';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';
import type { DiagnosisFemale } from '@/features/gestation/hooks/useServiceOrders';
import DiagnosisEntryRow, { type BatchOption } from '../diagnosis-entry/DiagnosisEntryRow';
import { entryOf } from '../diagnosis-entry/diagnosisEntryModel';
import type { DiagnosisEntryController } from '../diagnosis-entry/useDiagnosisEntryState';
import TactoSheetToolbar, { TACTO_FILTERS } from './TactoSheetToolbar';
import { type TactoFemaleFilter, groupByBatch, matchesFilter } from './tactoStart';

/** The detail cells after the result, as in the bulk birth grid. */
const COLUMNS: { label: string; minWidth: number }[] = [
  { label: 'Estadio', minWidth: 120 },
  { label: 'Meses', minWidth: 80 },
  { label: 'Toro', minWidth: 140 },
  { label: 'Salida / motivo', minWidth: 190 },
  { label: 'Nota', minWidth: 160 },
];

type Height = number | string | Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', number | string>>;

interface TactoEntrySheetProps {
  females: DiagnosisFemale[];
  entry: DiagnosisEntryController;
  serviceBatchId: number;
  roundDate: string;
  suggestedDate: string | null;
  bulls: { id: number; identification: string }[];
  emptyDestinations: BatchOption[];
  allowNotDiagnosed: boolean;
  maxHeight?: Height;
}

/**
 * The tacto sheet: the females of the order grouped by current batch, each with its result for
 * this round. "Sin tactar" is the default and is never sent. Filtering never drops what was
 * typed: "Con resultado" shows it all before saving.
 */
export default function TactoEntrySheet({
  females,
  entry,
  serviceBatchId,
  roundDate,
  suggestedDate,
  bulls,
  emptyDestinations,
  allowNotDiagnosed,
  maxHeight = 480,
}: TactoEntrySheetProps) {
  const { headSx: head } = useGridCellStyles();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<TactoFemaleFilter>('pending');
  const term = search.trim().toLowerCase();
  const isStated = (female: DiagnosisFemale) => entryOf(entry.values, female.female_caravan_id).result !== 'UNCHECKED';

  const counts = Object.fromEntries(
    TACTO_FILTERS.map((f) => [f, females.filter((female) => matchesFilter(female, f, roundDate, isStated(female))).length])
  ) as Record<TactoFemaleFilter, number>;
  const groups = useMemo(
    () =>
      groupByBatch(
        females.filter(
          (female) =>
            matchesFilter(female, filter, roundDate, entryOf(entry.values, female.female_caravan_id).result !== 'UNCHECKED') &&
            (term === '' || female.identification.toLowerCase().includes(term))
        ),
        serviceBatchId
      ),
    [females, filter, roundDate, term, serviceBatchId, entry.values]
  );
  const shownIds = groups.flatMap((group) => group.females.map((female) => female.female_caravan_id));
  const shownSelected = shownIds.filter((id) => entry.selected.has(id)).length;

  return (
    <Stack spacing={1.5}>
      <TactoSheetToolbar
        search={search}
        onSearch={setSearch}
        filter={filter}
        onFilter={setFilter}
        counts={counts}
        statedCount={counts.stated}
        shownCount={shownIds.length}
        selectedCount={entry.selected.size}
        allowNotDiagnosed={allowNotDiagnosed}
        onSelectShown={() => entry.selectMany(shownIds, true)}
        onClearSelection={() => entry.selectMany([...entry.selected], false)}
        onApply={(result, reason) => entry.setResult([...entry.selected], result, reason ? { not_diagnosed_reason: reason } : {})}
      />

      <SheetGrid minWidth={1180} maxHeight={maxHeight}>
        <TableHead>
          <TableRow>
            <TableCell align="center" sx={{ ...head, width: 44, px: 0 }}>
              <Checkbox
                size="small"
                checked={shownIds.length > 0 && shownSelected === shownIds.length}
                indeterminate={shownSelected > 0 && shownSelected < shownIds.length}
                disabled={shownIds.length === 0}
                onChange={(e) => entry.selectMany(shownIds, e.target.checked)}
              />
            </TableCell>
            <TableCell sx={{ ...head, minWidth: 200 }}>Vientre · veredicto actual</TableCell>
            <TableCell sx={{ ...head, minWidth: 330 }}>Resultado</TableCell>
            {COLUMNS.map((column) => (
              <TableCell key={column.label} sx={{ ...head, minWidth: column.minWidth }}>
                {column.label}
              </TableCell>
            ))}
            <TableCell sx={{ ...head, width: 48, borderRight: 0 }} />
          </TableRow>
        </TableHead>
        <TableBody>
          {groups.length === 0 && (
            <SheetGridEmptyRow colSpan={COLUMNS.length + 4}>
              {filter === 'pending' && term === '' ? 'No quedan vientres pendientes de diagnóstico.' : 'Ningún vientre coincide con el filtro.'}
            </SheetGridEmptyRow>
          )}
          {groups.map((group) => {
            const ids = group.females.map((female) => female.female_caravan_id);
            const picked = ids.filter((id) => entry.selected.has(id)).length;
            return (
              <React.Fragment key={group.key}>
                <SheetGridGroupRow
                  colSpan={COLUMNS.length + 4}
                  name={group.batchName}
                  caption={`${ids.length} vientre(s)`}
                  check={{ checked: picked === ids.length, indeterminate: picked > 0 && picked < ids.length, onChange: (on) => entry.selectMany(ids, on) }}
                  trailing={
                    !group.isServiceBatch && (
                      <Typography variant="caption" color="warning.main" sx={{ fontWeight: 700 }}>
                        Fuera del lote de servicio
                      </Typography>
                    )
                  }
                />
                {group.females.map((female) => {
                  const id = female.female_caravan_id;
                  return (
                    <DiagnosisEntryRow
                      key={id}
                      female={female}
                      value={entryOf(entry.values, id)}
                      selected={entry.selected.has(id)}
                      problem={entry.flagged[id]}
                      bulls={bulls}
                      emptyDestinations={emptyDestinations}
                      serviceBatchId={serviceBatchId}
                      allowNotDiagnosed={allowNotDiagnosed}
                      roundDate={roundDate}
                      suggestedDate={suggestedDate}
                      onToggleSelected={() => entry.toggleSelected(id)}
                      onResult={(result) => entry.setResult([id], result)}
                      onChange={(patch) => entry.update(id, patch)}
                    />
                  );
                })}
              </React.Fragment>
            );
          })}
        </TableBody>
      </SheetGrid>
    </Stack>
  );
}
