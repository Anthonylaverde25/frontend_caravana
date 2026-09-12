import React, { useState } from 'react';
import { Box, Typography, Tooltip, IconButton, Menu, MenuItem } from '@mui/material';
import { useSnackbar } from 'notistack';

interface FioriShellBarProps {
  currentFacility?: string;
  onSearchChange?: (query: string) => void;
}

export const FioriShellBar: React.FC<FioriShellBarProps> = ({
  currentFacility = 'Hacienda Principal (AR-01)',
  onSearchChange,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [facilityAnchor, setFacilityAnchor] = useState<null | HTMLElement>(null);
  const [selectedFacility, setSelectedFacility] = useState(currentFacility);
  const [searchVal, setSearchVal] = useState('');

  const handleFacilityClick = (e: React.MouseEvent<HTMLElement>) => {
    setFacilityAnchor(e.currentTarget);
  };

  const handleFacilitySelect = (facility: string) => {
    setSelectedFacility(facility);
    setFacilityAnchor(null);
    enqueueSnackbar(`Explotación cambiada a: ${facility}`, { variant: 'info' });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchVal(val);
    onSearchChange?.(val);
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <Box
      component="header"
      sx={{
        bgcolor: '#0f3e30',
        color: '#ffffff',
        height: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: { xs: 1.5, sm: 2 },
        zIndex: 30,
        flexShrink: 0,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
      }}
    >
      {/* Left: Navigation & Branding */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {/* Enterprise Bullmark Icon */}
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(255, 255, 255, 0.1)',
            color: '#6ee7b7',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.18)' },
          }}
          title="Navegador SAP S/4HANA"
        >
          <svg style={{ width: 20, height: 20 }} fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.5 5.5c-.83 0-1.54.5-1.84 1.22C16.2 6.27 14.22 6 12 6s-4.2.27-5.66.72A2.003 2.003 0 0 0 4.5 5.5C3.12 5.5 2 6.62 2 8c0 1.2.85 2.19 2 2.45v2.05C4 16.64 7.58 20 12 20s8-3.36 8-7.5v-2.05c1.15-.26 2-1.25 2-2.45 0-1.38-1.12-2.5-2.5-2.5zM4 8c0-.28.22-.5.5-.5s.5.22.5.5v1.22c-.59-.14-1-.44-1-.72v-.5zm16 0c0 .28-.41.58-1 .72V8c0-.28.22-.5.5-.5s.5.22.5.5zm-8 10.5c-3.58 0-6.5-2.69-6.5-6v-1.5c1.94-.48 4.31-.75 6.5-.75s4.56.27 6.5.75V12.5c0 3.31-2.92 6-6.5 6zm2.5-4c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5z" />
          </svg>
        </Box>

        {/* Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', letterSpacing: '0.02em', color: '#ffffff' }}>
            SAP S/4HANA
          </Typography>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.875rem' }}>|</Typography>
          <Typography sx={{ fontWeight: 600, fontSize: '0.84rem', color: 'rgba(255, 255, 255, 0.95)' }}>
            Dashboard Ganadero Integral
          </Typography>
        </Box>

        {/* Facility Selector */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1, pl: 2, ml: 1, borderLeft: '1px solid rgba(255,255,255,0.2)' }}>
          <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.65)' }}>Explotación:</Typography>
          <Box
            component="button"
            onClick={handleFacilityClick}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: 'rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '5px',
              px: 1.25,
              py: 0.5,
              color: '#ffffff',
              fontSize: '0.75rem',
              cursor: 'pointer',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.4)' },
            }}
          >
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#34d399' }} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>{selectedFacility}</Typography>
            <svg style={{ width: 14, height: 14, opacity: 0.7 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </Box>
          <Menu
            anchorEl={facilityAnchor}
            open={Boolean(facilityAnchor)}
            onClose={() => setFacilityAnchor(null)}
            slotProps={{ paper: { sx: { borderRadius: '8px', mt: 0.5, minWidth: 200 } } }}
          >
            <MenuItem onClick={() => handleFacilitySelect('Hacienda Principal (AR-01)')} sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
              Hacienda Principal (AR-01)
            </MenuItem>
            <MenuItem onClick={() => handleFacilitySelect('Estancia Las Palmas (AR-02)')} sx={{ fontSize: '0.8rem' }}>
              Estancia Las Palmas (AR-02)
            </MenuItem>
            <MenuItem onClick={() => handleFacilitySelect('Cabaña San José (AR-03)')} sx={{ fontSize: '0.8rem' }}>
              Cabaña San José (AR-03)
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Right: Search & Actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Search */}
        <Box sx={{ position: 'relative', display: { xs: 'none', lg: 'block' }, width: 230 }}>
          <Box
            component="input"
            value={searchVal}
            onChange={handleSearch}
            placeholder="Buscar lote, caravana o registro..."
            sx={{
              width: '100%',
              bgcolor: 'rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              fontSize: '0.75rem',
              borderRadius: '5px',
              px: 1.25,
              py: 0.6,
              pl: 3.5,
              border: '1px solid rgba(255, 255, 255, 0.12)',
              outline: 'none',
              '&::placeholder': { color: 'rgba(255, 255, 255, 0.6)' },
              '&:focus': { bgcolor: 'rgba(255, 255, 255, 0.22)', borderColor: '#34d399' },
            }}
          />
          <svg
            style={{ width: 14, height: 14, position: 'absolute', left: 10, top: 9, color: 'rgba(255,255,255,0.6)' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </Box>

        {/* Quick Icon: FullScreen */}
        <Tooltip title="Pantalla completa">
          <IconButton onClick={toggleFullScreen} size="small" sx={{ color: 'rgba(255,255,255,0.85)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
            <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </IconButton>
        </Tooltip>

        {/* Quick Icon: Notifications */}
        <Tooltip title="Notificaciones del sistema">
          <Box sx={{ position: 'relative' }}>
            <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.85)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
              <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </IconButton>
            <Box sx={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, bgcolor: '#f59e0b', borderRadius: '50%' }} />
          </Box>
        </Tooltip>

        {/* User profile avatar */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 1, borderLeft: '1px solid rgba(255,255,255,0.2)' }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              bgcolor: '#047857',
              border: '1px solid #34d399',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#ffffff',
            }}
          >
            GP
          </Box>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#ffffff', display: { xs: 'none', sm: 'inline-block' } }}>
            G. Pereyra (Admin)
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default FioriShellBar;
