import { AppBar, Box, Button, CircularProgress, IconButton, Toolbar, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useContrastTheme } from '@/contexts/ContrastThemeContext';

interface FullScreenEntryBarProps {
  title: string;
  subtitle: string;
  primaryLabel: string;
  primaryIcon: string;
  busy: boolean;
  onClose: () => void;
  onPrimary: () => void;
}

/**
 * Top bar of the full-screen entry sheets ("Cargar tacto", "Registrar partos"): close, cancel and
 * the primary action. The primary action is validated on click, never disabled for missing data.
 */
export default function FullScreenEntryBar({ title, subtitle, primaryLabel, primaryIcon, busy, onClose, onPrimary }: FullScreenEntryBarProps) {
  const { settings: contrast } = useContrastTheme();
  const barBg = (contrast.enabled && (contrast.headerBg || contrast.primaryButtonBg)) || 'primary.main';
  const barText = (contrast.enabled && contrast.headerBg && contrast.headerText) || 'common.white';

  return (
    <AppBar position="relative" elevation={0} sx={{ bgcolor: barBg, color: barText }}>
      <Toolbar sx={{ gap: 2 }}>
        <IconButton edge="start" color="inherit" onClick={onClose} aria-label="Cerrar">
          <FuseSvgIcon size={22}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }} noWrap>
            {title}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8, display: { xs: 'none', md: 'block' } }} noWrap>
            {subtitle}
          </Typography>
        </Box>
        <Button color="inherit" onClick={onClose} sx={{ textTransform: 'none', fontWeight: 600, display: { xs: 'none', sm: 'inline-flex' } }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="inherit"
          disableElevation
          onClick={onPrimary}
          disabled={busy}
          startIcon={busy ? <CircularProgress size={14} color="inherit" /> : <FuseSvgIcon size={16}>{primaryIcon}</FuseSvgIcon>}
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: '6px',
            // The inverse of the bar, so it reads on a light contrast header as well as on the green one.
            bgcolor: barText,
            color: barBg,
            '&:hover': { bgcolor: barText, opacity: 0.9 },
          }}
        >
          {primaryLabel}
        </Button>
      </Toolbar>
    </AppBar>
  );
}
