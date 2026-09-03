import React from 'react';
import { TableCell, Stack, Box, Typography, Tooltip, IconButton } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Batch } from '@/core/batches/domain/entities/Batch';

interface ServiceBatchTemporalWindowCellProps {
  batch: Batch;
  isDark: boolean;
  bodyCellStyle: Record<string, any>;
  onOpenTemporalInfo: () => void;
}

export const ServiceBatchTemporalWindowCell: React.FC<ServiceBatchTemporalWindowCellProps> = ({
  batch,
  isDark,
  bodyCellStyle,
  onOpenTemporalInfo,
}) => {
  const detail = batch.service_detail;

  return (
    <TableCell sx={{ ...bodyCellStyle, minWidth: 155 }}>
      <Stack direction="row" spacing={0.75} alignItems="center" justifyContent="space-between">
        <Stack direction="row" spacing={0.75} alignItems="center">
          <FuseSvgIcon size={16} color="action">heroicons-outline:calendar</FuseSvgIcon>
          <Box>
            <Typography variant="body2" sx={{ fontSize: '0.78rem', fontWeight: 600 }}>
              {detail?.planned_start_date || 'Sin inicio'}
            </Typography>
            {detail?.planned_end_date && (
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem', display: 'block' }}>
                Fin: {detail.planned_end_date}
              </Typography>
            )}
          </Box>
        </Stack>

        <Tooltip title="¿Por qué el lote de servicio tiene ventana temporal? (Criterio Zootécnico)" arrow>
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
