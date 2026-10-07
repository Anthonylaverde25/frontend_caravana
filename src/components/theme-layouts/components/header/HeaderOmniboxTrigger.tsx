import React, { useState, useEffect } from 'react';
import { Box, Button, IconButton, Tooltip, Typography, alpha } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import GlobalSearchDialog from './GlobalSearchDialog';
import { useContrastTheme } from '@/contexts/ContrastThemeContext';

type HeaderOmniboxTriggerProps = {
  className?: string;
};

export const HeaderOmniboxTrigger: React.FC<HeaderOmniboxTriggerProps> = ({ className = '' }) => {
  const [open, setOpen] = useState(false);
  const { settings: contrastSettings } = useContrastTheme();

  const isContrastActive = contrastSettings.enabled;
  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const shortcutLabel = isMac ? '⌘K' : 'Ctrl+K';

  // Global keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Desktop trigger pill */}
      <Box
        className={`hidden md:flex items-center ${className}`}
        sx={{
          flex: 1,
          maxWidth: 420,
          mx: { md: 1, lg: 2 },
        }}
      >
        <Button
          id="header-omnisearch-trigger"
          onClick={() => setOpen(true)}
          fullWidth
          variant="text"
          startIcon={
            <FuseSvgIcon size={16} color="action">
              heroicons-outline:magnifying-glass
            </FuseSvgIcon>
          }
          endIcon={
            <Box
              component="span"
              sx={{
                fontSize: '0.65rem',
                fontWeight: 700,
                lineHeight: '1',
                px: 0.8,
                py: 0.4,
                borderRadius: '5px',
                border: (theme) => `1px solid ${theme.palette.divider}`,
                backgroundColor: (theme) => alpha(theme.palette.action.hover, 0.4),
                color: 'text.secondary',
              }}
            >
              {shortcutLabel}
            </Box>
          }
          sx={{
            justifyContent: 'space-between',
            textTransform: 'none',
            fontSize: '0.8rem',
            fontWeight: 500,
            py: 0.5,
            px: 1.5,
            height: 32,
            borderRadius: '8px',
            backgroundColor: (theme) =>
              isContrastActive
                ? alpha(theme.palette.common.white, 0.08)
                : alpha(theme.palette.action.hover, 0.5),
            border: (theme) =>
              `1px solid ${
                isContrastActive
                  ? alpha(theme.palette.common.white, 0.15)
                  : alpha(theme.palette.divider, 0.8)
              }`,
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: (theme) =>
                isContrastActive
                  ? alpha(theme.palette.common.white, 0.12)
                  : alpha(theme.palette.action.hover, 0.8),
              borderColor: 'primary.main',
            },
          }}
        >
          <Typography
            component="span"
            variant="body2"
            sx={{
              fontSize: '0.8rem',
              color: 'text.secondary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            Buscar caravana, lote u orden...
          </Typography>
        </Button>
      </Box>

      {/* Mobile trigger icon button */}
      <Box className="flex md:hidden">
        <Tooltip title={`Buscar (${shortcutLabel})`} placement="bottom">
          <IconButton
            id="header-omnisearch-mobile-btn"
            onClick={() => setOpen(true)}
            size="small"
            className="h-8 w-8 p-0"
          >
            <FuseSvgIcon size={18}>heroicons-outline:magnifying-glass</FuseSvgIcon>
          </IconButton>
        </Tooltip>
      </Box>

      {/* Omnibox Command Palette Dialog */}
      <GlobalSearchDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default HeaderOmniboxTrigger;
