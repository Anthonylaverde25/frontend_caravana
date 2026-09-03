import React from 'react';
import { TableCell, Chip } from '@mui/material';

interface ServiceBatchRatioCellProps {
  ratio: number;
  isDark: boolean;
  bodyCellStyle: Record<string, any>;
}

export const ServiceBatchRatioCell: React.FC<ServiceBatchRatioCellProps> = ({
  ratio,
  isDark,
  bodyCellStyle,
}) => {
  const isRatioOptimal = ratio >= 2.0;

  return (
    <TableCell sx={{ ...bodyCellStyle, width: 110, textAlign: 'center' }}>
      <Chip
        label={`${ratio}%`}
        size="small"
        sx={{
          fontWeight: 800,
          fontSize: '0.75rem',
          height: 24,
          borderRadius: '6px',
          bgcolor: isRatioOptimal
            ? isDark ? 'rgba(16, 126, 62, 0.2)' : '#e7f6ec'
            : ratio > 0
            ? isDark ? 'rgba(230, 96, 13, 0.2)' : '#fff3e0'
            : 'action.hover',
          color: isRatioOptimal
            ? isDark ? '#34d399' : '#107e3e'
            : ratio > 0
            ? isDark ? '#fb923c' : '#e6600d'
            : 'text.secondary',
          border: '1px solid',
          borderColor: isRatioOptimal
            ? isDark ? 'rgba(16, 126, 62, 0.4)' : '#b0e4c1'
            : ratio > 0
            ? isDark ? 'rgba(230, 96, 13, 0.4)' : '#ffe0b2'
            : 'transparent',
        }}
      />
    </TableCell>
  );
};

export default ServiceBatchRatioCell;
