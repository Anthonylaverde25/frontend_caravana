import React, { useState, useMemo, useEffect } from 'react';
import { Popover, Box, Typography, Chip, alpha } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useNavigate } from 'react-router';
import {
  HeaderQuickAction,
  QUICK_ACTIONS_REGISTRY,
  QuickActionsTrigger,
  QuickActionsSearchBar,
  QuickActionsList,
} from './quick-actions';

export type { HeaderQuickAction };

export type QuickActionsMenuProps = {
  className?: string;
};

/**
 * Enterprise Header Quick Actions Menu Container for GANADERO v1.
 * Orchestrates keyboard listeners, search filter state, and popover presentation.
 */
export const QuickActionsMenu: React.FC<QuickActionsMenuProps> = ({ className = '' }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const open = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setSearchQuery('');
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSearchQuery('');
  };

  // Keyboard shortcut listener (Alt + A) to toggle menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setAnchorEl((prev) =>
          prev ? null : (document.getElementById('header-quick-actions-trigger') as HTMLElement)
        );
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectAction = (route: string) => {
    navigate(route);
    handleClose();
  };

  // Filter actions based on query
  const filteredActions = useMemo(() => {
    if (!searchQuery.trim()) return QUICK_ACTIONS_REGISTRY;
    const q = searchQuery.toLowerCase().trim();
    return QUICK_ACTIONS_REGISTRY.filter(
      (action) =>
        action.title.toLowerCase().includes(q) ||
        action.subtitle.toLowerCase().includes(q) ||
        action.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Group filtered actions by category
  const groupedActions = useMemo(() => {
    const groups: Record<string, HeaderQuickAction[]> = {};
    filteredActions.forEach((action) => {
      if (!groups[action.category]) {
        groups[action.category] = [];
      }
      groups[action.category].push(action);
    });
    return groups;
  }, [filteredActions]);

  return (
    <>
      <QuickActionsTrigger open={open} onClick={handleOpen} className={className} />

      <Popover
        id="header-quick-actions-popover"
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 380,
            maxWidth: '92vw',
            mt: 1,
            borderRadius: '12px',
            boxShadow:
              '0 12px 32px -4px rgba(0, 0, 0, 0.12), 0 8px 16px -4px rgba(0, 0, 0, 0.08)',
            border: (theme) => `1px solid ${theme.palette.divider}`,
            overflow: 'hidden',
          },
        }}
      >
        {/* Top Header */}
        <Box
          sx={{
            px: 2,
            pt: 1.8,
            pb: 1.2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.12),
                color: 'primary.main',
              }}
            >
              <FuseSvgIcon size={16}>heroicons-outline:chevron-double-down</FuseSvgIcon>
            </Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.875rem' }}>
              Acciones Rápidas
            </Typography>
          </Box>
          <Chip
            label="Alt + A"
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              fontWeight: 700,
              borderRadius: '4px',
              backgroundColor: (theme) => alpha(theme.palette.text.primary, 0.06),
              color: 'text.secondary',
            }}
          />
        </Box>

        {/* Search Bar */}
        <QuickActionsSearchBar value={searchQuery} onChange={setSearchQuery} />

        {/* Action List */}
        <QuickActionsList groupedActions={groupedActions} onSelectAction={handleSelectAction} />
      </Popover>
    </>
  );
};

export default QuickActionsMenu;
