import React from 'react';
import { Alert, Box, Button, Paper, Stack, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { BirthResult } from '@/features/birth-orders/types';
import { formatDate, sheetUrl } from '@/ui/birth-orders/components/birthOrderFormat';

const Figure: React.FC<{ label: string; value: React.ReactNode; tone?: string }> = ({ label, value, tone }) => (
  <Paper variant="outlined" sx={{ p: 1.25, borderRadius: '8px', flex: 1, minWidth: 90 }}>
    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.64rem' }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 800, color: tone }}>
      {value}
    </Typography>
  </Paper>
);

/** What a PAR-01 round registered, what it skipped because it was already registered, and where its order stands. */
export const Par01SuccessSummary: React.FC<{ result: BirthResult }> = ({ result }) => {
  const order = result.birth_order;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="body2">
        Se registraron <strong>{result.live_count}</strong> parto(s) con cría viva ({result.males_count} M · {result.females_count} H). Cada
        cría quedó en el lote de su madre.
        {result.already_registered_count > 0 ? ` ${result.already_registered_count} fila(s) ya estaban registradas y se saltearon.` : ''}
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Figure label="V · Parió" value={result.live_count} tone="success.main" />
        <Figure label="NM · Nació muerto" value={result.stillborn_count} tone={result.stillborn_count > 0 ? 'error.main' : undefined} />
        <Figure label="M · Murió al pie" value={result.perinatal_death_count} tone={result.perinatal_death_count > 0 ? 'warning.dark' : undefined} />
        <Figure label="N · Avisos nuevos" value={result.overdue_new_count} tone={result.overdue_new_count > 0 ? 'warning.dark' : undefined} />
        <Figure label="Alertas cerradas" value={result.overdue_resolved_count} />
      </Stack>
      <Stack direction="row" spacing={1}>
        <Figure label="Orden" value={order.code} />
        <Figure label="Estado" value={order.status_label} />
        <Figure label="Pendientes" value={order.pending_head_count} />
        <Figure label="Partos vencidos" value={order.overdue_head_count} tone={order.overdue_head_count > 0 ? 'warning.dark' : undefined} />
      </Stack>
      <Box>
        <Button
          size="small"
          variant="outlined"
          href={sheetUrl(order.id)}
          target="_blank"
          rel="noopener"
          startIcon={<FuseSvgIcon size={16}>heroicons-outline:printer</FuseSvgIcon>}
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '6px' }}
        >
          Imprimir planilla de la orden {order.code}
        </Button>
      </Box>
      {order.overdue_animals.length > 0 && (
        <Alert severity="warning" sx={{ borderRadius: '6px' }}>
          <strong>Hembras con parto vencido (en riesgo):</strong>{' '}
          {order.overdue_animals
            .map((a) => `${a.identification} (avisado ${formatDate(a.overdue_reported_at)}${a.estimated_due_date ? `, FPP ${formatDate(a.estimated_due_date)}` : ''})`)
            .join(' · ')}
        </Alert>
      )}
      {result.overdue_resolved.length > 0 && (
        <Alert severity="info" sx={{ borderRadius: '6px' }}>
          {result.overdue_resolved.map((r) => `${r.mother} parió ${r.days_after_report} día(s) después del aviso`).join(' · ')}.
        </Alert>
      )}
      {order.created_from_sheet && (
        <Alert severity="info" sx={{ borderRadius: '6px' }}>
          La planilla no traía orden: se creó la orden registrada <strong>{order.code}</strong>, que nace ejecutada. Una planilla en blanco sirve para
          una sola carga: para recorridas de varios días, emití la orden primero.
        </Alert>
      )}
      {result.warnings.length > 0 && (
        <Alert severity="warning" sx={{ borderRadius: '6px' }}>
          {result.warnings.slice(0, 6).map((w) => (
            <div key={`${w.code}-${w.message}`}>{w.message}</div>
          ))}
        </Alert>
      )}
    </Box>
  );
};

export default Par01SuccessSummary;
