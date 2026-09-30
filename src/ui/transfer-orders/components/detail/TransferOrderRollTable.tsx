import React, { useMemo, useState } from 'react';
import { Box, Button, Table, TableBody, TableCell, TableHead, TableRow, Typography, alpha } from '@mui/material';
import type { TransferOrder, TransferOrderAnimalStatus } from '@/features/transfer-orders/types';
import { formatDate, formatDateTime, useTransferOrderTableStyles } from '../transferOrderFormat';

const STATUS: Record<TransferOrderAnimalStatus, { label: string; color: string }> = {
  PENDING: { label: 'Pendiente', color: '#e6600d' },
  MOVED: { label: 'Movida', color: '#107e3e' },
  SKIPPED: { label: 'No viajó', color: '#64748b' }
};

const COLLAPSED_ROWS = 12;

/** The roll: every animal the order committed, where it was sent and whether it went. */
export const TransferOrderRollTable: React.FC<{ order: TransferOrder }> = ({ order }) => {
  const { headerCell, bodyCell, headBg, border } = useTransferOrderTableStyles();
  const [expanded, setExpanded] = useState(false);
  const labelByKey = useMemo(() => new Map(order.destinations.map((d) => [d.key, d.label])), [order.destinations]);

  // Pending first: that is who somebody still has to bring to the chute.
  const rows = useMemo(
    () =>
      [...order.animals].sort(
        (a, b) =>
          Number(b.status === 'PENDING') - Number(a.status === 'PENDING') ||
          (a.identification ?? '').localeCompare(b.identification ?? '')
      ),
    [order.animals]
  );
  const shown = expanded ? rows : rows.slice(0, COLLAPSED_ROWS);

  return (
    <Box>
      <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary' }}>
        Padrón ({order.animals.length})
      </Typography>
      <Box sx={{ border: '1px solid', borderColor: border, borderRadius: '8px', overflow: 'hidden', mt: 0.5 }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: headBg }}>
            <TableRow>
              <TableCell sx={headerCell}>Caravana</TableCell>
              <TableCell sx={headerCell}>Destino</TableCell>
              <TableCell sx={headerCell}>Estado</TableCell>
              <TableCell sx={{ ...headerCell, borderRight: 0 }}>Movida</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {shown.map((animal) => {
              const status = STATUS[animal.status];

              return (
                <TableRow key={animal.id}>
                  <TableCell sx={{ ...bodyCell, fontFamily: 'monospace', fontWeight: 700 }}>
                    {animal.identification ?? `#${animal.caravan_id}`}
                    {animal.sex && (
                      <Typography component="span" variant="caption" color="text.secondary">
                        {' '}· {animal.sex}
                        {animal.category_name ? ` · ${animal.category_name}` : ''}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={bodyCell}>
                    {animal.destination_key ? (
                      labelByKey.get(animal.destination_key) ?? animal.destination_key
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        En la manga
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={bodyCell}>
                    <Box
                      component="span"
                      sx={{
                        px: 0.75,
                        py: 0.25,
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: status.color,
                        bgcolor: alpha(status.color, 0.1)
                      }}
                    >
                      {status.label}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ ...bodyCell, borderRight: 0, whiteSpace: 'nowrap' }}>
                    {/* A registered order was loaded after the fact: the day the animal moved is the
                        declared date, not the moment it was loaded. */}
                    {!animal.moved_at
                      ? '—'
                      : order.kind === 'REGISTERED'
                        ? formatDate(order.movement_date)
                        : formatDateTime(animal.moved_at)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
      {rows.length > COLLAPSED_ROWS && (
        <Button size="small" onClick={() => setExpanded((prev) => !prev)} sx={{ mt: 0.5, textTransform: 'none', fontWeight: 700 }}>
          {expanded ? 'Mostrar menos' : `Ver los ${rows.length} animales`}
        </Button>
      )}
    </Box>
  );
};

export default TransferOrderRollTable;
