import React, { useMemo, useState } from 'react';
import { Alert, Button, Chip, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, alpha } from '@mui/material';
import { useCompany } from '@/contexts/CompanyContext';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import { useBreeds } from '@/features/breeds/hooks/useBreeds';
import BirthRollGridRow from './BirthRollGridRow';
import type { BirthCellError, BirthRollFemale } from './birthRollTypes';
import type { BirthRollState } from './useBirthRollState';
import { useGridCellStyles } from './useGridCellStyles';

interface BirthRollGridProps {
  females: BirthRollFemale[];
  state: BirthRollState;
  errors: Record<number, BirthCellError[]>;
  /** Only a registration removes rows: an order keeps its females pending. */
  onRemove?: (caravanId: number) => void;
  maxHeight?: string | number;
  /** An order offers "No parió en fecha" (N); a registration, which leaves nothing open, does not. */
  allowOverdue?: boolean;
}

const today = (): string => new Date().toISOString().slice(0, 10);

const COLUMNS: { label: string; minWidth: number }[] = [
  { label: 'Resultado', minWidth: 190 },
  { label: 'Caravana cría', minWidth: 140 },
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
export const BirthRollGrid: React.FC<BirthRollGridProps> = ({ females, state, errors, onRemove, maxHeight = 'calc(100vh - 360px)', allowOverdue = false }) => {
  const { theme, cellSx, headerBg } = useGridCellStyles();
  const { activeCompanyId } = useCompany();
  const { data: caravans = [] } = useCaravans(activeCompanyId);
  const { data: breeds = [] } = useBreeds();
  const [roundDate, setRoundDate] = useState(today());

  const males = useMemo(
    () => caravans.filter((c) => c.sex === 'M').map((c) => ({ id: c.id, identification: c.identification })),
    [caravans]
  );
  const breedOptions = useMemo(() => breeds.map((b) => ({ id: Number(b.id), name: b.name, colors: b.colors ?? [] })), [breeds]);
  const missingDates = state.resolved.filter((f) => !state.valueOf(f.caravanId).birthDate).length;
  const head = { ...cellSx, bgcolor: headerBg, fontWeight: 700, px: 1.5, py: 1.25, color: theme.palette.text.primary, fontSize: '0.8rem' };

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
      </Stack>

      <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: '4px', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight }}>
          <Table stickyHeader size="small" sx={{ borderCollapse: 'collapse', minWidth: 1540 }}>
            <TableHead>
              <TableRow>
                <TableCell colSpan={2} align="center" sx={{ ...head, fontWeight: 800, color: 'text.secondary', borderBottom: '2px solid', borderColor: 'divider' }}>
                  VIENTRE
                </TableCell>
                <TableCell
                  colSpan={COLUMNS.length}
                  align="center"
                  sx={{ ...head, fontWeight: 800, color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.05), borderBottom: '2px solid', borderColor: 'primary.main' }}
                >
                  PARTO Y CRÍA
                </TableCell>
                <TableCell sx={{ ...head, borderRight: 0 }} />
              </TableRow>
              <TableRow>
                <TableCell align="center" sx={{ ...head, width: 40, color: 'text.secondary' }}>
                  #
                </TableCell>
                <TableCell sx={{ ...head, minWidth: 220 }}>Madre · FPP</TableCell>
                {COLUMNS.map((column) => (
                  <TableCell key={column.label} sx={{ ...head, minWidth: column.minWidth }}>
                    {column.label}
                  </TableCell>
                ))}
                <TableCell sx={{ ...head, width: 48, borderRight: 0 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {females.map((female, index) => (
                <BirthRollGridRow
                  key={female.caravanId}
                  index={index}
                  female={female}
                  value={state.valueOf(female.caravanId)}
                  errors={errors[female.caravanId] ?? []}
                  breeds={breedOptions}
                  males={males}
                  onChange={(change) => state.patch(female.caravanId, change)}
                  onRemove={onRemove ? () => onRemove(female.caravanId) : undefined}
                  allowOverdue={allowOverdue}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Typography variant="caption" color="text.secondary">
        Nació muerto (NM): el ternero nació sin vida, se imputa a la madre. Murió al pie (M): nació vivo y murió poco después, se
        imputa al ternero. El aborto se registra en Monitoreo Gestacional. Padre opcional: si lo dejás vacío se usa el toro único o
        confirmado del servicio; con más de un candidato, la cría queda en Sires pendientes. La cría nace en el lote de su madre.
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
