import React from 'react';
import {
  List,
  Box,
  Typography,
  Divider,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  alpha,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { HeaderQuickAction } from './types';

interface QuickActionsListProps {
  groupedActions: Record<string, HeaderQuickAction[]>;
  onSelectAction: (route: string) => void;
}

export const QuickActionsList: React.FC<QuickActionsListProps> = ({
  groupedActions,
  onSelectAction,
}) => {
  const categories = Object.keys(groupedActions);

  if (categories.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          No se encontraron acciones coincidentes.
        </Typography>
      </Box>
    );
  }

  return (
    <List
      sx={{
        py: 0.5,
        px: 1,
        maxHeight: 420,
        overflowY: 'auto',
      }}
    >
      {Object.entries(groupedActions).map(([category, actions], groupIndex) => (
        <Box key={category} sx={{ mb: 1 }}>
          {groupIndex > 0 && <Divider sx={{ my: 0.8, opacity: 0.6 }} />}
          <Typography
            variant="caption"
            sx={{
              px: 1.5,
              py: 0.5,
              display: 'block',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontSize: '0.65rem',
              color: 'text.secondary',
            }}
          >
            {category}
          </Typography>

          {actions.map((action) => (
            <ListItemButton
              key={action.id}
              onClick={() => onSelectAction(action.route)}
              sx={{
                borderRadius: '8px',
                py: 0.8,
                px: 1.5,
                my: 0.2,
                transition: 'all 0.15s ease',
                '&:hover': {
                  backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                  transform: 'translateX(2px)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 42 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: alpha(action.color, 0.12),
                    color: action.color,
                  }}
                >
                  <FuseSvgIcon size={18}>{action.icon}</FuseSvgIcon>
                </Box>
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                      {action.title}
                    </Typography>
                    {action.shortcut && (
                      <Typography
                        variant="caption"
                        sx={{
                          px: 0.6,
                          py: 0.1,
                          fontSize: '0.625rem',
                          fontWeight: 700,
                          borderRadius: '3px',
                          border: (theme) => `1px solid ${theme.palette.divider}`,
                          color: 'text.disabled',
                        }}
                      >
                        {action.shortcut}
                      </Typography>
                    )}
                  </Box>
                }
                secondary={
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.72rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {action.subtitle}
                  </Typography>
                }
              />
            </ListItemButton>
          ))}
        </Box>
      ))}
    </List>
  );
};
