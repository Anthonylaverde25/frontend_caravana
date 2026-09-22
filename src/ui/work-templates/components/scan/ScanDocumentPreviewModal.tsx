import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Stack,
  IconButton,
  Tooltip,
  Button,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  RotateRight as RotateRightIcon,
  RestartAlt as RestartAltIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

interface ScanDocumentPreviewModalProps {
  open: boolean;
  onClose: () => void;
  previewUrl: string | null;
  zoomLevel: number;
  rotation: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRotate: () => void;
  onReset: () => void;
}

export const ScanDocumentPreviewModal: React.FC<ScanDocumentPreviewModalProps> = ({
  open,
  onClose,
  previewUrl,
  zoomLevel,
  rotation,
  onZoomIn,
  onZoomOut,
  onRotate,
  onReset,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '8px',
          bgcolor: 'background.paper',
          maxHeight: '92vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: 1,
          borderColor: 'divider',
          py: 1.5,
          px: 2.5,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <VisibilityIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.05rem' }}>
            Vista Previa de Alta Resolución — Documento Original de Campo
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title="Acercar (Zoom In)">
            <IconButton onClick={onZoomIn}>
              <ZoomInIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Alejar (Zoom Out)">
            <IconButton onClick={onZoomOut}>
              <ZoomOutIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Rotar 90°">
            <IconButton onClick={onRotate}>
              <RotateRightIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Restablecer Vista">
            <IconButton onClick={onReset}>
              <RestartAltIcon />
            </IconButton>
          </Tooltip>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          p: 3,
          bgcolor: 'action.hover',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'auto',
          minHeight: '560px',
        }}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Document Full Preview"
            style={{
              maxWidth: '100%',
              maxHeight: '75vh',
              transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
              transformOrigin: 'center center',
              transition: 'transform 0.2s ease',
              border: '1px solid #cbd5e1',
              boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
              borderRadius: '4px',
            }}
          />
        ) : (
          <Typography color="text.secondary">No hay documento cargado para previsualizar</Typography>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          px: 3,
          borderTop: 1,
          borderColor: 'divider',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="caption" color="text.secondary">
          💡 Controles: Usa el zoom y rotación para cotejar los registros de la grilla interactiva contra los datos manuscritos originales.
        </Typography>
        <Button variant="contained" onClick={onClose} sx={{ borderRadius: '6px', fontWeight: 700, px: 3, textTransform: 'none' }}>
          Cerrar Previsualización
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScanDocumentPreviewModal;
