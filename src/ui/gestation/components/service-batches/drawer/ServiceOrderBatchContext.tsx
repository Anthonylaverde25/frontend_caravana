import React from 'react';
import { Box, Typography, Paper, Stack, Chip } from '@mui/material';
import { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import { Batch } from '@/core/batches/domain/entities/Batch';

interface ServiceOrderBatchContextProps {
  order: ServiceOrder | null;
  batch: Batch | null;
  daysInService: number | null;
}

export const ServiceOrderBatchContext: React.FC<ServiceOrderBatchContextProps> = ({
  order,
  batch,
  daysInService,
}) => {
  const batchDetail = batch?.service_detail;

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
          Detalles del Lote &amp; Potrero
        </Typography>
      </Box>

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
              Lote de Servicio:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {batch?.name || (order ? `Lote #${order.batch_id}` : '—')}
            </Typography>
          </Box>

          {batchDetail?.female_category_name && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Categoría Vientres:
              </Typography>
              <Chip
                label={batchDetail.female_category_name}
                size="small"
                sx={{ fontWeight: 700, fontSize: '0.72rem', height: 22, bgcolor: '#fce7f3', color: '#db2777' }}
              />
            </Box>
          )}

          {batchDetail?.male_category_name && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Categoría Torada:
              </Typography>
              <Chip
                label={batchDetail.male_category_name}
                size="small"
                sx={{ fontWeight: 700, fontSize: '0.72rem', height: 22, bgcolor: '#eff6ff', color: '#2563eb' }}
              />
            </Box>
          )}

          {order && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Modalidad Reproductiva:
              </Typography>
              <Chip
                label={
                  order.service_type === 'multi'
                    ? 'Colectivo (Multi-Toro)'
                    : order.service_type === 'rotation'
                    ? 'Rotación de Padrillos'
                    : 'Individual / Controlado'
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
              {order?.planned_start_date || batchDetail?.planned_start_date || 'Sin fecha inicio'}
              {(order?.actual_end_date || batchDetail?.planned_end_date)
                ? ` al ${order?.actual_end_date || batchDetail?.planned_end_date}`
                : ''}
            </Typography>
          </Box>

          {daysInService !== null && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Días en Servicio:
              </Typography>
              <Chip
                label={`${daysInService} días transcurridos`}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 700, borderRadius: '6px' }}
              />
            </Box>
          )}
        </Stack>
      </Paper>
    </>
  );
};

export default ServiceOrderBatchContext;
