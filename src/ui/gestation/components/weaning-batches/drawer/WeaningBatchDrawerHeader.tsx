import React from 'react';
import { Box, Typography, IconButton, Chip } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Batch } from '@/core/batches/domain/entities/Batch';

interface WeaningBatchDrawerHeaderProps {
  batch: Batch | null;
  onClose: () => void;
}

export const WeaningBatchDrawerHeader: React.FC<WeaningBatchDrawerHeaderProps> = ({
  batch,
  onClose,
}) => {
  const isActive = batch?.isActive() ?? true;

  return (
    <Box
      sx={{
        p: 2.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '8px',
            bgcolor: 'rgba(139, 92, 246, 0.12)',
            color: '#8b5cf6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <FuseSvgIcon size={20}>heroicons-outline:clock</FuseSvgIcon>
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" noWrap sx={{ fontSize: '1.05rem', fontWeight: 700 }}>
              {batch?.name || 'Lote de Destete'}
            </Typography>
            <Chip
              label={isActive ? 'Activo' : 'Concluido'}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.68rem',
                fontWeight: 700,
                borderRadius: '4px',
                bgcolor: isActive ? 'rgba(16, 126, 62, 0.12)' : 'action.hover',
                color: isActive ? '#107e3e' : 'text.secondary',
              }}
            />
          </Box>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            ID #{batch?.id ?? '-'} {batch?.farm_name ? `• ${batch.farm_name}` : ''}
          </Typography>
        </Box>
      </Box>

      <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
        <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
      </IconButton>
    </Box>
  );
};

export default WeaningBatchDrawerHeader;
