import React from 'react';
import { Box, Chip, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, alpha } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { BirthOrderAnimal } from '@/features/birth-orders/types';
import BirthOrderLineRow from './BirthOrderLineRow';
import { useGroupedOrderStyles } from './useGroupedOrderStyles';

interface BirthOrderBatchSectionProps {
  name: string;
  animals: BirthOrderAnimal[];
  onOpen: () => void;
}

const COLUMNS: { label: string; minWidth: number }[] = [
  { label: 'Vientre', minWidth: 160 },
  { label: 'FPP / Estadio', minWidth: 150 },
  { label: 'Estado', minWidth: 130 },
  { label: 'Resultado', minWidth: 200 },
  { label: 'Sexo cría', minWidth: 100 },
  { label: 'Lote cría', minWidth: 150 },
  { label: 'Fecha', minWidth: 100 }
];

/** The females of one order that come from one batch: the batch band and their roll. */
export const BirthOrderBatchSection: React.FC<BirthOrderBatchSectionProps> = ({ name, animals, onOpen }) => {
  const { isDark, active, headerCell } = useGroupedOrderStyles();
  const born = animals.filter((animal) => animal.status === 'BORN').length;
  const open = animals.filter((animal) => animal.status === 'PENDING' || animal.status === 'OVERDUE').length;

  return (
    <Box sx={{ '& + &': { borderTop: '2px solid', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb' } }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent="space-between"
        spacing={1}
        sx={{
          px: 2.5,
          py: 1.25,
          borderLeft: '4px solid',
          borderLeftColor: open > 0 ? 'primary.main' : alpha(active, 0.35),
          bgcolor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#eef2f7'
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 26,
              height: 26,
              borderRadius: '6px',
              bgcolor: alpha(active, 0.12),
              color: active,
              flexShrink: 0
            }}
          >
            <FuseSvgIcon size={15}>heroicons-outline:rectangle-stack</FuseSvgIcon>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
              {name}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              {born} parieron &bull; {open} pendientes
            </Typography>
          </Box>
        </Stack>
        <Chip
          size="small"
          variant="outlined"
          label={`${animals.length} vientres`}
          sx={{ fontSize: '0.72rem', height: 22, fontWeight: 600, bgcolor: 'background.paper' }}
        />
      </Stack>

      <TableContainer>
        <Table stickyHeader size="small" sx={{ borderCollapse: 'collapse' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...headerCell, width: 44, textAlign: 'center' }}>#</TableCell>
              {COLUMNS.map((column, index) => (
                <TableCell
                  key={column.label}
                  sx={{ ...headerCell, minWidth: column.minWidth, ...(index === COLUMNS.length - 1 ? { borderRight: 0 } : {}) }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {animals.map((animal, index) => (
              <BirthOrderLineRow key={animal.id} animal={animal} position={index + 1} isZebra={index % 2 === 1} onOpen={onOpen} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default BirthOrderBatchSection;
