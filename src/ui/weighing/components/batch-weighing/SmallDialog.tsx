import { ReactNode } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, IconButton, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

interface SmallDialogProps {
  open: boolean;
  title: string;
  confirmLabel?: string;
  onClose: () => void;
  onConfirm?: () => void;
  children?: ReactNode;
}

/** A secondary dialog over the weighing one, with the app's modal tokens. */
export function SmallDialog({ open, title, confirmLabel, onClose, onConfirm, children }: SmallDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{ sx: { borderRadius: '8px', boxShadow: 1, bgcolor: 'background.paper' } }}
    >
      <Box sx={{ p: 2, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'text.primary' }}>
          {title}
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'primary.main' }}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </Box>
      <DialogContent sx={{ p: 3, minHeight: 96 }}>{children}</DialogContent>
      <DialogActions sx={{ p: 2, px: 3, bgcolor: 'background.default', borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={onClose} variant="text" sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}>
          Cancelar
        </Button>
        {onConfirm && (
          <Button
            onClick={onConfirm}
            variant="contained"
            sx={{ bgcolor: 'primary.main', px: 3.5, fontWeight: 700, borderRadius: '6px', textTransform: 'none', boxShadow: 'none', '&:hover': { bgcolor: 'primary.dark' } }}
          >
            {confirmLabel ?? 'Guardar'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
