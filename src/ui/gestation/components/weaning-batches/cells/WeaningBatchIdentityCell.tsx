import React from 'react';
import { TableCell, Stack, Avatar, Box, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Batch } from '@/core/batches/domain/entities/Batch';

interface WeaningBatchIdentityCellProps {
  batch: Batch;
  isDark: boolean;
  bodyCellStyle: Record<string, any>;
  onOpenDetailDrawer: (batch: Batch) => void;
}

export const WeaningBatchIdentityCell: React.FC<WeaningBatchIdentityCellProps> = ({
  batch,
  isDark,
  bodyCellStyle,
  onOpenDetailDrawer,
}) => {
  return (
    <TableCell sx={{ ...bodyCellStyle, minWidth: 230 }}>
      <Stack direction="row" spacing={1.25} alignItems="center">
        <Avatar
          variant="rounded"
          sx={{
            width: 34,
            height: 34,
            bgcolor: isDark ? 'rgba(139, 92, 246, 0.16)' : '#f5f3ff',
            color: isDark ? '#a78bfa' : '#8b5cf6',
            border: '1px solid',
            borderColor: isDark ? 'rgba(139, 92, 246, 0.3)' : '#ddd6fe',
            borderRadius: '6px',
          }}
        >
          <FuseSvgIcon size={18}>heroicons-outline:clock</FuseSvgIcon>
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="subtitle2"
            onClick={() => onOpenDetailDrawer(batch)}
            sx={{
              fontWeight: 700,
              fontSize: '0.84rem',
              color: 'text.primary',
              cursor: 'pointer',
              '&:hover': { color: '#8b5cf6', textDecoration: 'underline' },
            }}
          >
            {batch.name}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', display: 'block' }}>
            LOTE #{batch.id} {batch.farm_name ? `• ${batch.farm_name}` : ''}
          </Typography>
        </Box>
      </Stack>
    </TableCell>
  );
};

export default WeaningBatchIdentityCell;
