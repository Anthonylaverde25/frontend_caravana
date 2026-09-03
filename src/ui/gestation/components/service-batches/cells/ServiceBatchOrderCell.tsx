import React from 'react';
import { TableCell, Tooltip, Chip } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Batch } from '@/core/batches/domain/entities/Batch';
import { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';

interface ServiceBatchOrderCellProps {
  batch: Batch;
  serviceOrder?: ServiceOrder;
  isDark: boolean;
  bodyCellStyle: Record<string, any>;
  onOpenDetailDrawer: (batch: Batch, order?: ServiceOrder) => void;
}

export const ServiceBatchOrderCell: React.FC<ServiceBatchOrderCellProps> = ({
  batch,
  serviceOrder,
  isDark,
  bodyCellStyle,
  onOpenDetailDrawer,
}) => {
  return (
    <TableCell sx={{ ...bodyCellStyle, minWidth: 145, textAlign: 'center' }}>
      {serviceOrder ? (
        <Tooltip title="Ver detalles completos de la Orden de Servicio" arrow>
          <Chip
            label={serviceOrder.code}
            size="small"
            onClick={() => onOpenDetailDrawer(batch, serviceOrder)}
            icon={<FuseSvgIcon size={14}>heroicons-outline:clipboard-document-check</FuseSvgIcon>}
            sx={{
              fontFamily: 'monospace',
              fontWeight: 800,
              fontSize: '0.74rem',
              height: 26,
              borderRadius: '6px',
              cursor: 'pointer',
              bgcolor: isDark ? 'rgba(2, 132, 199, 0.16)' : '#e0f2fe',
              color: isDark ? '#38bdf8' : '#0284c7',
              border: '1px solid',
              borderColor: isDark ? 'rgba(2, 132, 199, 0.4)' : '#bae6fd',
              '&:hover': {
                bgcolor: isDark ? 'rgba(2, 132, 199, 0.28)' : '#bae6fd',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.15s ease',
            }}
          />
        </Tooltip>
      ) : (
        <Tooltip title="Lote sin orden formal. Clic para ver detalle del lote" arrow>
          <Chip
            label="Sin Orden"
            size="small"
            onClick={() => onOpenDetailDrawer(batch)}
            icon={<FuseSvgIcon size={14}>heroicons-outline:document-text</FuseSvgIcon>}
            sx={{
              fontFamily: 'monospace',
              fontWeight: 600,
              fontSize: '0.72rem',
              height: 24,
              borderRadius: '6px',
              cursor: 'pointer',
              bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
              color: 'text.secondary',
              border: '1px dashed',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1',
              '&:hover': {
                bgcolor: isDark ? 'rgba(2, 132, 199, 0.16)' : '#e0f2fe',
                color: isDark ? '#38bdf8' : '#0284c7',
                borderColor: isDark ? 'rgba(2, 132, 199, 0.4)' : '#bae6fd',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.15s ease',
            }}
          />
        </Tooltip>
      )}
    </TableCell>
  );
};

export default ServiceBatchOrderCell;
