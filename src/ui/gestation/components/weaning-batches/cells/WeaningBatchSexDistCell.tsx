import React from 'react';
import { TableCell, Stack, Chip, Typography } from '@mui/material';

interface WeaningBatchSexDistCellProps {
  males: number;
  females: number;
  isDark: boolean;
  bodyCellStyle: Record<string, any>;
}

export const WeaningBatchSexDistCell: React.FC<WeaningBatchSexDistCellProps> = ({
  males,
  females,
  isDark,
  bodyCellStyle,
}) => {
  const total = males + females;

  if (total === 0) {
    return (
      <TableCell sx={{ ...bodyCellStyle, minWidth: 140, textAlign: 'center' }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
          Sin animales
        </Typography>
      </TableCell>
    );
  }

  return (
    <TableCell sx={{ ...bodyCellStyle, minWidth: 150 }}>
      <Stack direction="row" spacing={0.75} alignItems="center">
        <Chip
          label={`♂ ${males}`}
          size="small"
          sx={{
            fontWeight: 700,
            fontSize: '0.72rem',
            height: 22,
            borderRadius: '4px',
            bgcolor: isDark ? 'rgba(96, 165, 250, 0.14)' : '#eff6ff',
            color: isDark ? '#60a5fa' : '#2563eb',
            border: '1px solid',
            borderColor: isDark ? 'rgba(96, 165, 250, 0.3)' : '#bfdbfe',
          }}
        />
        <Chip
          label={`♀ ${females}`}
          size="small"
          sx={{
            fontWeight: 700,
            fontSize: '0.72rem',
            height: 22,
            borderRadius: '4px',
            bgcolor: isDark ? 'rgba(236, 72, 153, 0.14)' : '#fdf2f8',
            color: isDark ? '#f472b6' : '#db2777',
            border: '1px solid',
            borderColor: isDark ? 'rgba(236, 72, 153, 0.3)' : '#fbcfe8',
          }}
        />
      </Stack>
    </TableCell>
  );
};

export default WeaningBatchSexDistCell;
