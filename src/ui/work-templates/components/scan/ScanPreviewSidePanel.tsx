import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Stack,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  RotateRight as RotateRightIcon,
  Fullscreen as FullscreenIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';

interface ScanPreviewSidePanelProps {
  previewUrl: string;
  zoomLevel: number;
  rotation: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRotate: () => void;
  onOpenModal: () => void;
  onHide: () => void;
}

export const ScanPreviewSidePanel: React.FC<ScanPreviewSidePanelProps> = ({
  previewUrl,
  zoomLevel,
  rotation,
  onZoomIn,
  onZoomOut,
  onRotate,
  onOpenModal,
  onHide,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Paper
      elevation={0}
      sx={{
        flex: { xs: '1 1 100%', lg: '0 0 420px' },
        width: { xs: '100%', lg: '420px' },
        border: '1px solid',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
        borderRadius: '8px',
        p: 2,
        bgcolor: 'background.paper',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        position: 'sticky',
        top: 24,
        maxHeight: 'calc(100vh - 120px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1.5,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
          Documento Original Escaneado
        </Typography>
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Acercar">
            <IconButton size="small" onClick={onZoomIn}>
              <ZoomInIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Alejar">
            <IconButton size="small" onClick={onZoomOut}>
              <ZoomOutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Rotar 90°">
            <IconButton size="small" onClick={onRotate}>
              <RotateRightIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Pantalla Completa (Lupa)">
            <IconButton size="small" color="primary" onClick={onOpenModal}>
              <FullscreenIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Ocultar Panel">
            <IconButton size="small" onClick={onHide}>
              <VisibilityOffIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Clickable Image Thumbnail Container */}
      <Box
        onClick={onOpenModal}
        sx={{
          flex: 1,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
          borderRadius: '6px',
          bgcolor: 'action.hover',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          position: 'relative',
          cursor: 'pointer',
          '&:hover .preview-overlay': {
            opacity: 1,
          },
        }}
      >
        <img
          src={previewUrl}
          alt="Document Preview"
          style={{
            maxWidth: '100%',
            transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
            transformOrigin: 'center center',
            transition: 'transform 0.2s ease',
          }}
        />
        {/* Overlay on hover */}
        <Box
          className="preview-overlay"
          sx={{
            position: 'absolute',
            inset: 0,
            bgcolor: 'rgba(0, 0, 0, 0.45)',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            opacity: 0,
            transition: 'opacity 0.2s ease',
          }}
        >
          <FullscreenIcon sx={{ fontSize: 36 }} />
          <Typography variant="body2" sx={{ fontWeight: 800 }}>
            Clic para ampliar en Modal Preview
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default ScanPreviewSidePanel;
