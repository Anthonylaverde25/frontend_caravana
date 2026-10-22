import React from 'react';
import { Box, Chip, TableCell, TableRow, Typography, alpha } from '@mui/material';
import type { BirthOrderAnimal } from '@/features/birth-orders/types';
import { BIRTH_LINE_STATUS, birthLineResult } from '../detail/BirthOrderRollTable';
import { dueLabel, formatDate, stageLabel } from '../birthOrderFormat';
import { useGroupedOrderStyles } from './useGroupedOrderStyles';

interface BirthOrderLineRowProps {
  animal: BirthOrderAnimal;
  position: number;
  isZebra: boolean;
  onOpen: () => void;
}

/** One female of the order: when she was due, where the line stands and the calf it left. */
export const BirthOrderLineRow: React.FC<BirthOrderLineRowProps> = ({ animal, position, isZebra, onOpen }) => {
  const { bodyCell, captionText, zebraBg } = useGroupedOrderStyles();
  const status = BIRTH_LINE_STATUS[animal.status];
  const hasCalf = animal.calf_caravan_id != null;
  const rowBg = animal.status === 'OVERDUE' ? alpha(status.color, 0.07) : isZebra ? zebraBg : 'inherit';

  return (
    <TableRow hover onClick={onOpen} sx={{ cursor: 'pointer', bgcolor: rowBg, transition: 'background-color 0.15s ease' }}>
      <TableCell sx={{ ...bodyCell, textAlign: 'center', color: 'text.secondary', fontSize: '0.75rem', fontWeight: 600 }}>{position}</TableCell>
      <TableCell sx={bodyCell}>
        <Typography sx={{ fontFamily: 'monospace', fontWeight: 800, color: 'primary.main', fontSize: '0.85rem', lineHeight: 1.1 }}>
          #{animal.identification ?? animal.caravan_id}
        </Typography>
        <Typography variant="caption" sx={captionText}>
          {animal.category_label ?? ''}
          {animal.unplanned ? ' · fuera de la orden' : ''}
        </Typography>
      </TableCell>
      <TableCell sx={{ ...bodyCell, fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
        {dueLabel(animal.estimated_due_date)}
        <Typography variant="caption" sx={captionText}>
          {stageLabel(animal.gestation_stage)}
        </Typography>
      </TableCell>
      <TableCell sx={bodyCell}>
        <Box
          component="span"
          sx={{ px: 0.75, py: 0.25, borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, color: status.color, bgcolor: alpha(status.color, 0.1), whiteSpace: 'nowrap' }}
        >
          {status.label}
        </Box>
      </TableCell>
      <TableCell sx={{ ...bodyCell, fontSize: '0.78rem', maxWidth: 260 }}>{birthLineResult(animal)}</TableCell>
      <TableCell sx={bodyCell}>
        {hasCalf && animal.calf_sex ? (
          <Chip
            size="small"
            label={animal.calf_sex === 'M' ? 'Macho' : 'Hembra'}
            color={animal.calf_sex === 'M' ? 'info' : 'secondary'}
            variant="outlined"
            sx={{ fontWeight: 700, fontSize: '0.68rem', height: 22 }}
          />
        ) : (
          '-'
        )}
      </TableCell>
      <TableCell sx={{ ...bodyCell, fontSize: '0.78rem' }}>{hasCalf ? (animal.calf_batch_name ?? '-') : '-'}</TableCell>
      <TableCell sx={{ ...bodyCell, fontSize: '0.78rem', borderRight: 0, whiteSpace: 'nowrap' }}>
        {animal.event_date ? formatDate(animal.event_date) : '-'}
      </TableCell>
    </TableRow>
  );
};

export default BirthOrderLineRow;
