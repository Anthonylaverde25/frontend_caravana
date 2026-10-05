import React from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, Typography } from '@mui/material';

interface DiscardChangesDialogProps {
  open: boolean;
  /** What would be lost, in one sentence: "Se pierden las 12 caravanas cargadas." */
  detail: string;
  onKeep: () => void;
  onDiscard: () => void;
}

/**
 * Asked before closing a dialog with work in it. Escape or a click outside used to close "Cargar
 * DTE" and lose every caravan typed; now the user decides. The safe answer is the main button.
 */
export const DiscardChangesDialog: React.FC<DiscardChangesDialogProps> = ({ open, detail, onKeep, onDiscard }) => (
  <Dialog open={open} onClose={onKeep} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '8px', boxShadow: 1 } }}>
    <Box sx={{ p: 2, px: 3, borderBottom: 1, borderColor: 'divider' }}>
      <Typography variant="h6" sx={{ fontSize: '1.05rem', fontWeight: 600 }}>
        ¿Descartar lo cargado?
      </Typography>
    </Box>
    <DialogContent sx={{ p: 3 }}>
      <Typography variant="body2">{detail}</Typography>
    </DialogContent>
    <DialogActions sx={{ p: 2, px: 3, bgcolor: 'background.default', borderTop: 1, borderColor: 'divider', gap: 1.5 }}>
      <Button onClick={onDiscard} color="error" sx={{ fontWeight: 600, textTransform: 'none' }}>
        Descartar
      </Button>
      <Button variant="contained" disableElevation onClick={onKeep} autoFocus sx={{ px: 3, fontWeight: 700, borderRadius: '6px', textTransform: 'none' }}>
        Seguir cargando
      </Button>
    </DialogActions>
  </Dialog>
);

export default DiscardChangesDialog;
