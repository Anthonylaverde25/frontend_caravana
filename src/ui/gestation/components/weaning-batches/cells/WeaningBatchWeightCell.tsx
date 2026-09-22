import React from 'react';
import { TableCell, Stack, Box, Typography, Chip } from '@mui/material';
import { Batch } from '@/core/batches/domain/entities/Batch';

interface WeaningBatchWeightCellProps {
  batch: Batch;
  isDark: boolean;
  bodyCellStyle: Record<string, any>;
}

export const WeaningBatchWeightCell: React.FC<WeaningBatchWeightCellProps> = ({
  batch,
  isDark,
  bodyCellStyle,
}) => {
  const currentWeight = batch.current_weight ?? batch.weight;
  const hasWeight = currentWeight != null && currentWeight > 0;
  const minW = batch.min_weight;
  const maxW = batch.max_weight;

  // Zootechnical benchmark for weaning weight (Carrillo / rodeo de cría):
  // >= 170 kg: Óptimo
  // 150 - 169 kg: Bueno
  // < 150 kg: Bajo / Requiere suplementación
  const getBadgeConfig = (w: number) => {
    if (w >= 170) {
      return {
        label: 'Óptimo',
        color: isDark ? '#34d399' : '#107e3e',
        bg: isDark ? 'rgba(16, 126, 62, 0.16)' : '#e7f6ec',
        border: isDark ? 'rgba(16, 126, 62, 0.3)' : '#b0e4c1',
      };
    }
    if (w >= 150) {
      return {
        label: 'Adecuado',
        color: isDark ? '#60a5fa' : '#0a6ed1',
        bg: isDark ? 'rgba(10, 110, 209, 0.12)' : '#ebf4fc',
        border: isDark ? 'rgba(10, 110, 209, 0.25)' : '#c2def7',
      };
    }
    return {
      label: 'Bajo',
      color: isDark ? '#fb923c' : '#e6600d',
      bg: isDark ? 'rgba(230, 96, 13, 0.12)' : '#fff4ec',
      border: isDark ? 'rgba(230, 96, 13, 0.25)' : '#fed7aa',
    };
  };

  const badge = hasWeight ? getBadgeConfig(currentWeight!) : null;

  return (
    <TableCell sx={{ ...bodyCellStyle, minWidth: 155 }}>
      {hasWeight ? (
        <Stack direction="row" spacing={1} alignItems="center">
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '0.86rem', color: 'text.primary' }}>
              {currentWeight!.toFixed(1)} <span style={{ fontSize: '0.72rem', fontWeight: 500, color: '#64748b' }}>kg</span>
            </Typography>
            {(minW != null || maxW != null) && (
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem', display: 'block' }}>
                Rango: {minW ?? '-'} a {maxW ?? '-'} kg
              </Typography>
            )}
          </Box>
          {badge && (
            <Chip
              label={badge.label}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: '0.65rem',
                height: 19,
                borderRadius: '4px',
                bgcolor: badge.bg,
                color: badge.color,
                border: '1px solid',
                borderColor: badge.border,
              }}
            />
          )}
        </Stack>
      ) : (
        <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
          Sin pesaje
        </Typography>
      )}
    </TableCell>
  );
};

export default WeaningBatchWeightCell;
