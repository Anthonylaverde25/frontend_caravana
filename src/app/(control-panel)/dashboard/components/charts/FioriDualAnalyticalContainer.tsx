import React, { useState, useMemo } from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import ReactECharts from 'echarts-for-react';

interface FioriDualAnalyticalContainerProps {
  quarantineCount: number;
  consumptionCount: number;
  deathCount: number;
}

export const FioriDualAnalyticalContainer: React.FC<FioriDualAnalyticalContainerProps> = ({
  quarantineCount,
  consumptionCount,
  deathCount,
}) => {
  const [viewMode, setViewMode] = useState<'charts' | 'raw'>('charts');

  // ECharts Bar Chart Options: Monthly Internal Movements
  const monthlyChartOptions = useMemo(() => ({
    grid: { top: 20, right: 15, bottom: 25, left: 30, containLabel: true },
    tooltip: { trigger: 'axis', textStyle: { fontSize: 11 } },
    legend: { show: false },
    xAxis: {
      type: 'category',
      data: ['Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May'],
      axisLine: { lineStyle: { color: '#cbd5e1' } },
      axisLabel: { color: '#556b82', fontWeight: 600, fontSize: 11 },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      max: 12,
      splitLine: { lineStyle: { type: 'solid', color: '#f1f5f9' } },
      axisLabel: { color: '#8c9baa', fontSize: 10 },
    },
    series: [
      {
        name: 'Cuarentena',
        type: 'bar',
        barWidth: 16,
        itemStyle: { color: '#0284c7', borderRadius: [2, 2, 0, 0] },
        data: [7, 10, 6, 9, 11, quarantineCount || 6],
      },
      {
        name: 'Consumo Interno',
        type: 'bar',
        barWidth: 16,
        itemStyle: { color: '#16a34a', borderRadius: [2, 2, 0, 0] },
        data: [4, 5, 4, 6, 5, consumptionCount || 5],
      },
      {
        name: 'Bajas',
        type: 'bar',
        barWidth: 16,
        itemStyle: { color: '#dc2626', borderRadius: [2, 2, 0, 0] },
        data: [2, 4, 2, 5, 4, deathCount || 5],
      },
    ],
  }), [quarantineCount, consumptionCount, deathCount]);

  // ECharts Line Chart Options: Balcarce Pregnancy Curve
  const pregnancyChartOptions = useMemo(() => ({
    grid: { top: 20, right: 25, bottom: 25, left: 35, containLabel: true },
    tooltip: { trigger: 'axis', textStyle: { fontSize: 11 } },
    legend: { show: false },
    xAxis: {
      type: 'category',
      data: ['Día 0', 'Día 21', 'Día 42', 'Día 63', 'Día 90'],
      axisLine: { lineStyle: { color: '#cbd5e1' } },
      axisLabel: { color: '#556b82', fontWeight: 600, fontSize: 11 },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: { formatter: '{value}%', color: '#8c9baa', fontSize: 10 },
      splitLine: { lineStyle: { type: 'solid', color: '#f1f5f9' } },
    },
    series: [
      {
        name: '% Preñez Acumulada Proyectada',
        type: 'line',
        smooth: 0.35,
        data: [0, 58, 76, 84, 86],
        lineStyle: { width: 2.5, color: '#d81b60' },
        itemStyle: { color: '#d81b60', borderColor: '#ffffff', borderWidth: 2 },
        symbolSize: 8,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(216, 27, 96, 0.22)' },
              { offset: 1, color: 'rgba(216, 27, 96, 0.01)' },
            ],
          },
        },
      },
      {
        name: 'Meta Cabeza de Parición (>65%)',
        type: 'line',
        step: false,
        data: [null, 65, 65, 65, 65],
        lineStyle: { type: 'dashed', color: '#16a34a', width: 1.8 },
        itemStyle: { color: '#16a34a', borderColor: '#ffffff', borderWidth: 2 },
        symbolSize: 7,
      },
    ],
  }), []);

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '8px',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {/* Container Toolbar */}
      <Box
        sx={{
          px: 2.5,
          py: 1.25,
          bgcolor: 'slate.50',
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.84rem', color: 'text.primary' }}>
            Movimientos Operativos y Dinámica Reproductiva
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
            | Vista Semestral Diciembre - Mayo
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Segmented Toggle Pills */}
          <Box
            sx={{
              display: 'inline-flex',
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '6px',
              p: 0.3,
            }}
          >
            <Box
              component="button"
              onClick={() => setViewMode('charts')}
              sx={{
                border: 'none',
                cursor: 'pointer',
                px: 1.5,
                py: 0.4,
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: viewMode === 'charts' ? 700 : 500,
                bgcolor: viewMode === 'charts' ? '#0a4d3c' : 'transparent',
                color: viewMode === 'charts' ? '#ffffff' : 'text.secondary',
                transition: 'all 0.15s ease',
              }}
            >
              Gráficos
            </Box>
            <Box
              component="button"
              onClick={() => setViewMode('raw')}
              sx={{
                border: 'none',
                cursor: 'pointer',
                px: 1.5,
                py: 0.4,
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: viewMode === 'raw' ? 700 : 500,
                bgcolor: viewMode === 'raw' ? '#0a4d3c' : 'transparent',
                color: viewMode === 'raw' ? '#ffffff' : 'text.secondary',
                transition: 'all 0.15s ease',
              }}
            >
              Datos Crudos
            </Box>
          </Box>

          {/* Date Selector Pill */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              fontSize: '0.75rem',
              color: 'text.primary',
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              px: 1.5,
              py: 0.6,
              borderRadius: '6px',
            }}
          >
            <svg style={{ width: 14, height: 14, color: '#94a3b8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
            <Typography component="span" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
              Dic 2025 - May 2026
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      {viewMode === 'charts' ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
            '& > div:first-of-type': {
              borderRight: { lg: '1px solid' },
              borderColor: { lg: 'divider' },
              borderBottom: { xs: '1px solid', lg: 'none' },
            },
          }}
        >
          {/* Left: Movimientos Mensuales de Lotes Internos */}
          <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.84rem', color: 'text.primary' }}>
                    Movimientos Mensuales de Lotes Internos
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', mt: 0.25 }}>
                    Dinámica de ingresos a cuarentena, faena y bajas
                  </Typography>
                </Box>
                <Chip
                  label="Sanidad & Bioseguridad"
                  size="small"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.68rem',
                    height: 22,
                    bgcolor: '#eff6ff',
                    color: '#1d4ed8',
                    border: '1px solid #bfdbfe',
                  }}
                />
              </Box>

              {/* Legend */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mt: 1.5, mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Box sx={{ width: 10, height: 10, bgcolor: '#0284c7', borderRadius: '2px' }} />
                  <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', fontWeight: 600 }}>Cuarentena</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Box sx={{ width: 10, height: 10, bgcolor: '#16a34a', borderRadius: '2px' }} />
                  <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', fontWeight: 600 }}>Consumo Interno</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Box sx={{ width: 10, height: 10, bgcolor: '#dc2626', borderRadius: '2px' }} />
                  <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', fontWeight: 600 }}>Bajas</Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ width: '100%', height: 230, mt: 1 }}>
              <ReactECharts option={monthlyChartOptions} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'svg' }} />
            </Box>
          </Box>

          {/* Right: Curva de Servicios & Preñez Proyectada */}
          <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.84rem', color: 'text.primary' }}>
                    Curva de Servicios &amp; Preñez Proyectada
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', mt: 0.25 }}>
                    Dinámica de concepción en ventana temporal de 60–90 días (Modelo INTA Balcarce)
                  </Typography>
                </Box>
                <Chip
                  label="Campaña 2026/2027"
                  size="small"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.68rem',
                    height: 22,
                    bgcolor: '#fff1f2',
                    color: '#be123c',
                    border: '1px solid #fecdd3',
                  }}
                />
              </Box>

              {/* Legend */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mt: 1.5, mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Box sx={{ width: 14, height: 3, bgcolor: '#d81b60', borderRadius: '1px' }} />
                  <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', fontWeight: 600 }}>% Preñez Acumulada Proyectada</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Box sx={{ width: 14, height: 0, borderTop: '2px dashed #16a34a' }} />
                  <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', fontWeight: 600 }}>Meta Cabeza de Parición (&gt;65%)</Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ width: '100%', height: 230, mt: 1 }}>
              <ReactECharts option={pregnancyChartOptions} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'svg' }} />
            </Box>
          </Box>
        </Box>
      ) : (
        /* Raw Data Mode */
        <Box sx={{ p: 2.5, overflowX: 'auto' }}>
          <Box
            component="table"
            sx={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.75rem',
              '& th': { bgcolor: '#f8fafc', p: 1, border: '1px solid #e2e8f0', fontWeight: 700, textAlign: 'left' },
              '& td': { p: 1, border: '1px solid #e2e8f0', fontFamily: 'monospace' },
            }}
          >
            <thead>
              <tr>
                <th>Mes</th>
                <th style={{ textAlign: 'right' }}>Cuarentena</th>
                <th style={{ textAlign: 'right' }}>Consumo Interno</th>
                <th style={{ textAlign: 'right' }}>Bajas</th>
                <th style={{ textAlign: 'right' }}>% Preñez Proyectada</th>
              </tr>
            </thead>
            <tbody>
              {[
                { m: 'Diciembre', q: 7, c: 4, b: 2, p: '0%' },
                { m: 'Enero', q: 10, c: 5, b: 4, p: '58%' },
                { m: 'Febrero', q: 6, c: 4, b: 2, p: '76%' },
                { m: 'Marzo', q: 9, c: 6, b: 5, p: '84%' },
                { m: 'Abril', q: 11, c: 5, b: 4, p: '86%' },
                { m: 'Mayo (Actual)', q: quarantineCount || 6, c: consumptionCount || 5, b: deathCount || 5, p: '86%' },
              ].map((row, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600, fontFamily: 'inherit' }}>{row.m}</td>
                  <td style={{ textAlign: 'right', color: '#0284c7' }}>{row.q}</td>
                  <td style={{ textAlign: 'right', color: '#16a34a' }}>{row.c}</td>
                  <td style={{ textAlign: 'right', color: '#dc2626' }}>{row.b}</td>
                  <td style={{ textAlign: 'right', color: '#d81b60', fontWeight: 700 }}>{row.p}</td>
                </tr>
              ))}
            </tbody>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default FioriDualAnalyticalContainer;
