import React from 'react';
import { Paper, Box, Typography, Chip } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import { Batch } from '@/core/batches/domain/entities/Batch';

interface ServiceOrderStatusCardProps {
  order: ServiceOrder | null;
  batch: Batch | null;
}

const getStatusConfig = (status?: string) => {
  switch (status?.toUpperCase()) {
    case 'APPROVED':
      return { label: 'Aprobada (En Servicio)', color: 'success' as const };
    case 'SUCCESS':
      return { label: 'Completada', color: 'info' as const };
    case 'DRAFT':
      return { label: 'Borrador', color: 'warning' as const };
    case 'REJECTED':
      return { label: 'Rechazada', color: 'error' as const };
    default:
      return { label: status || 'Sin Orden Formal', color: 'default' as const };
  }
};

export const ServiceOrderStatusCard: React.FC<ServiceOrderStatusCardProps> = ({
  order,
  batch,
}) => {
  const statusConfig = getStatusConfig(order?.status);

  return (
    <>
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mb: 3,
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: (theme) => theme.palette.background.paper,
        }}
      >
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>
            {order ? 'Estado de la Orden' : 'Estado del Lote de Servicio'}
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {order
              ? statusConfig.label
              : batch?.isActive()
              ? 'En Servicio Activo'
              : 'Lote Concluido'}
          </Typography>
        </Box>
        <Chip
          label={
            order
              ? statusConfig.label
              : batch?.isActive()
              ? 'Activo en Potrero'
              : 'Inactivo'
          }
          color={
            order
              ? statusConfig.color
              : batch?.isActive()
              ? 'success'
              : 'default'
          }
          variant="filled"
          size="small"
          sx={{ fontWeight: 700, borderRadius: '6px' }}
        />
      </Paper>

      {!order && (
        <Paper
          variant="outlined"
          sx={{
            p: 1.75,
            mb: 3,
            borderRadius: '8px',
            bgcolor: 'action.hover',
            borderLeft: (theme) => `4px solid ${theme.palette.info.main}`,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.5,
          }}
        >
          <FuseSvgIcon size={20} color="info" sx={{ mt: 0.25 }}>
            heroicons-outline:information-circle
          </FuseSvgIcon>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', color: 'text.primary' }}>
              Lote sin Orden de Servicio Formal
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.74rem' }}>
              Este lote agrupa los vientres y toros físicamente en potrero. Puedes formalizar la orden operativa desde el módulo de Órdenes.
            </Typography>
          </Box>
        </Paper>
      )}
    </>
  );
};

export default ServiceOrderStatusCard;
