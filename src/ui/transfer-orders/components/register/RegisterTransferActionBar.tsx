import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

interface RegisterTransferActionBarProps {
  selectedCount: number;
  blockedReason: string | null;
  isPending: boolean;
  onRegister: () => void;
}

/** One action, and when it cannot be taken yet, the reason in words next to it. */
export const RegisterTransferActionBar: React.FC<RegisterTransferActionBarProps> = ({
  selectedCount,
  blockedReason,
  isPending,
  onRegister
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
    {blockedReason && (
      <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 320, textAlign: 'right', lineHeight: 1.3 }}>
        {blockedReason}
      </Typography>
    )}
    <Button
      variant="contained"
      disableElevation
      disabled={blockedReason !== null || isPending}
      onClick={onRegister}
      startIcon={<FuseSvgIcon size={18}>heroicons-outline:clipboard-document-check</FuseSvgIcon>}
      sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px', px: 2.5, '&.Mui-disabled': { opacity: 0.45 } }}
    >
      {selectedCount > 0 ? `Registrar transferencia (${selectedCount})` : 'Registrar transferencia'}
    </Button>
  </Box>
);

export default RegisterTransferActionBar;
