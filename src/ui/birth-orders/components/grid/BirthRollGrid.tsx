import React, { useMemo, useState } from 'react';
import { Alert, Button, Chip, Stack, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import SheetGrid, { type SheetGridHeight } from '@/components/sheet-grid/SheetGrid';
import { useCompany } from '@/contexts/CompanyContext';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import { useBreeds } from '@/features/breeds/hooks/useBreeds';
import BirthRollGridBody from './BirthRollGridBody';
import type { BirthCellError, BirthRollFemale } from './birthRollTypes';
import type { BirthRollState } from './useBirthRollState';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';

interface BirthRollGridProps {
  females: BirthRollFemale[];
  state: BirthRollState;
  errors: Record<number, BirthCellError[]>;
  maxHeight?: SheetGridHeight;
  /** An order offers "No parió en fecha" (N); a registration, which leaves nothing open, does not. */
  allowOverdue?: boolean;
  /** The screen asks the round date itself, next to the order data: the grid does not repeat it. */
  externalRoundDate?: boolean;
  /** Several batches on one sheet: the rows are grouped by the female's current batch. */
  grouped?: boolean;
}

const today = (): string => new Date().toISOString().slice(0, 10);

const COLUMNS: { label: string; minWidth: number }[] = [
  { label: 'Resultado', minWidth: 190 },
  { label: 'Caravana cría (opcional)', minWidth: 160 },
  { label: 'Sexo', minWidth: 100 },
  { label: 'Peso (kg)', minWidth: 90 },
  { label: 'Raza', minWidth: 140 },
  { label: 'Pelaje', minWidth: 140 },
  { label: 'Dientes', minWidth: 70 },
  { label: 'Padre (opcional)', minWidth: 190 },
  { label: 'Fecha', minWidth: 140 },
  { label: 'Observaciones', minWidth: 180 }
];

/**
 * The calving grid: one row per pregnant female and what the round found. Shared by "Registrar
 * partos" and "Ejecutar orden", so both ask the same thing the same way. The sire is optional and
 * never printed on paper; the teeth start at 0.
 */
export const BirthRollGrid: React.FC<BirthRollGridProps> = ({
  females,
  state,
  errors,
  maxHeight = 'calc(100vh - 360px)',
  allowOverdue = false,
  externalRoundDate = false,
  grouped = false
}) => {
  const { headSx: head } = useGridCellStyles();
  const { activeCompanyId } = useCompany();
  const { data: caravans = [] } = useCaravans(activeCompanyId);
  const { data: breeds = [] } = useBreeds();
  const [roundDate, setRoundDate] = useState(today());

  const males = useMemo(
    () => caravans.filter((c) => c.sex === 'M' && c.isTagged()).map((c) => ({ id: c.id, identification: c.identification })),
    [caravans]
  );
  const breedOptions = useMemo(() => breeds.map((b) => ({ id: Number(b.id), name: b.name, colors: b.colors ?? [] })), [breeds]);
  const missingDates = state.resolved.filter((f) => !state.valueOf(f.caravanId).birthDate).length;

  return (
    <Stack spacing={1.5}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ md: 'center' }} justifyContent="space-between">
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip size="small" color="success" variant="outlined" label={`${state.counts.LIVE} parto(s)`} sx={{ fontWeight: 700 }} />
          <Chip size="small" color="error" variant="outlined" label={`${state.counts.STILLBORN} nació(eron) muerto(s)`} sx={{ fontWeight: 700 }} />
          <Chip size="small" color="warning" variant="outlined" label={`${state.counts.PERINATAL_DEATH} murió(eron) al pie`} sx={{ fontWeight: 700 }} />
          {allowOverdue && (
            <Chip size="small" color="warning" variant="outlined" label={`${state.counts.OVERDUE} parto(s) vencido(s)`} sx={{ fontWeight: 700 }} />
          )}
          <Chip size="small" variant="outlined" label={`${state.unresolved} sin parir aún`} sx={{ fontWeight: 700 }} />
        </Stack>
        {!externalRoundDate && (
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              size="small"
              type="date"
              label="Fecha de la recorrida"
              value={roundDate}
              onChange={(e) => setRoundDate(e.target.value)}
              inputProps={{ max: today() }}
              InputLabelProps={{ shrink: true }}
            />
            <Button
              size="small"
              variant="outlined"
              disabled={missingDates === 0 || !roundDate}
              onClick={() => state.fillMissingDates(roundDate)}
              sx={{ textTransform: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}
            >
              Usarla en {missingDates} fila(s) sin fecha
            </Button>
          </Stack>
        )}
      </Stack>

      <SheetGrid minWidth={1540} maxHeight={maxHeight}>
        <TableHead>
          <TableRow>
            <TableCell align="center" sx={{ ...head, width: 40 }}>
              #
            </TableCell>
            <TableCell sx={{ ...head, minWidth: 220 }}>Vientre</TableCell>
            {COLUMNS.map((column) => (
              <TableCell key={column.label} sx={{ ...head, minWidth: column.minWidth }}>
                {column.label}
              </TableCell>
            ))}
            <TableCell sx={{ ...head, width: 48, borderRight: 0 }} />
          </TableRow>
        </TableHead>
        <BirthRollGridBody
          females={females}
          state={state}
          errors={errors}
          breeds={breedOptions}
          males={males}
          allowOverdue={allowOverdue}
          grouped={grouped}
          columnCount={COLUMNS.length + 3}
        />
      </SheetGrid>

      <Typography variant="caption" color="text.secondary">
        Nació muerto (NM): el ternero nació sin vida, se imputa a la madre. Murió al pie (M): nació vivo y murió poco después, se
        imputa al ternero. El aborto se registra en Monitoreo Gestacional. Padre opcional: si lo dejás vacío se usa el padre confirmado
        en el tacto; si no hay uno confirmado, la cría queda en Paternidad pendiente. La cría nace en el lote de su madre.
      </Typography>

      {state.problems.length > 0 && (
        <Alert severity="info" sx={{ borderRadius: '6px' }}>
          {state.problems.slice(0, 6).join(' ')}
          {state.problems.length > 6 ? ` Y ${state.problems.length - 6} más.` : ''}
        </Alert>
      )}
    </Stack>
  );
};

export default BirthRollGrid;
