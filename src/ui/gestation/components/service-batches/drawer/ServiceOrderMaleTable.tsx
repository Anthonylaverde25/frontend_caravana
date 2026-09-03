import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';

interface ServiceOrderMaleTableProps {
  maleCaravans: Caravan[];
}

export const ServiceOrderMaleTable: React.FC<ServiceOrderMaleTableProps> = ({
  maleCaravans,
}) => {
  return (
    <>
      <Box
        sx={{
          mb: 1.5,
          pl: 1,
          borderLeft: (theme) => `3px solid ${theme.palette.primary.main}`,
        }}
      >
        <Typography
          variant="overline"
          sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 1 }}
        >
          Reproductores Machos (♂) ({maleCaravans.length})
        </Typography>
      </Box>

      <Paper
        variant="outlined"
        sx={{
          p: 1.5,
          mb: 3,
          borderRadius: '8px',
          backgroundColor: (theme) => theme.palette.background.paper,
        }}
      >
        {maleCaravans.length === 0 ? (
          <Typography variant="caption" color="text.secondary" sx={{ p: 1, display: 'block' }}>
            No hay machos asignados actualmente a este lote.
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: '0.7rem', fontWeight: 700, py: 1 }}>Caravana</TableCell>
                  <TableCell sx={{ fontSize: '0.7rem', fontWeight: 700, py: 1 }}>Categoría / Raza</TableCell>
                  <TableCell sx={{ fontSize: '0.7rem', fontWeight: 700, py: 1, textAlign: 'center' }}>Dientes</TableCell>
                  <TableCell sx={{ fontSize: '0.7rem', fontWeight: 700, py: 1, textAlign: 'right' }}>Peso</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {maleCaravans.map((male) => (
                  <TableRow key={male.id} hover>
                    <TableCell sx={{ py: 1 }}>
                      <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.82rem', color: 'primary.main' }}>
                        #{male.identification}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.78rem' }}>
                        {male.category_name || male.category || 'Toro'} {male.breed ? `• ${male.breed}` : ''}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1, textAlign: 'center' }}>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary' }}>
                        {male.teeth ? `${male.teeth}D` : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1, textAlign: 'right' }}>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.78rem' }}>
                        {male.current_weight ? `${male.current_weight} kg` : '—'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </>
  );
};

export default ServiceOrderMaleTable;
