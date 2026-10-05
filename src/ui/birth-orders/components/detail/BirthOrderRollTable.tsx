import React, { useMemo, useState } from 'react';
import { Box, Button, Table, TableBody, TableCell, TableHead, TableRow, Typography, alpha } from '@mui/material';
import type { BirthOrder, BirthOrderAnimal, BirthOrderAnimalStatus } from '@/features/birth-orders/types';
import { dueLabel, formatDate, stageLabel, useBirthOrderTableStyles } from '../birthOrderFormat';

const STATUS: Record<BirthOrderAnimalStatus, { label: string; color: string }> = {
  PENDING: { label: 'Pendiente', color: '#e6600d' },
  OVERDUE: { label: 'Parto vencido', color: '#b45309' },
  BORN: { label: 'Parió', color: '#107e3e' },
  BORN_DIED: { label: 'Murió al pie', color: '#9a3412' },
  LOST: { label: 'Pérdida', color: '#b91c1c' },
  SKIPPED: { label: 'No parió con la orden', color: '#64748b' }
};

const COLLAPSED_ROWS = 12;

const sexOf = (sex: string | null): string => (sex === 'M' ? 'macho' : sex === 'H' ? 'hembra' : '');

const resultOf = (animal: BirthOrderAnimal): string => {
  if (animal.status === 'BORN') return `${animal.calf_identification ?? 'Cría'} ${sexOf(animal.calf_sex)}`.trim();
  if (animal.status === 'OVERDUE') {
    return `Avisado el ${formatDate(animal.overdue_reported_at)} · hace ${animal.overdue_days ?? 0} d${animal.overdue_notes ? ` · ${animal.overdue_notes}` : ''}`;
  }
  if (animal.loss_reason_code) return `Pérdida registrada aparte: ${animal.loss_reason_label ?? animal.loss_reason_code}`;

  const sex = sexOf(animal.calf_sex);

  return `${animal.outcome_label ?? '—'}${sex ? ` · ${sex}` : ''}${animal.observations && animal.status === 'BORN_DIED' ? ` · ${animal.observations}` : ''}`;
};

/** Which comes first: the overdue ones (at risk), then the pending, then the rest. */
const urgency = (status: BirthOrderAnimalStatus): number => (status === 'OVERDUE' ? 2 : status === 'PENDING' ? 1 : 0);

/** The roll: every pregnant female of the order, when she was due, and what happened. */
export const BirthOrderRollTable: React.FC<{ order: BirthOrder }> = ({ order }) => {
  const { headerCell, bodyCell, headBg, border } = useBirthOrderTableStyles();
  const [expanded, setExpanded] = useState(false);

  // Overdue and pending first, by due date: that is who the next round has to look for.
  const rows = useMemo(
    () =>
      [...order.animals].sort(
        (a, b) =>
          urgency(b.status) - urgency(a.status) ||
          (a.estimated_due_date ?? '9999').localeCompare(b.estimated_due_date ?? '9999') ||
          (a.identification ?? '').localeCompare(b.identification ?? '')
      ),
    [order.animals]
  );
  const shown = expanded ? rows : rows.slice(0, COLLAPSED_ROWS);

  return (
    <Box>
      <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary' }}>
        Vientres ({order.animals.length})
      </Typography>
      <Box sx={{ border: '1px solid', borderColor: border, borderRadius: '8px', overflow: 'hidden', mt: 0.5 }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: headBg }}>
            <TableRow>
              <TableCell sx={headerCell}>Vientre</TableCell>
              <TableCell sx={headerCell}>FPP / Estadio</TableCell>
              <TableCell sx={headerCell}>Estado</TableCell>
              <TableCell sx={headerCell}>Resultado</TableCell>
              <TableCell sx={{ ...headerCell, borderRight: 0 }}>Fecha</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {shown.map((animal) => {
              const status = STATUS[animal.status];

              return (
                <TableRow key={animal.id} sx={animal.status === 'OVERDUE' ? { bgcolor: alpha(status.color, 0.07) } : undefined}>
                  <TableCell sx={{ ...bodyCell, fontFamily: 'monospace', fontWeight: 700 }}>
                    {animal.identification ?? `#${animal.caravan_id}`}
                    <Typography component="span" variant="caption" color="text.secondary" sx={{ fontFamily: 'inherit' }}>
                      {' '}
                      · {animal.current_batch_name ?? animal.source_batch_name ?? 'Sin lote'}
                      {animal.unplanned ? ' · fuera de la orden' : ''}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ ...bodyCell, whiteSpace: 'nowrap' }}>
                    {dueLabel(animal.estimated_due_date)}
                    <Typography component="span" variant="caption" color="text.secondary">
                      {' '}
                      · {stageLabel(animal.gestation_stage)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={bodyCell}>
                    <Box
                      component="span"
                      sx={{ px: 0.75, py: 0.25, borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, color: status.color, bgcolor: alpha(status.color, 0.1) }}
                    >
                      {status.label}
                    </Box>
                  </TableCell>
                  <TableCell sx={bodyCell}>
                    {resultOf(animal)}
                    {animal.status === 'BORN' && animal.calf_batch_name && (
                      <Typography component="span" variant="caption" color="text.secondary">
                        {' '}
                        · en {animal.calf_batch_name}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ ...bodyCell, borderRight: 0, whiteSpace: 'nowrap' }}>{animal.event_date ? formatDate(animal.event_date) : '—'}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
      {rows.length > COLLAPSED_ROWS && (
        <Button size="small" onClick={() => setExpanded((prev) => !prev)} sx={{ mt: 0.5, textTransform: 'none', fontWeight: 700 }}>
          {expanded ? 'Mostrar menos' : `Ver los ${rows.length} vientres`}
        </Button>
      )}
    </Box>
  );
};

export default BirthOrderRollTable;
