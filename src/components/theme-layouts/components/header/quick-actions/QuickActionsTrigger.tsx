import React from 'react';
import { Box, Button, IconButton, Tooltip, alpha } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

interface QuickActionsTriggerProps {
  open: boolean;
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
  className?: string;
}

export const QuickActionsTrigger: React.FC<QuickActionsTriggerProps> = ({
  open,
  onClick,
  className = '',
}) => {
  return (
    <Tooltip title="Acciones Rápidas (Alt+A)" placement="bottom">
      <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
        {/* Desktop Trigger: Sleek Minimalist Pill Button */}
        <Button
          id="header-quick-actions-trigger"
          onClick={onClick}
          size="small"
          variant="text"
          className={className}
          startIcon={
            <FuseSvgIcon size={16} sx={{ color: 'primary.main' }}>
              heroicons-outline:chevron-double-down
            </FuseSvgIcon>
          }
          sx={{
            display: { xs: 'none', sm: 'inline-flex' },
            height: 32,
            px: 1.5,
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '0.8125rem',
            backgroundColor: (theme) =>
              open
                ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.08 : 0.05)
                : theme.palette.mode === 'dark'
                  ? alpha(theme.palette.common.white, 0.03)
                  : alpha(theme.palette.common.black, 0.02),
            color: 'text.primary',
            border: '1px solid',
            borderColor: (theme) =>
              open ? alpha(theme.palette.primary.main, 0.25) : theme.palette.divider,
            transition: (theme) =>
              theme.transitions.create(['background-color', 'border-color'], {
                duration: theme.transitions.duration.shorter,
              }),
            '&:hover': {
              backgroundColor: (theme) =>
                alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.08 : 0.05),
              borderColor: (theme) => alpha(theme.palette.primary.main, 0.25),
            },
          }}
        >
          Acciones
        </Button>

        {/* Mobile Trigger: Compact Minimalist Icon Button */}
        <IconButton
          id="header-quick-actions-mobile-trigger"
          onClick={onClick}
          size="small"
          className={`h-8 w-8 p-0 ${className}`}
          sx={{
            display: { xs: 'inline-flex', sm: 'none' },
            borderRadius: '8px',
            backgroundColor: (theme) =>
              open
                ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.08 : 0.05)
                : theme.palette.mode === 'dark'
                  ? alpha(theme.palette.common.white, 0.03)
                  : alpha(theme.palette.common.black, 0.02),
            border: '1px solid',
            borderColor: (theme) =>
              open ? alpha(theme.palette.primary.main, 0.25) : theme.palette.divider,
            transition: (theme) =>
              theme.transitions.create(['background-color', 'border-color'], {
                duration: theme.transitions.duration.shorter,
              }),
            '&:hover': {
              backgroundColor: (theme) =>
                alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.08 : 0.05),
              borderColor: (theme) => alpha(theme.palette.primary.main, 0.25),
            },
          }}
        >
          <FuseSvgIcon size={16} sx={{ color: 'primary.main' }}>
            heroicons-outline:chevron-double-down
          </FuseSvgIcon>
        </IconButton>
      </Box>
    </Tooltip>
  );
};
