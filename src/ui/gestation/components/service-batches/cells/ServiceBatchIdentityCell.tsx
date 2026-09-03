import React from 'react';
import { TableCell, Stack, Avatar, Box, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Batch } from '@/core/batches/domain/entities/Batch';
import { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';

interface ServiceBatchIdentityCellProps {
  batch: Batch;
  serviceOrder?: ServiceOrder;
  isDark: boolean;
  bodyCellStyle: Record<string, any>;
  onOpenDetailDrawer: (batch: Batch, order?: ServiceOrder) => void;
}

export const ServiceBatchIdentityCell: React.FC<ServiceBatchIdentityCellProps> = ({
  batch,
  serviceOrder,
  isDark,
  bodyCellStyle,
  onOpenDetailDrawer,
}) => {
  return (
    <TableCell sx={{ ...bodyCellStyle, minWidth: 220 }}>
      <Stack direction="row" spacing={1.25} alignItems="center">
        <Avatar
          variant="rounded"
          sx={{
            width: 34,
            height: 34,
            bgcolor: isDark ? 'rgba(236, 72, 153, 0.16)' : '#fdf2f8',
            color: isDark ? '#f472b6' : '#db2777',
            border: '1px solid',
            borderColor: isDark ? 'rgba(236, 72, 153, 0.3)' : '#fbcfe8',
            borderRadius: '6px',
          }}
        >
          <FuseSvgIcon size={18}>heroicons-outline:heart</FuseSvgIcon>
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="subtitle2"
            onClick={() => onOpenDetailDrawer(batch, serviceOrder)}
            sx={{
              fontWeight: 700,
              fontSize: '0.84rem',
              color: 'text.primary',
              cursor: 'pointer',
              '&:hover': { color: 'primary.main', textDecoration: 'underline' },
            }}
          >
            {batch.name}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', display: 'block' }}>
            LOTE #{batch.id} {batch.observaciones ? `• ${batch.observaciones}` : ''}
          </Typography>
        </Box>
      </Stack>
    </TableCell>
  );
};

export default ServiceBatchIdentityCell;
