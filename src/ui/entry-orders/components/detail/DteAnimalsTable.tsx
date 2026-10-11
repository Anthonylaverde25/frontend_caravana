import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import type { EntryOrder, EntryOrderDte } from '@/features/entry-orders/types';
import { RECEPTION_METHOD_LABELS, formatDate } from '../entryOrderFormat';

interface DteAnimalsTableProps {
  order: EntryOrder;
  dte: EntryOrderDte;
}

/**
 * The caravans received on a DTE, with the batch each one is in today: where it entered (its
 * destination or the transit batch), or wherever it was moved since. Without a transit batch that
 * holds them all, this is where the troop of a purchase is seen together.
 */
export const DteAnimalsTable: React.FC<DteAnimalsTableProps> = ({ order, dte }) => (
  <Table size="small">
    <TableHead>
      <TableRow>
        <TableCell sx={{ fontWeight: 700 }}>Caravana</TableCell>
        <TableCell sx={{ fontWeight: 700 }}>Sexo</TableCell>
        <TableCell sx={{ fontWeight: 700 }}>Categoría</TableCell>
        <TableCell sx={{ fontWeight: 700 }}>Raza</TableCell>
        <TableCell sx={{ fontWeight: 700 }}>Recibida</TableCell>
        <TableCell sx={{ fontWeight: 700 }}>Lote actual</TableCell>
        <TableCell
          sx={{ fontWeight: 700 }}
          align="right"
        >
          Peso
        </TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {(dte.animals ?? []).map((animal) => (
        <TableRow key={animal.id}>
          <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>{animal.identification}</TableCell>
          <TableCell>{animal.sex === 'M' ? 'Macho' : 'Hembra'}</TableCell>
          <TableCell>
            {order.categories.find((c) => c.position === animal.category_position)?.name ?? 'Sin declarar'}
          </TableCell>
          <TableCell>
            {animal.breed_position != null
              ? `${animal.breed_letter} · ${order.breeds.find((b) => b.position === animal.breed_position)?.label ?? ''}`
              : 'Sin declarar'}
          </TableCell>
          <TableCell>
            {formatDate(animal.received_at)}
            {animal.reception_method ? ` · ${RECEPTION_METHOD_LABELS[animal.reception_method]}` : ''}
          </TableCell>
          <TableCell>{animal.current_batch?.name ?? '—'}</TableCell>
          <TableCell align="right">
            {animal.entry_weight != null ? `${animal.entry_weight} kg` : '—'}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export default DteAnimalsTable;
