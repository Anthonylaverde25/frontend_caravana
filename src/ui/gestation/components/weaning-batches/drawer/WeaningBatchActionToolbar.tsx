import React from 'react';
import { Box, Button, Stack } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

interface WeaningBatchActionToolbarProps {
  onClose: () => void;
  onNavigateToCaravans: () => void;
  calvesCount: number;
}

export const WeaningBatchActionToolbar: React.FC<WeaningBatchActionToolbarProps> = ({
  onClose,
  onNavigateToCaravans,
  calvesCount,
}) => {
  return (
    <Box
      sx={{
        p: 2,
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Stack direction="row" spacing={1.5} justifyContent="flex-end">
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px' }}
        >
          Cerrar
        </Button>
        <Button
          variant="contained"
          onClick={onNavigateToCaravans}
          startIcon={<FuseSvgIcon size={18}>heroicons-outline:identification</FuseSvgIcon>}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '6px',
            bgcolor: '#8b5cf6',
            '&:hover': { bgcolor: '#7c3aed' },
          }}
        >
          Gestionar Animales ({calvesCount})
        </Button>
      </Stack>
    </Box>
  );
};

export default WeaningBatchActionToolbar;
