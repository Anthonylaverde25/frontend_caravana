import React, { useMemo } from 'react';
import { TableCell, Stack, Box, Typography, Tooltip, IconButton, Chip } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Batch } from '@/core/batches/domain/entities/Batch';
import { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import { computeServiceOrderTemporalStatus } from '@/ui/gestation/utils/serviceOrderTemporalStatus';

interface ServiceBatchTemporalWindowCellProps {
  batch: Batch;
  serviceOrder?: ServiceOrder;
  isDark: boolean;
  bodyCellStyle: Record<string, any>;
  onOpenTemporalInfo: () => void;
}

export const ServiceBatchTemporalWindowCell: React.FC<ServiceBatchTemporalWindowCellProps> = ({
  batch,
  serviceOrder,
  isDark,
  bodyCellStyle,
  onOpenTemporalInfo,
}) => {
  const detail = batch.service_detail;

  const temporal = useMemo(() => {
    return computeServiceOrderTemporalStatus(
      serviceOrder,
      detail?.planned_start_date,
      detail?.planned_end_date
    );
  }, [serviceOrder, detail]);

  return (
    <TableCell sx={{ ...bodyCellStyle, minWidth: 175 }}>
      <Stack direction="row" spacing={0.75} alignItems="center" justifyContent="space-between">
        <Stack direction="row" spacing={0.75} alignItems="center">
          <FuseSvgIcon size={16} color="action">heroicons-outline:calendar</FuseSvgIcon>
          <Box>
            <Typography variant="body2" sx={{ fontSize: '0.78rem', fontWeight: 600 }}>
              {serviceOrder?.actual_start_date ||
                serviceOrder?.planned_start_date ||
                detail?.planned_start_date ||
                'Sin inicio'}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem' }}>
                Fin: {serviceOrder?.actual_end_date || temporal.effectivePlannedEndDate || '—'}
              </Typography>

              {temporal.shortLabel !== '—' && (
                <Chip
                  label={temporal.shortLabel}
                  size="small"
                  color={temporal.chipColor}
                  variant={temporal.isCompleted ? 'filled' : 'outlined'}
                  sx={{
                    height: 16,
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    px: 0.2,
                    '& .MuiChip-label': { px: 0.6 },
                  }}
                />
              )}
            </Box>
          </Box>
        </Stack>

        <Tooltip title="Criterio Zootécnico: Ventana de 90 días de entore (Jorge Carrillo)" arrow>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onOpenTemporalInfo();
            }}
            sx={{
              p: 0.5,
              color: isDark ? '#60a5fa' : '#2563eb',
              bgcolor: isDark ? 'rgba(59, 130, 246, 0.12)' : '#eff6ff',
              '&:hover': {
                bgcolor: isDark ? 'rgba(59, 130, 246, 0.25)' : '#dbeafe',
              },
            }}
          >
            <FuseSvgIcon size={15}>heroicons-outline:information-circle</FuseSvgIcon>
          </IconButton>
        </Tooltip>
      </Stack>
    </TableCell>
  );
};

export default ServiceBatchTemporalWindowCell;
