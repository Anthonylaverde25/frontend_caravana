import React from 'react';
import { Checkbox, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import SheetGrid from '@/components/sheet-grid/SheetGrid';
import SheetGridEmptyRow from '@/components/sheet-grid/SheetGridEmptyRow';
import SheetGridGroupRow from '@/components/sheet-grid/SheetGridGroupRow';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';
import PaternityRow from './PaternityRow';
import type { MaleOption } from './PaternitySireCell';
import { type PaternityGroup, valueOf } from './paternityModel';
import type { PaternityController } from './usePaternityState';

const COLUMNS: { label: string; minWidth: number }[] = [
  { label: 'Cría · madre', minWidth: 200 },
  { label: 'Nacimiento', minWidth: 110 },
  { label: 'Concepción estimada', minWidth: 190 },
  { label: 'Padre', minWidth: 260 },
  { label: 'Método', minWidth: 170 },
  { label: 'Nota', minWidth: 200 },
];

interface PaternityGridProps {
  groups: PaternityGroup[];
  state: PaternityController;
  males: MaleOption[];
}

/** The pending calves grouped by the service order of their gestation. */
export default function PaternityGrid({ groups, state, males }: PaternityGridProps) {
  const { headSx: head } = useGridCellStyles();
  const shownIds = groups.flatMap((group) => group.calves.map((calf) => calf.calf_id));
  const shownSelected = shownIds.filter((id) => state.selected.has(id)).length;

  return (
    <SheetGrid minWidth={1220} maxHeight={{ xs: 520, lg: 'calc(100vh - 360px)' }}>
      <TableHead>
        <TableRow>
          <TableCell align="center" sx={{ ...head, width: 44, px: 0 }}>
            <Checkbox
              size="small"
              checked={shownIds.length > 0 && shownSelected === shownIds.length}
              indeterminate={shownSelected > 0 && shownSelected < shownIds.length}
              disabled={shownIds.length === 0}
              onChange={(e) => state.selectMany(shownIds, e.target.checked)}
            />
          </TableCell>
          {COLUMNS.map((column) => (
            <TableCell key={column.label} sx={{ ...head, minWidth: column.minWidth }}>
              {column.label}
            </TableCell>
          ))}
          <TableCell sx={{ ...head, width: 48, borderRight: 0 }} />
        </TableRow>
      </TableHead>
      <TableBody>
        {groups.length === 0 && <SheetGridEmptyRow colSpan={COLUMNS.length + 2}>No hay crías que coincidan con la búsqueda.</SheetGridEmptyRow>}
        {groups.map((group) => {
          const ids = group.calves.map((calf) => calf.calf_id);
          const picked = ids.filter((id) => state.selected.has(id)).length;
          return (
            <React.Fragment key={group.key}>
              <SheetGridGroupRow
                colSpan={COLUMNS.length + 2}
                name={group.name}
                caption={group.caption}
                check={{ checked: picked === ids.length, indeterminate: picked > 0 && picked < ids.length, onChange: (on) => state.selectMany(ids, on) }}
              />
              {group.calves.map((calf) => (
                <PaternityRow
                  key={calf.calf_id}
                  calf={calf}
                  value={valueOf(state.values, calf.calf_id)}
                  males={males}
                  selected={state.selected.has(calf.calf_id)}
                  problem={state.flagged[calf.calf_id]}
                  onToggleSelected={() => state.toggleSelected(calf.calf_id)}
                  onChange={(patch) => state.update(calf.calf_id, patch)}
                />
              ))}
            </React.Fragment>
          );
        })}
      </TableBody>
    </SheetGrid>
  );
}
