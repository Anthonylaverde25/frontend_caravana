import React from 'react';
import { Checkbox, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import SheetGrid from '@/components/sheet-grid/SheetGrid';
import SheetGridEmptyRow from '@/components/sheet-grid/SheetGridEmptyRow';
import SheetGridGroupRow from '@/components/sheet-grid/SheetGridGroupRow';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';
import WeaningCalfSelectRow, { CalfDestinationCell, CalfMeasureCells } from './WeaningCalfSelectRow';
import type { CalfBatchGroup } from './useCalvesByBatch';

type Height = number | string | Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', number | string>>;

interface WeaningCalvesGridProps {
  groups: CalfBatchGroup[];
  chosen: Set<number>;
  /** A search is on: every batch shows its matches and none folds. */
  searching: boolean;
  isOpen: (key: string) => boolean;
  onToggleFolded: (key: string) => void;
  onSetMany: (ids: number[], on: boolean) => void;
  maxHeight?: Height;
  /** The "Lote destino" column, when each calf goes to its own batch. */
  destination?: CalfDestinationCell;
  /** The "Peso (kg)" and "Observaciones" columns, when the weaning already happened. */
  measures?: CalfMeasureCells;
}

const committedCount = (group: CalfBatchGroup) => group.committed.reduce((sum, c) => sum + c.count, 0);

/** The calves at foot shown by the selector, by batch, with the batch and header checkboxes. */
export const WeaningCalvesGrid: React.FC<WeaningCalvesGridProps> = ({ groups, chosen, searching, isOpen, onToggleFolded, onSetMany, maxHeight, destination, measures }) => {
  const { headSx } = useGridCellStyles();
  const columns = 5 + (destination ? 1 : 0) + (measures ? 2 : 0);
  const shownIds = groups.flatMap((g) => g.calves.map((c) => c.calf_id));
  const shownChosen = shownIds.filter((id) => chosen.has(id)).length;

  return (
    <SheetGrid minWidth={560 + (destination ? 220 : 0) + (measures ? 330 : 0)} maxHeight={maxHeight}>
      <TableHead>
        <TableRow>
          <TableCell align="center" sx={{ ...headSx, width: 44, px: 0 }}>
            <Tooltip title={searching ? 'Todas las visibles' : 'Todos los lotes'}>
              <span>
                <Checkbox
                  size="small"
                  checked={shownIds.length > 0 && shownChosen === shownIds.length}
                  indeterminate={shownChosen > 0 && shownChosen < shownIds.length}
                  disabled={shownIds.length === 0}
                  onChange={(e) => onSetMany(shownIds, e.target.checked)}
                />
              </span>
            </Tooltip>
          </TableCell>
          <TableCell sx={{ ...headSx, minWidth: 160 }}>Caravana cría</TableCell>
          <TableCell sx={{ ...headSx, minWidth: 160 }}>Caravana madre</TableCell>
          <TableCell sx={{ ...headSx, width: 110 }}>Sexo</TableCell>
          <TableCell sx={{ ...headSx, width: 130 }}>Nacimiento</TableCell>
          {destination && <TableCell sx={{ ...headSx, width: 220 }}>Lote destino</TableCell>}
          {measures && <TableCell sx={{ ...headSx, width: 110 }}>Peso (kg)</TableCell>}
          {measures && <TableCell sx={{ ...headSx, width: 220 }}>Observaciones</TableCell>}
        </TableRow>
      </TableHead>
      <TableBody>
        {groups.length === 0 ? (
          <SheetGridEmptyRow colSpan={columns}>
            {searching ? 'Ninguna cría coincide con la búsqueda.' : 'No hay crías al pie disponibles para una orden nueva.'}
          </SheetGridEmptyRow>
        ) : (
          groups.map((group) => {
            const ids = group.calves.map((c) => c.calf_id);
            const picked = ids.filter((id) => chosen.has(id)).length;
            const males = group.calves.filter((c) => c.calf_sex === 'M').length;
            const females = group.calves.filter((c) => c.calf_sex === 'H').length;
            const open = isOpen(group.key);

            return (
              <React.Fragment key={group.key}>
                <SheetGridGroupRow
                  colSpan={columns}
                  name={group.name}
                  caption={`${picked} de ${ids.length} · ${males} M · ${females} H`}
                  check={{
                    checked: ids.length > 0 && picked === ids.length,
                    indeterminate: picked > 0 && picked < ids.length,
                    disabled: ids.length === 0,
                    onChange: (on) => onSetMany(ids, on)
                  }}
                  fold={{ open, disabled: ids.length === 0 || searching, onToggle: () => onToggleFolded(group.key) }}
                  trailing={
                    group.committed.length > 0 && (
                      <Tooltip title={group.committed.map((c) => `${c.count} en ${c.code}`).join(' · ')}>
                        <Typography variant="caption" color="text.secondary" sx={{ cursor: 'help', whiteSpace: 'nowrap' }}>
                          {committedCount(group)} en{' '}
                          {group.committed.length === 1 ? `orden ${group.committed[0].code}` : `${group.committed.length} órdenes abiertas`}
                        </Typography>
                      </Tooltip>
                    )
                  }
                />

                {open &&
                  group.calves.map((calf) => (
                    <WeaningCalfSelectRow
                      key={calf.calf_id}
                      calf={calf}
                      chosen={chosen.has(calf.calf_id)}
                      onToggle={() => onSetMany([calf.calf_id], !chosen.has(calf.calf_id))}
                      destination={destination}
                      measures={measures}
                    />
                  ))}
              </React.Fragment>
            );
          })
        )}
      </TableBody>
    </SheetGrid>
  );
};

export default WeaningCalvesGrid;
