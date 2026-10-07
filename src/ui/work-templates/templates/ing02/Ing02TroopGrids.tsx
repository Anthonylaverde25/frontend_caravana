import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import type { EntryOrder } from '@/features/entry-orders/types';
import { ING02_CATEGORY_LINES } from '@/ui/work-templates/components/scan/ing02/ing02ScanToForm';
import { boxes } from './Ing02PageHeader';
import { GridTitle, gridSx, headRowSx, valueCellSx } from './ing02SheetParts';

const sexWord = (order: EntryOrder | null): string | null =>
  order?.sex_composition ? { MALE: 'MACHOS', FEMALE: 'HEMBRAS', MIXED: 'AMBOS' }[order.sex_composition] : null;

/**
 * What was bought, in two grids: one line per category with its head (numbered 1, 2…, the number
 * a received caravan refers to when its sex admits several categories), and the troop as a whole —
 * sexes, age and state. Printed from an order it has as many category lines as the order; blank,
 * it leaves ING02_CATEGORY_LINES to write.
 */
export const Ing02TroopGrids: React.FC<{ order: EntryOrder | null }> = ({ order }) => {
  const lines = order
    ? order.categories.map((c) => ({ position: c.position, name: c.name ?? '', head: c.head_count ?? '—' }))
    : Array.from({ length: ING02_CATEGORY_LINES }, (_, i) => ({ position: i + 1, name: '', head: '' }));

  return (
    <>
      <Table sx={gridSx}>
        <TableHead>
          <GridTitle colSpan={3}>Tropa comprada · categorías</GridTitle>
          <TableRow sx={headRowSx}>
            <TableCell sx={{ width: '8%', textAlign: 'center' }}>N°</TableCell>
            <TableCell sx={{ width: '62%' }}>Categoría</TableCell>
            <TableCell>Cabezas</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {lines.map((line) => (
            <TableRow key={line.position}>
              <TableCell sx={{ textAlign: 'center', fontWeight: 800, fontFamily: 'monospace' }}>{line.position}</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>{line.name}</TableCell>
              <TableCell sx={valueCellSx}>{line.head}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Table sx={gridSx}>
        <TableHead>
          <GridTitle colSpan={5}>Sexo, edad y estado</GridTitle>
          <TableRow sx={headRowSx}>
            <TableCell sx={{ width: '26%' }}>Sexo (marcar)</TableCell>
            <TableCell sx={{ width: '9%' }}>Machos</TableCell>
            <TableCell sx={{ width: '9%' }}>Hembras</TableCell>
            <TableCell sx={{ width: '10%' }}>Edad (m)</TableCell>
            <TableCell>Estado (marcar)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell sx={valueCellSx}>{boxes(['MACHOS', 'HEMBRAS', 'AMBOS'], sexWord(order))}</TableCell>
            <TableCell sx={valueCellSx}>{order?.sex_composition === 'MIXED' ? order.male_count : ''}</TableCell>
            <TableCell sx={valueCellSx}>{order?.sex_composition === 'MIXED' ? order.female_count : ''}</TableCell>
            <TableCell sx={valueCellSx}>{order ? (order.age_range ?? '—') : '__ / __'}</TableCell>
            <TableCell sx={{ ...valueCellSx, fontSize: '0.6rem !important', whiteSpace: 'nowrap' }}>
              {boxes(['REGULAR', 'BUENO', 'MUY BUENO', 'EXCELENTE'], order?.condition_label ? order.condition_label.toUpperCase() : null)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </>
  );
};

export default Ing02TroopGrids;
