import React, { useMemo } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useCompany } from '@/contexts/CompanyContext';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import { useBreeds } from '@/features/breeds/hooks/useBreeds';
import { useGridCellStyles } from '@/ui/birth-orders/components/grid/useGridCellStyles';
import type { Par01Row } from '../../hooks/usePar01Pages';
import type { Par01BirthOrderState } from '../../hooks/usePar01BirthOrder';
import type { Par01Problems } from '../../hooks/usePar01Submission';
import ScanPar01Row from './ScanPar01Row';
import { toBreedOptions } from './par01Catalog';

interface ScanPar01TableProps {
  rows: Par01Row[];
  order: Par01BirthOrderState;
  problems: Par01Problems;
  onRowChange: (id: string, field: keyof Par01Row, value: string) => void;
  onDeleteRow: (id: string) => void;
}

const HEADERS: { label: string; minWidth: number }[] = [
  { label: 'Madre', minWidth: 190 },
  { label: 'Resultado', minWidth: 170 },
  { label: 'Caravana cría', minWidth: 130 },
  { label: 'Sexo', minWidth: 90 },
  { label: 'Peso', minWidth: 80 },
  { label: 'Raza', minWidth: 130 },
  { label: 'Pelaje', minWidth: 140 },
  { label: 'Dientes', minWidth: 70 },
  { label: 'Padre (no está en el papel)', minWidth: 190 },
  { label: 'Fecha', minWidth: 140 },
  { label: 'Observaciones', minWidth: 160 },
  { label: 'Fuera de orden', minWidth: 90 }
];

/**
 * The supervised review of a PAR-01 load: every cell as read, editable, with the server's objections
 * marked on the cell itself. Two columns are not on the paper — the teeth (0) and the sire, offered
 * from the gestation of the female and optional. "Fuera de orden" is the box of the paper: a mother
 * the order did not list needs it crossed, here or there. What the order already registered is
 * shown grey and read-only: the same sheet is scanned again as the rounds fill it.
 */
export const ScanPar01Table: React.FC<ScanPar01TableProps> = ({ rows, order, problems, onRowChange, onDeleteRow }) => {
  const { cellSx, headerBg } = useGridCellStyles();
  const { activeCompanyId } = useCompany();
  const { data: caravans = [] } = useCaravans(activeCompanyId);
  const { data: breedList = [] } = useBreeds();
  const breeds = useMemo(() => toBreedOptions(breedList), [breedList]);
  const males = useMemo(() => caravans.filter((c) => c.sex === 'M').map((c) => ({ id: c.id, identification: c.identification })), [caravans]);
  const head = { ...cellSx, bgcolor: headerBg, fontWeight: 700, px: 1.25, py: 1, fontSize: '0.74rem' };

  return (
    <TableContainer sx={{ maxHeight: 'calc(100vh - 380px)', border: '1px solid', borderColor: 'divider', borderRadius: '4px' }}>
      <Table stickyHeader size="small" sx={{ borderCollapse: 'collapse', minWidth: 1840 }}>
        <TableHead>
          <TableRow>
            <TableCell align="center" sx={{ ...head, width: 40 }}>
              #
            </TableCell>
            {HEADERS.map((h) => (
              <TableCell key={h.label} sx={{ ...head, minWidth: h.minWidth }}>
                {h.label}
              </TableCell>
            ))}
            <TableCell sx={{ ...head, width: 48, borderRight: 0 }} />
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <ScanPar01Row
              key={row.id}
              index={index}
              row={row}
              animal={order.animalOf(row.caravana_madre)}
              hasOrder={order.order !== null}
              errors={problems.byRowId[row.id] ?? []}
              males={males}
              breeds={breeds}
              onChange={(field, value) => onRowChange(row.id, field, value)}
              onDelete={() => onDeleteRow(row.id)}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ScanPar01Table;
