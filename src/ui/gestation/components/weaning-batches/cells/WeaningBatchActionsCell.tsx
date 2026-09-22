import React from 'react';
import { TableCell, Stack, Tooltip, IconButton } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Batch } from '@/core/batches/domain/entities/Batch';

interface WeaningBatchActionsCellProps {
  batch: Batch;
  isDark: boolean;
  bodyCellStyle: Record<string, any>;
  onViewCaravans: (batchId: number) => void;
  onOpenDetailDrawer: (batch: Batch) => void;
}

export const WeaningBatchActionsCell: React.FC<WeaningBatchActionsCellProps> = ({
  batch,
  bodyCellStyle,
  onViewCaravans,
  onOpenDetailDrawer,
}) => {
  return (
    <TableCell sx={{ ...bodyCellStyle, width: 95, textAlign: 'center', borderRight: 0 }}>
      <Stack direction="row" spacing={0.5} justifyContent="center">
        <Tooltip title="Ver animales del lote de destete (/caravans)" arrow>
          <IconButton
            size="small"
            onClick={() => onViewCaravans(batch.id)}
            sx={{
              color: 'text.secondary',
              '&:hover': { color: 'primary.main', bgcolor: 'action.hover' },
            }}
          >
            <FuseSvgIcon size={18}>heroicons-outline:identification</FuseSvgIcon>
          </IconButton>
        </Tooltip>

        <Tooltip title="Ficha técnica e inspección zootécnica" arrow>
          <IconButton
            size="small"
            onClick={() => onOpenDetailDrawer(batch)}
            sx={{
              color: 'text.secondary',
              '&:hover': { color: '#8b5cf6', bgcolor: 'rgba(139, 92, 246, 0.08)' },
            }}
          >
            <FuseSvgIcon size={18}>heroicons-outline:eye</FuseSvgIcon>
          </IconButton>
        </Tooltip>
      </Stack>
    </TableCell>
  );
};

export default WeaningBatchActionsCell;
