import React from 'react';
import {
  TableRow,
  TableCell,
  Typography,
  Chip,
  Box,
  useTheme,
} from '@mui/material';
import { Batch } from '@/core/batches/domain/entities/Batch';
import { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';

import { ServiceBatchIdentityCell } from './cells/ServiceBatchIdentityCell';
import { ServiceBatchOrderCell } from './cells/ServiceBatchOrderCell';
import { ServiceBatchTemporalWindowCell } from './cells/ServiceBatchTemporalWindowCell';
import { ServiceBatchRatioCell } from './cells/ServiceBatchRatioCell';
import { ServiceBatchActionsCell } from './cells/ServiceBatchActionsCell';

interface ServiceBatchTableRowProps {
  batch: Batch;
  index: number;
  stats: { females: number; males: number; ratio: number };
  serviceOrder?: ServiceOrder;
  onViewCaravans: (batchId: number) => void;
  onOpenDetailDrawer: (batch: Batch, order?: ServiceOrder) => void;
  onOpenTemporalInfo: () => void;
}

/**
 * ServiceBatchTableRow (Row Orchestrator)
 *
 * Coordinates row layout and delegates rendering to specialized cell components (< 120 lines).
 */
export const ServiceBatchTableRow: React.FC<ServiceBatchTableRowProps> = ({
  batch,
  index,
  stats,
  serviceOrder,
  onViewCaravans,
  onOpenDetailDrawer,
  onOpenTemporalInfo,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isEven = index % 2 === 1;

  const zebraBg = isDark ? 'rgba(255, 255, 255, 0.02)' : '#fafafa';
  const detail = batch.service_detail;

  const bodyCellStyle = {
    px: 1.5,
    py: 1.25,
    borderRight: '1px solid',
    borderBottom: '1px solid',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9',
  };

  return (
    <TableRow
      hover
      sx={{
        bgcolor: isEven ? zebraBg : 'inherit',
        transition: 'background-color 0.15s ease',
      }}
    >
      {/* Index */}
      <TableCell sx={{ ...bodyCellStyle, width: 44, textAlign: 'center', color: 'text.secondary', fontSize: '0.75rem' }}>
        {index + 1}
      </TableCell>

      {/* 1. Batch Identity (Name, Potrero, Farm) */}
      <ServiceBatchIdentityCell
        batch={batch}
        serviceOrder={serviceOrder}
        isDark={isDark}
        bodyCellStyle={bodyCellStyle}
        onOpenDetailDrawer={onOpenDetailDrawer}
      />

      {/* 2. Linked Service Order */}
      <ServiceBatchOrderCell
        batch={batch}
        serviceOrder={serviceOrder}
        isDark={isDark}
        bodyCellStyle={bodyCellStyle}
        onOpenDetailDrawer={onOpenDetailDrawer}
      />

      {/* 3. Female Category */}
      <TableCell sx={{ ...bodyCellStyle, minWidth: 140 }}>
        <Box>
          <Chip
            label={detail?.female_category_name || detail?.female_category_code || 'Homogénea'}
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: '0.72rem',
              height: 22,
              borderRadius: '4px',
              bgcolor: isDark ? 'rgba(236, 72, 153, 0.12)' : '#fdf2f8',
              color: isDark ? '#f472b6' : '#db2777',
              border: '1px solid',
              borderColor: isDark ? 'rgba(236, 72, 153, 0.3)' : '#fbcfe8',
            }}
          />
          {detail?.female_subcategory_name && (
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem', display: 'block', mt: 0.25 }}>
              {detail.female_subcategory_name}
            </Typography>
          )}
        </Box>
      </TableCell>

      {/* 4. Male Category */}
      <TableCell sx={{ ...bodyCellStyle, minWidth: 120 }}>
        <Chip
          label={detail?.male_category_name || detail?.male_category_code || 'Toro'}
          size="small"
          sx={{
            fontWeight: 700,
            fontSize: '0.72rem',
            height: 22,
            borderRadius: '4px',
            bgcolor: isDark ? 'rgba(96, 165, 250, 0.12)' : '#eff6ff',
            color: isDark ? '#60a5fa' : '#2563eb',
            border: '1px solid',
            borderColor: isDark ? 'rgba(96, 165, 250, 0.3)' : '#bfdbfe',
          }}
        />
      </TableCell>

      {/* 5. Female Count */}
      <TableCell sx={{ ...bodyCellStyle, width: 85, textAlign: 'center' }}>
        <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: isDark ? '#f472b6' : '#db2777' }}>
          {stats.females}
        </Typography>
      </TableCell>

      {/* 6. Male Count */}
      <TableCell sx={{ ...bodyCellStyle, width: 80, textAlign: 'center' }}>
        <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: isDark ? '#60a5fa' : '#2563eb' }}>
          {stats.males}
        </Typography>
      </TableCell>

      {/* 7. Ratio Torada */}
      <ServiceBatchRatioCell ratio={stats.ratio} isDark={isDark} bodyCellStyle={bodyCellStyle} />

      {/* 8. Planned Dates / Ventana Temporal */}
      <ServiceBatchTemporalWindowCell
        batch={batch}
        isDark={isDark}
        bodyCellStyle={bodyCellStyle}
        onOpenTemporalInfo={onOpenTemporalInfo}
      />

      {/* 9. Status */}
      <TableCell sx={{ ...bodyCellStyle, width: 105, textAlign: 'center' }}>
        <Chip
          label={batch.isActive() ? 'En Servicio' : 'Concluido'}
          size="small"
          sx={{
            fontWeight: 700,
            fontSize: '0.7rem',
            height: 22,
            borderRadius: '4px',
            bgcolor: batch.isActive()
              ? isDark ? 'rgba(16, 126, 62, 0.2)' : '#e7f6ec'
              : 'action.hover',
            color: batch.isActive()
              ? isDark ? '#34d399' : '#107e3e'
              : 'text.secondary',
            border: '1px solid',
            borderColor: batch.isActive()
              ? isDark ? 'rgba(16, 126, 62, 0.4)' : '#b0e4c1'
              : 'transparent',
          }}
        />
      </TableCell>

      {/* 10. Actions */}
      <ServiceBatchActionsCell
        batch={batch}
        serviceOrder={serviceOrder}
        isDark={isDark}
        bodyCellStyle={bodyCellStyle}
        onViewCaravans={onViewCaravans}
        onOpenDetailDrawer={onOpenDetailDrawer}
      />
    </TableRow>
  );
};

export default ServiceBatchTableRow;
