import React from 'react';
import { Box, Typography, Chip, useTheme } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

export const BibliographicCitationCard: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        p: 1.75,
        borderRadius: '8px',
        bgcolor: isDark ? 'rgba(30, 58, 138, 0.25)' : '#eff6ff',
        border: '1px solid',
        borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#bfdbfe',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <FuseSvgIcon size={20} color="primary">heroicons-outline:book-open</FuseSvgIcon>
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: isDark ? '#93c5fd' : '#1e40af', display: 'block' }}>
            Bibliografía Oficial de Referencia:
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
            <em>"Manejo de un Rodeo de Cría"</em> — Ing. Jorge Carrillo (INTA Balcarce). Cap. II: Estacionamiento del Servicio (PDF Págs. 30, 38-41).
          </Typography>
        </Box>
      </Box>
      <Chip
        label="INTA Balcarce"
        size="small"
        sx={{
          fontWeight: 700,
          fontSize: '0.68rem',
          bgcolor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe',
          color: isDark ? '#93c5fd' : '#1e40af',
        }}
      />
    </Box>
  );
};

export default BibliographicCitationCard;
