import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';

interface WeaningBatchCalvesListProps {
  calves: Caravan[];
  onNavigateToCaravans: () => void;
}

export const WeaningBatchCalvesList: React.FC<WeaningBatchCalvesListProps> = ({
  calves,
  onNavigateToCaravans,
}) => {
  return (
    <Box sx={{ mt: 2.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            color: 'text.secondary',
            fontSize: '0.72rem',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          Terneros Asignados ({calves.length})
        </Typography>
        {calves.length > 5 && (
          <Button
            size="small"
            onClick={onNavigateToCaravans}
            endIcon={<FuseSvgIcon size={14}>heroicons-outline:arrow-right</FuseSvgIcon>}
            sx={{ fontSize: '0.72rem', textTransform: 'none', fontWeight: 600, p: 0.5 }}
          >
            Ver todos ({calves.length})
          </Button>
        )}
      </Box>

      {calves.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            textAlign: 'center',
            borderRadius: '6px',
            bgcolor: 'action.hover',
            borderColor: 'divider',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Este lote aún no tiene terneros asignados.
          </Typography>
        </Paper>
      ) : (
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ borderRadius: '6px', maxHeight: 320, overflowY: 'auto' }}
        >
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', py: 1 }}>Caravana</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', py: 1, textAlign: 'center' }}>Sexo</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', py: 1 }}>Categoría</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', py: 1, textAlign: 'right' }}>Peso</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {calves.slice(0, 15).map((calf) => {
                const isMale = calf.sex === 'M' || (calf.sex as string) === 'MACHO';
                return (
                  <TableRow key={calf.id} hover>
                    <TableCell sx={{ py: 1, fontSize: '0.78rem', fontWeight: 700 }}>
                      {calf.identification || `ID #${calf.id}`}
                    </TableCell>
                    <TableCell sx={{ py: 1, textAlign: 'center' }}>
                      <Chip
                        label={isMale ? '♂ M' : '♀ H'}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          borderRadius: '3px',
                          bgcolor: isMale ? 'rgba(96, 165, 250, 0.14)' : 'rgba(236, 72, 153, 0.14)',
                          color: isMale ? '#2563eb' : '#db2777',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 1, fontSize: '0.72rem', color: 'text.secondary' }}>
                      {calf.category_name || (isMale ? 'Ternero' : 'Ternera')}
                    </TableCell>
                    <TableCell sx={{ py: 1, textAlign: 'right', fontSize: '0.78rem', fontWeight: 600 }}>
                      {calf.current_weight != null && calf.current_weight > 0
                        ? `${calf.current_weight} kg`
                        : '-'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default WeaningBatchCalvesList;
