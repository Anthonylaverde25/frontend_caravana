import React, { useMemo } from 'react';
import { Box, Typography, Paper, Stack, Chip, Alert } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import { Batch } from '@/core/batches/domain/entities/Batch';
import { computeServiceOrderTemporalStatus } from '@/ui/gestation/utils/serviceOrderTemporalStatus';

interface ServiceOrderBatchContextProps {
  order: ServiceOrder | null;
  batch: Batch | null;
  daysInService?: number | null;
}

export const ServiceOrderBatchContext: React.FC<ServiceOrderBatchContextProps> = ({
  order,
  batch,
}) => {
  const temporal = useMemo(() => computeServiceOrderTemporalStatus(order), [order]);

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
          Lote en Servicio &amp; Políticas
        </Typography>
      </Box>

      {/* Proactive Temporal Alert Banner */}
      {temporal.isOverdue && !temporal.isCompleted && (
        <Alert
          severity="error"
          icon={<FuseSvgIcon size={18}>lucide:alert-triangle</FuseSvgIcon>}
          sx={{ mb: 2, borderRadius: '8px', fontWeight: 600, fontSize: '0.78rem' }}
        >
          {temporal.label}. Para no dispersar la parición, debe realizar el retiro de toros al potrero de descanso.
        </Alert>
      )}

      {temporal.isClosingSoon && !temporal.isCompleted && (
        <Alert
          severity="warning"
          icon={<FuseSvgIcon size={18}>lucide:clock</FuseSvgIcon>}
          sx={{ mb: 2, borderRadius: '8px', fontWeight: 600, fontSize: '0.78rem' }}
        >
          {temporal.label}. Organice los lotes de torada para recibir a los reproductores.
        </Alert>
      )}

      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mb: 3,
          borderRadius: '8px',
          backgroundColor: (theme) => theme.palette.background.paper,
        }}
      >
        <Stack spacing={1.5}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Lote:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {order?.batch_name || batch?.name || (order ? `Lote #${order.batch_id}` : '—')}
            </Typography>
          </Box>

          {order?.target_bull_ratio != null && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Relación Toro/Vaca Objetivo:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {order.target_bull_ratio}%
              </Typography>
            </Box>
          )}

          {order && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Modalidad Reproductiva:
              </Typography>
              <Chip
                label={
                  (order.is_controlled_service ? 'Controlado · ' : 'Natural · ') +
                  (order.service_type === 'multi'
                    ? 'Colectivo (Multi-Toro)'
                    : order.service_type === 'rotation'
                    ? 'Rotación de Padrillos'
                    : 'Individual')
                }
                size="small"
                variant="outlined"
                sx={{ fontWeight: 600, borderRadius: '6px' }}
              />
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Ventana Planificada:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {order?.planned_start_date || 'Sin inicio'}
              {' al '}
              {temporal.effectivePlannedEndDate || 'Sin fin'}
            </Typography>
          </Box>

          {order?.actual_end_date && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Retiro Efectivo:
              </Typography>
              <Chip
                label={`Retirado: ${order.actual_end_date}`}
                size="small"
                color="success"
                sx={{ fontWeight: 700, borderRadius: '6px' }}
              />
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Estado Temporal:
            </Typography>
            <Chip
              label={temporal.label}
              size="small"
              color={temporal.chipColor}
              variant={temporal.isCompleted ? 'filled' : 'outlined'}
              sx={{ fontWeight: 700, borderRadius: '6px' }}
            />
          </Box>
        </Stack>
      </Paper>
    </>
  );
};

export default ServiceOrderBatchContext;
