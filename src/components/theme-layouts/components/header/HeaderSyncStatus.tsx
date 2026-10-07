import React, { useState, useEffect } from 'react';
import { Box, Tooltip, Typography } from '@mui/material';

type HeaderSyncStatusProps = {
  className?: string;
};

/**
 * HeaderSyncStatus
 * Displays real-time connectivity & database sync state for field and office operations.
 */
export const HeaderSyncStatus: React.FC<HeaderSyncStatusProps> = ({ className = '' }) => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <Tooltip
      title={
        isOnline
          ? 'Sistema en línea — Base de datos sincronizada'
          : 'Sin conexión a internet — Modo offline activo'
      }
      placement="bottom"
      arrow
    >
      <Box
        className={`flex items-center gap-1.5 px-2 py-1 rounded-full cursor-pointer transition-colors ${className}`}
        sx={{
          backgroundColor: isOnline ? 'rgba(46, 125, 50, 0.08)' : 'rgba(211, 47, 47, 0.1)',
          '&:hover': {
            backgroundColor: isOnline ? 'rgba(46, 125, 50, 0.16)' : 'rgba(211, 47, 47, 0.18)',
          },
        }}
      >
        <Box
          sx={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            backgroundColor: isOnline ? '#2e7d32' : '#d32f2f',
            boxShadow: isOnline
              ? '0 0 6px rgba(46, 125, 50, 0.8)'
              : '0 0 6px rgba(211, 47, 47, 0.8)',
          }}
        />
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            fontSize: '0.7rem',
            color: isOnline ? '#2e7d32' : '#d32f2f',
            display: { xs: 'none', md: 'inline' },
          }}
        >
          {isOnline ? 'En línea' : 'Offline'}
        </Typography>
      </Box>
    </Tooltip>
  );
};

export default HeaderSyncStatus;
