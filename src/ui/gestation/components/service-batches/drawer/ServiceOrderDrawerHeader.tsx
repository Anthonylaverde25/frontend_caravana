import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import { Batch } from '@/core/batches/domain/entities/Batch';

interface ServiceOrderDrawerHeaderProps {
  order: ServiceOrder | null;
  batch: Batch | null;
  onClose: () => void;
}

export const ServiceOrderDrawerHeader: React.FC<ServiceOrderDrawerHeaderProps> = ({
  order,
  batch,
  onClose,
}) => {
  return (
    <Box
      sx={{
        p: 2.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        backgroundColor: (theme) => theme.palette.background.default,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <FuseSvgIcon color="primary" size={24}>
          {order ? 'lucide:clipboard-check' : 'heroicons-outline:rectangle-stack'}
        </FuseSvgIcon>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem', lineHeight: 1.2 }}>
            {order ? 'Orden de Servicio' : 'Lote de Servicio (Entore)'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace', fontWeight: 700 }}>
            {order ? `#${order.code}` : batch?.name || 'Detalle del Lote'}
          </Typography>
        </Box>
      </Box>
      <IconButton onClick={onClose} size="small">
        <FuseSvgIcon size={20}>lucide:x</FuseSvgIcon>
      </IconButton>
    </Box>
  );
};

export default ServiceOrderDrawerHeader;
