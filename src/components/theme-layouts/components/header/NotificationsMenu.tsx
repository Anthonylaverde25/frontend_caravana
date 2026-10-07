import React, { useState } from 'react';
import {
  IconButton,
  Badge,
  Popover,
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
  alpha,
  Tooltip,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useNavigate } from 'react-router';

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'success';
  link?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Plantilla OCR Digitalizada',
    description: 'La orden de ingreso ING-03 se extrajo y validó con éxito.',
    time: 'Hace 10 min',
    read: false,
    type: 'success',
    link: '/work-templates/scan',
  },
  {
    id: 'notif-2',
    title: 'Alerta Sanitaria de Rodeo',
    description: '3 vientres en Rodeo General requieren revisión de tacto.',
    time: 'Hace 45 min',
    read: false,
    type: 'warning',
    link: '/gestation/tacto',
  },
  {
    id: 'notif-3',
    title: 'Pesaje Sincronizado',
    description: '42 animales actualizados desde la sesión de pesaje.',
    time: 'Hace 2 horas',
    read: true,
    type: 'info',
    link: '/caravans',
  },
];

type NotificationsMenuProps = {
  className?: string;
};

export const NotificationsMenu: React.FC<NotificationsMenuProps> = ({ className = '' }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const navigate = useNavigate();

  const open = Boolean(anchorEl);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const handleItemClick = (item: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );
    if (item.link) {
      navigate(item.link);
      handleClose();
    }
  };

  const getTypeIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'success':
        return (
          <FuseSvgIcon size={18} color="success">
            heroicons-outline:check-circle
          </FuseSvgIcon>
        );
      case 'warning':
        return (
          <FuseSvgIcon size={18} color="warning">
            heroicons-outline:exclamation
          </FuseSvgIcon>
        );
      case 'info':
      default:
        return (
          <FuseSvgIcon size={18} color="info">
            heroicons-outline:information-circle
          </FuseSvgIcon>
        );
    }
  };

  return (
    <>
      <Tooltip title="Notificaciones del sistema" placement="bottom">
        <IconButton
          id="header-notifications-btn"
          onClick={handleClick}
          className={`h-8 w-8 p-0 ${className}`}
          size="small"
          aria-label="notificaciones"
        >
          <Badge
            badgeContent={unreadCount}
            color="error"
            variant={unreadCount > 0 ? 'standard' : 'dot'}
            invisible={unreadCount === 0}
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.65rem',
                height: 16,
                minWidth: 16,
                padding: '0 4px',
              },
            }}
          >
            <FuseSvgIcon size={19}>heroicons-outline:bell</FuseSvgIcon>
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        id="header-notifications-popover"
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
            width: 340,
            maxWidth: '90vw',
            mt: 1,
            borderRadius: '12px',
            boxShadow:
              '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            border: (theme) => `1px solid ${theme.palette.divider}`,
            overflow: 'hidden',
          },
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Notificaciones
            </Typography>
            {unreadCount > 0 && (
              <Box
                sx={{
                  px: 0.8,
                  py: 0.2,
                  borderRadius: '10px',
                  backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.12),
                  color: 'primary.main',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                }}
              >
                {unreadCount} nuevas
              </Box>
            )}
          </Box>
          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={handleMarkAllAsRead}
              sx={{ textTransform: 'none', fontSize: '0.75rem', p: 0.5 }}
            >
              Marcar leídas
            </Button>
          )}
        </Box>

        <List sx={{ p: 0, maxHeight: 340, overflowY: 'auto' }}>
          {notifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No tienes notificaciones pendientes
              </Typography>
            </Box>
          ) : (
            notifications.map((item, index) => (
              <React.Fragment key={item.id}>
                <ListItem
                  disablePadding
                >
                  <ListItemButton
                    onClick={() => handleItemClick(item)}
                    sx={{
                      px: 2,
                      py: 1.5,
                      backgroundColor: item.read
                        ? 'transparent'
                        : (theme) => alpha(theme.palette.primary.main, 0.04),
                      transition: 'background-color 0.15s ease',
                      '&:hover': {
                        backgroundColor: (theme) => alpha(theme.palette.action.hover, 0.08),
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      {getTypeIcon(item.type)}
                    </ListItemIcon>
                    <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: item.read ? 500 : 700,
                            fontSize: '0.82rem',
                          }}
                        >
                          {item.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: '0.68rem', ml: 1, whiteSpace: 'nowrap' }}
                        >
                          {item.time}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          mt: 0.3,
                        }}
                      >
                        {item.description}
                      </Typography>
                    }
                  />
                  </ListItemButton>
                </ListItem>
                {index < notifications.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))
          )}
        </List>
      </Popover>
    </>
  );
};

export default NotificationsMenu;
