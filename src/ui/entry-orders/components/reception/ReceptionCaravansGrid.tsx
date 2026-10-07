import React from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import ReceptionRowCells from './ReceptionRowCells';
import type { ReceptionRows, ReceptionTroopContext } from './useReceptionRows';

interface ReceptionCaravansGridProps {
  draft: ReceptionRows;
  troop: ReceptionTroopContext;
}

const headSx = { py: 0.75, px: 1, fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.3px' } as const;

/**
 * One row per animal that arrived, its caravan typed cell by cell or pasted: a list pasted into a
 * cell spreads over as many rows. The last row is always blank, ready for the next caravan. Sex,
 * category and breed columns only exist when the order needs them per caravan (a troop of both
 * sexes, a sex that admits several categories, several breeds), named in words — never by the
 * letter or number of the paper. Weight, body condition and what the animal came off the truck
 * with are optional.
 */
export const ReceptionCaravansGrid: React.FC<ReceptionCaravansGridProps> = ({ draft, troop }) => (
  <TableContainer sx={{ maxHeight: 360, border: 1, borderColor: 'divider', borderRadius: '6px' }}>
    <Table stickyHeader size="small">
      <TableHead>
        <TableRow>
          <TableCell sx={{ ...headSx, width: 40 }}>#</TableCell>
          <TableCell sx={{ ...headSx, minWidth: 130 }}>Caravana</TableCell>
          {troop.isMixed && <TableCell sx={{ ...headSx, width: 96 }}>Sexo</TableCell>}
          {troop.needsCategory && <TableCell sx={{ ...headSx, width: 40 + troop.categories.reduce((sum, c) => sum + 16 + (c.name ?? '').length * 7, 0) }}>Categoría</TableCell>}
          {troop.breeds.length > 1 && <TableCell sx={{ ...headSx, width: 160 }}>Raza / pelaje</TableCell>}
          <TableCell sx={{ ...headSx, width: 80 }}>Peso (kg)</TableCell>
          <TableCell sx={{ ...headSx, width: 60 }}>EC</TableCell>
          <TableCell sx={{ ...headSx, width: 150 }}>Lesión al arribo</TableCell>
          <TableCell sx={{ ...headSx, width: 40 }} />
        </TableRow>
      </TableHead>
      <TableBody>
        {draft.rows.map((row, index) => (
          <ReceptionRowCells key={row.key} row={row} index={index} isNew={index === draft.rows.length - 1 && row.caravana === ''} draft={draft} troop={troop} />
        ))}
      </TableBody>
    </Table>
    <Box sx={{ px: 1.5, py: 0.75, borderTop: 1, borderColor: 'divider', bgcolor: 'background.default' }}>
      <Typography variant="caption" color="text.secondary">
        Enter pasa a la fila siguiente. Pegar una lista de caravanas en una celda la reparte en filas. EC: estado corporal de 1 a 5, de 0,5 en 0,5. Lesión al
        arribo: marcá ojo, oreja o aplomo (renguera o golpe en patas) si el animal bajó afectado
        {troop.isMixed ? '. Para el sexo, escribí o pegá la caravana seguida de M o H ("0331 H")' : ''}.
      </Typography>
    </Box>
  </TableContainer>
);

export default ReceptionCaravansGrid;
