import React from 'react';
import { TableCell, Stack, Tooltip, IconButton } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Batch } from '@/core/batches/domain/entities/Batch';
import { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';

interface ServiceBatchActionsCellProps {
  batch: Batch;
  serviceOrder?: ServiceOrder;
  isDark: boolean;
  bodyCellStyle: Record<string, any>;
  onViewCaravans: (batchId: number) => void;
  onOpenDetailDrawer: (batch: Batch, order?: ServiceOrder) => void;
}

export const ServiceBatchActionsCell: React.FC<ServiceBatchActionsCellProps> = ({
  batch,
  serviceOrder,
  isDark,
  bodyCellStyle,
  onViewCaravans,
  onOpenDetailDrawer,
}) => {
  return (
    <TableCell sx={{ ...bodyCellStyle, width: 85, textAlign: 'center', borderRight: 0 }}>
      <Stack direction="row" spacing={0.5} justifyContent="center">
        <Tooltip title="Ver detalle del Lote / Orden" arrow>
          <IconButton
            size="small"
            onClick={() => onOpenDetailDrawer(batch, serviceOrder)}
            sx={{
              color: 'primary.main',
              bgcolor: isDark ? 'rgba(96, 165, 250, 0.08)' : '#eff6ff',
              '&:hover': {
                bgcolor: isDark ? 'rgba(96, 165, 250, 0.16)' : '#dbeafe',
              },
            }}
          >
            <FuseSvgIcon size={16}>heroicons-outline:eye</FuseSvgIcon>
          </IconButton>
        </Tooltip>
        <Tooltip title="Ver animales del lote" arrow>
          <IconButton
            size="small"
            onClick={() => onViewCaravans(batch.id)}
            sx={{
              color: 'text.secondary',
              bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
              '&:hover': {
                bgcolor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0',
                color: 'text.primary',
              },
            }}
          >
            <FuseSvgIcon size={16}>heroicons-outline:arrow-top-right-on-square</FuseSvgIcon>
          </IconButton>
        </Tooltip>
      </Stack>
    </TableCell>
  );
};

export default ServiceBatchActionsCell;
