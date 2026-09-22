import React from 'react';
import { TableRow, TableCell, Typography, Chip, useTheme } from '@mui/material';
import { Batch } from '@/core/batches/domain/entities/Batch';

import { WeaningBatchIdentityCell } from './cells/WeaningBatchIdentityCell';
import { WeaningBatchSexDistCell } from './cells/WeaningBatchSexDistCell';
import { WeaningBatchWeightCell } from './cells/WeaningBatchWeightCell';
import { WeaningBatchActionsCell } from './cells/WeaningBatchActionsCell';

interface WeaningBatchTableRowProps {
  batch: Batch;
  index: number;
  stats: { total: number; males: number; females: number };
  onViewCaravans: (batchId: number) => void;
  onOpenDetailDrawer: (batch: Batch) => void;
}

export const WeaningBatchTableRow: React.FC<WeaningBatchTableRowProps> = ({
  batch,
  index,
  stats,
  onViewCaravans,
  onOpenDetailDrawer,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isEven = index % 2 === 1;

  const zebraBg = isDark ? 'rgba(255, 255, 255, 0.02)' : '#fafafa';

  const bodyCellStyle = {
    px: 1.5,
    py: 1.25,
    borderRight: '1px solid',
    borderBottom: '1px solid',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9',
  };

  const isActive = batch.isActive();
  const knowsToEat = batch.knows_to_eat;
  const age = batch.age_in_months;
  const createdDate = batch.created_at ? batch.created_at.split(' ')[0] : '-';

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

      {/* 1. Batch Identity */}
      <WeaningBatchIdentityCell
        batch={batch}
        isDark={isDark}
        bodyCellStyle={bodyCellStyle}
        onOpenDetailDrawer={onOpenDetailDrawer}
      />

      {/* 2. Total Calves */}
      <TableCell sx={{ ...bodyCellStyle, width: 90, textAlign: 'center' }}>
        <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: '#8b5cf6' }}>
          {stats.total}
        </Typography>
      </TableCell>

      {/* 3. Sex Distribution */}
      <WeaningBatchSexDistCell
        males={stats.males}
        females={stats.females}
        isDark={isDark}
        bodyCellStyle={bodyCellStyle}
      />

      {/* 4. Weight */}
      <WeaningBatchWeightCell
        batch={batch}
        isDark={isDark}
        bodyCellStyle={bodyCellStyle}
      />

      {/* 5. Knows to Eat */}
      <TableCell sx={{ ...bodyCellStyle, minWidth: 125, textAlign: 'center' }}>
        <Chip
          label={knowsToEat ? 'Sabe Comer' : 'Sin Batea'}
          size="small"
          sx={{
            fontWeight: 700,
            fontSize: '0.68rem',
            height: 22,
            borderRadius: '4px',
            bgcolor: knowsToEat
              ? isDark ? 'rgba(16, 126, 62, 0.16)' : '#e7f6ec'
              : 'action.hover',
            color: knowsToEat
              ? isDark ? '#34d399' : '#107e3e'
              : 'text.secondary',
            border: '1px solid',
            borderColor: knowsToEat
              ? isDark ? 'rgba(16, 126, 62, 0.3)' : '#b0e4c1'
              : 'transparent',
          }}
        />
      </TableCell>

      {/* 6. Approximate Age */}
      <TableCell sx={{ ...bodyCellStyle, minWidth: 100, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
          {age ? `${age} m` : '6-8 m'}
        </Typography>
      </TableCell>

      {/* 7. Creation Date */}
      <TableCell sx={{ ...bodyCellStyle, minWidth: 105, textAlign: 'center' }}>
        <Typography variant="caption" sx={{ fontSize: '0.74rem', color: 'text.secondary' }}>
          {createdDate}
        </Typography>
      </TableCell>

      {/* 8. Status */}
      <TableCell sx={{ ...bodyCellStyle, width: 100, textAlign: 'center' }}>
        <Chip
          label={isActive ? 'Activo' : 'Cerrado'}
          size="small"
          sx={{
            fontWeight: 700,
            fontSize: '0.68rem',
            height: 22,
            borderRadius: '4px',
            bgcolor: isActive
              ? isDark ? 'rgba(16, 126, 62, 0.16)' : '#e7f6ec'
              : 'action.hover',
            color: isActive
              ? isDark ? '#34d399' : '#107e3e'
              : 'text.secondary',
            border: '1px solid',
            borderColor: isActive
              ? isDark ? 'rgba(16, 126, 62, 0.3)' : '#b0e4c1'
              : 'transparent',
          }}
        />
      </TableCell>

      {/* 9. Actions */}
      <WeaningBatchActionsCell
        batch={batch}
        isDark={isDark}
        bodyCellStyle={bodyCellStyle}
        onViewCaravans={onViewCaravans}
        onOpenDetailDrawer={onOpenDetailDrawer}
      />
    </TableRow>
  );
};

export default WeaningBatchTableRow;
