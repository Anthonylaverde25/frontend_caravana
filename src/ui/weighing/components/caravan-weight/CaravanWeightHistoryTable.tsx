import {
  Box,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  CaravanWeightRecord,
  SHRUNK_CONDITION_LABELS,
  WEIGHING_METHOD_LABELS,
} from '@/core/weighing/domain/entities/Weighing';

interface CaravanWeightHistoryTableProps {
  weights: CaravanWeightRecord[];
  isLoading: boolean;
}

const formatDate = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
};

function basisOf(w: CaravanWeightRecord): string {
  const shrink =
    w.shrunk_condition === 'CALCULATED' && w.shrink_pct !== null
      ? `${SHRUNK_CONDITION_LABELS.CALCULATED} ${w.shrink_pct}%`
      : SHRUNK_CONDITION_LABELS[w.shrunk_condition];

  return `${WEIGHING_METHOD_LABELS[w.method]} · ${shrink}`;
}

/** The weight history of one animal, newest first, each weight with its purpose and basis. */
export function CaravanWeightHistoryTable({ weights, isLoading }: CaravanWeightHistoryTableProps) {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (weights.length === 0) {
    return (
      <Typography variant="body2" sx={{ py: 4, textAlign: 'center', color: 'text.secondary', fontStyle: 'italic' }}>
        No hay pesajes registrados para este animal.
      </Typography>
    );
  }

  return (
    <TableContainer sx={{ maxHeight: 280 }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
            <TableCell sx={{ fontWeight: 700 }} align="right">
              Peso
            </TableCell>
            <TableCell sx={{ fontWeight: 700 }} align="center">
              Estado
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {weights.map((w) => (
            <TableRow key={w.id} hover>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                {formatDate(w.weighing_date)}
                {w.weighing_time && (
                  <Typography component="span" variant="caption" sx={{ color: 'text.secondary', ml: 0.5 }}>
                    {w.weighing_time}
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {w.weighing_type_name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {basisOf(w)}
                  {!w.affects_adpv && ' · fuera de la curva de ganancia'}
                </Typography>
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                <Tooltip title={w.notes ?? ''} disableHoverListener={!w.notes}>
                  <span>{w.weight.toLocaleString('es-AR')} kg</span>
                </Tooltip>
              </TableCell>
              <TableCell align="center">
                {w.current ? (
                  <Chip label="Vigente" size="small" color="success" variant="outlined" />
                ) : (
                  <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                    Histórico
                  </Typography>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
