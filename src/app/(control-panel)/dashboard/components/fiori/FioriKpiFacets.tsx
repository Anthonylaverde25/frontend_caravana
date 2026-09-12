import React from 'react';
import { Box, Typography } from '@mui/material';
import { DashboardKPIs } from '../cards/DashboardSummaryCards';

interface FioriKpiFacetsProps {
  kpis: DashboardKPIs;
  onServiceClick?: () => void;
  onQuarantineClick?: () => void;
}

export const FioriKpiFacets: React.FC<FioriKpiFacetsProps> = ({
  kpis,
  onServiceClick,
  onQuarantineClick,
}) => {
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        px: { xs: 2, sm: 3.5 },
        py: 2,
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          lg: 'repeat(4, 1fr)',
        },
        gap: { xs: 2, lg: 0 },
      }}
    >
      {/* Facet 1: Cuarentena & Sanidad */}
      <Box
        onClick={onQuarantineClick}
        sx={{
          py: 0.5,
          px: { xs: 1, lg: 3 },
          borderRight: { lg: '1px solid' },
          borderColor: { lg: 'divider' },
          cursor: onQuarantineClick ? 'pointer' : 'default',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography
            sx={{
              fontSize: '0.68rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'text.secondary',
            }}
          >
            Cuarentena &amp; Sanidad
          </Typography>
          <Box
            sx={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#fee2e2',
              color: '#b91c1c',
            }}
          >
            <svg style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </Box>
        </Box>
        <Box sx={{ mt: 0.75, display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <Typography sx={{ fontSize: '1.55rem', fontWeight: 800, color: 'text.primary', lineHeight: 1 }}>
            {kpis.quarantineCount}
          </Typography>
          <Box
            component="span"
            sx={{
              fontSize: '0.68rem',
              fontWeight: 700,
              color: '#b91c1c',
              bgcolor: '#fef2f2',
              border: '1px solid #fecaca',
              px: 0.8,
              py: 0.2,
              borderRadius: '4px',
            }}
          >
            Alerta Activa
          </Box>
        </Box>
        <Box sx={{ mt: 0.75, display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#dc2626' }} />
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#dc2626' }}>
            {kpis.quarantineCritical} caso crítico en aislamiento
          </Typography>
        </Box>
      </Box>

      {/* Facet 2: Entore en Servicio (Cría) */}
      <Box
        onClick={onServiceClick}
        sx={{
          py: 0.5,
          px: { xs: 1, lg: 3 },
          borderRight: { lg: '1px solid' },
          borderColor: { lg: 'divider' },
          cursor: onServiceClick ? 'pointer' : 'default',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography
            sx={{
              fontSize: '0.68rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'text.secondary',
            }}
          >
            Entore en Servicio (Cría)
          </Typography>
          <Box
            sx={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#d1fae5',
              color: '#047857',
            }}
          >
            <svg style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </Box>
        </Box>
        <Box sx={{ mt: 0.75, display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <Typography sx={{ fontSize: '1.55rem', fontWeight: 800, color: 'text.primary', lineHeight: 1 }}>
            {kpis.serviceBatchesCount} Lotes
          </Typography>
          <Box
            component="span"
            sx={{
              fontSize: '0.68rem',
              fontWeight: 700,
              color: '#065f46',
              bgcolor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              px: 0.8,
              py: 0.2,
              borderRadius: '4px',
            }}
          >
            En Campaña
          </Box>
        </Box>
        <Typography sx={{ mt: 0.75, fontSize: '0.72rem', color: 'text.secondary' }}>
          <Box component="strong" sx={{ color: 'text.primary', fontWeight: 700 }}>
            {kpis.serviceFemales} ♀ · {kpis.serviceMales} ♂
          </Box>{' '}
          (Ratio {kpis.serviceRatio}%{' '}
          <Box component="span" sx={{ color: '#047857', fontWeight: 700 }}>
            Óptimo
          </Box>
          )
        </Typography>
      </Box>

      {/* Facet 3: Consumo Interno (Faena) */}
      <Box
        sx={{
          py: 0.5,
          px: { xs: 1, lg: 3 },
          borderRight: { lg: '1px solid' },
          borderColor: { lg: 'divider' },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography
            sx={{
              fontSize: '0.68rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'text.secondary',
            }}
          >
            Consumo Interno (Faena)
          </Typography>
          <Box
            sx={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#dbeafe',
              color: '#1d4ed8',
            }}
          >
            <svg style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </Box>
        </Box>
        <Box sx={{ mt: 0.75, display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <Typography sx={{ fontSize: '1.55rem', fontWeight: 800, color: 'text.primary', lineHeight: 1 }}>
            {kpis.consumptionCount} Animales
          </Typography>
          <Box
            component="span"
            sx={{
              fontSize: '0.68rem',
              fontWeight: 700,
              color: '#1e40af',
              bgcolor: '#eff6ff',
              border: '1px solid #bfdbfe',
              px: 0.8,
              py: 0.2,
              borderRadius: '4px',
            }}
          >
            Mes Corriente
          </Box>
        </Box>
        <Typography sx={{ mt: 0.75, fontSize: '0.72rem', color: 'text.secondary' }}>
          <Box component="strong" sx={{ color: 'text.primary', fontWeight: 700 }}>
            {kpis.consumptionKg.toLocaleString()} kg
          </Box>{' '}
          listos para personal
        </Typography>
      </Box>

      {/* Facet 4: Bajas & Mortandad */}
      <Box sx={{ py: 0.5, px: { xs: 1, lg: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography
            sx={{
              fontSize: '0.68rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'text.secondary',
            }}
          >
            Bajas &amp; Mortandad
          </Typography>
          <Box
            sx={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#e2e8f0',
              color: '#475569',
            }}
          >
            <svg style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </Box>
        </Box>
        <Box sx={{ mt: 0.75, display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <Typography sx={{ fontSize: '1.55rem', fontWeight: 800, color: 'text.primary', lineHeight: 1 }}>
            {kpis.deathCount} Bajas
          </Typography>
          <Box
            component="span"
            sx={{
              fontSize: '0.68rem',
              fontWeight: 700,
              color: '#475569',
              bgcolor: '#f1f5f9',
              border: '1px solid #cbd5e1',
              px: 0.8,
              py: 0.2,
              borderRadius: '4px',
            }}
          >
            Índice {kpis.deathRate}%
          </Box>
        </Box>
        <Typography sx={{ mt: 0.75, fontSize: '0.72rem', color: 'text.secondary' }}>
          Tasa mensual{' '}
          <Box component="strong" sx={{ color: 'text.primary', fontWeight: 700 }}>
            {kpis.deathRate}%
          </Box>{' '}
          (Rango normal)
        </Typography>
      </Box>
    </Box>
  );
};

export default FioriKpiFacets;
