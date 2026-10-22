import React, { useMemo, useState } from 'react';
import { Box, Button, Stack, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography, alpha } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { WeaningOrder, WeaningOrderAnimalStatus } from '@/features/weaning-orders/types';
import { formatDate, formatDateTime, useWeaningOrderTableStyles } from '../weaningOrderFormat';

const STATUS: Record<WeaningOrderAnimalStatus, { label: string; color: string }> = {
  PENDING: { label: 'Pendiente', color: '#e6600d' },
  WEANED: { label: 'Destetada', color: '#107e3e' },
  SKIPPED: { label: 'No se destetó', color: '#64748b' }
};

const COLLAPSED_ROWS = 12;

/**
 * The roll: every calf the order committed, its mother and rodeo, where it goes and whether it went.
 * A calf weaned off the plan — elsewhere, or with another type — says what was planned.
 */
export const WeaningOrderRollTable: React.FC<{ order: WeaningOrder }> = ({ order }) => {
  const { headerCell, bodyCell, headBg, border } = useWeaningOrderTableStyles();
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
        Crías ({order.animals.length})
      </Typography>
      <Box sx={{ border: '1px solid', borderColor: border, borderRadius: '8px', overflow: 'hidden', mt: 0.5 }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: headBg }}>
            <TableRow>
              <TableCell sx={headerCell}>Cría</TableCell>
              <TableCell sx={headerCell}>Rodeo</TableCell>
              <TableCell sx={headerCell}>Lote de destete</TableCell>
              <TableCell sx={headerCell}>C/S nueva</TableCell>
              <TableCell sx={headerCell}>Estado</TableCell>
              <TableCell sx={{ ...headerCell, borderRight: 0 }}>Destetada</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {shown.map((animal) => {
              const status = STATUS[animal.status];

              return (
                <TableRow key={animal.id}>
                  <TableCell sx={{ ...bodyCell, fontFamily: 'monospace', fontWeight: 700 }}>
                    {animal.identification ?? `#${animal.caravan_id}`}
                    <Typography component="span" variant="caption" color="text.secondary">
                      {' '}
                      · {animal.sex ?? '—'}
                      {animal.mother_identification ? ` · madre ${animal.mother_identification}` : ''}
                    </Typography>
                  </TableCell>
                  <TableCell sx={bodyCell}>{animal.source_batch_name ?? 'Sin lote'}</TableCell>
                  <TableCell sx={bodyCell}>
                    {animal.is_redirected ? (
                      <Stack direction="row" spacing={0.75} alignItems="flex-start">
                        <Tooltip title="Se destetó con otro destino que el planificado">
                          <Box component="span" sx={{ color: 'warning.main', display: 'inline-flex', mt: 0.25 }}>
                            <FuseSvgIcon size={16}>heroicons-outline:exclamation-triangle</FuseSvgIcon>
                          </Box>
                        </Tooltip>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {labelByKey.get(animal.destination_key ?? '') ?? animal.destination_key}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Planificado: {animal.planned_destination_label ?? animal.planned_destination_key}
                          </Typography>
                        </Box>
                      </Stack>
                    ) : animal.destination_key ? (
                      labelByKey.get(animal.destination_key) ?? animal.destination_key
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        En la manga
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={bodyCell}>
                    {animal.target_category_label ?? (
                      <Typography variant="body2" color="text.secondary">
                        {animal.status === 'WEANED' ? 'No cambió' : order.category_mode === 'AT_CHUTE' ? 'En la manga' : 'No cambia'}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={bodyCell}>
                    {animal.deviation_review && (
                      <Box
                        component="span"
                        sx={{
                          display: 'block',
                          width: 'fit-content',
                          mb: 0.5,
                          px: 0.75,
                          py: 0.1,
                          borderRadius: '4px',
                          fontSize: '0.66rem',
                          fontWeight: 700,
                          color: animal.deviation_review === 'PENDING' ? 'warning.dark' : 'success.dark',
                          bgcolor: (theme) =>
                            alpha(animal.deviation_review === 'PENDING' ? theme.palette.warning.main : theme.palette.success.main, 0.12)
                        }}
                      >
                        {animal.deviation_review === 'PENDING' ? 'Desvío sin revisar' : 'Desvío revisado'}
                      </Box>
                    )}
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
                    {!animal.weaned_at ? '—' : order.kind === 'REGISTERED' ? formatDate(order.weaning_date) : formatDateTime(animal.weaned_at)}
                    {animal.weaning_type_applied && animal.weaning_type_applied !== order.weaning_type && (
                      <Typography variant="caption" sx={{ display: 'block', color: 'warning.dark', fontWeight: 700 }}>
                        {animal.weaning_type_applied_label} · planificado {order.weaning_type_label ?? 'sin tipo'}
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
      {rows.length > COLLAPSED_ROWS && (
        <Button size="small" onClick={() => setExpanded((prev) => !prev)} sx={{ mt: 0.5, textTransform: 'none', fontWeight: 700 }}>
          {expanded ? 'Mostrar menos' : `Ver las ${rows.length} crías`}
        </Button>
      )}
    </Box>
  );
};

export default WeaningOrderRollTable;
