import React, { useState, useMemo } from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import { QuarantineCaravan, ConsumptionCaravan, DeathCaravan } from '../DashboardHealthPanel';

interface FioriHealthAnalyticalContainerProps {
  quarantineData: QuarantineCaravan[];
  consumptionData: ConsumptionCaravan[];
  deathData: DeathCaravan[];
}

export const FioriHealthAnalyticalContainer: React.FC<FioriHealthAnalyticalContainerProps> = ({
  quarantineData,
  consumptionData,
  deathData,
}) => {
  const [viewMode, setViewMode] = useState<'charts' | 'raw'>('charts');

  // ECharts Bar Chart: Monthly movements
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
        data: [5, 8, 4, 7, 9, quarantineData.length || 4],
      },
      {
        name: 'Consumo Interno',
        type: 'bar',
        barWidth: 16,
        itemStyle: { color: '#16a34a', borderRadius: [2, 2, 0, 0] },
        data: [2, 3, 2, 4, 3, consumptionData.length || 3],
      },
      {
        name: 'Bajas',
        type: 'bar',
        barWidth: 16,
        itemStyle: { color: '#dc2626', borderRadius: [2, 2, 0, 0] },
        data: [1, 2, 1, 3, 2, deathData.length || 3],
      },
    ],
  }), [quarantineData.length, consumptionData.length, deathData.length]);

  // ECharts Donut Chart: Severity breakdown
  const severityChartOptions = useMemo(() => {
    const critical = quarantineData.filter((q) => q.severity === 'CRITICAL').length || 1;
    const high = quarantineData.filter((q) => q.severity === 'HIGH').length || 1;
    const medium = quarantineData.filter((q) => q.severity === 'MEDIUM').length || 1;
    const low = quarantineData.filter((q) => q.severity === 'LOW').length || 1;

    return {
      tooltip: { trigger: 'item', textStyle: { fontSize: 11 } },
      legend: {
        orient: 'vertical',
        left: '5%',
        top: 'center',
        icon: 'circle',
        itemWidth: 8,
        itemHeight: 8,
        textStyle: { fontWeight: 600, color: '#556b82', fontSize: 11 },
      },
      series: [
        {
          name: 'Gravedad',
          type: 'pie',
          radius: ['55%', '80%'],
          center: ['65%', '50%'],
          avoidLabelOverlap: false,
          label: { show: false },
          data: [
            { value: critical, name: 'Crítico (Aislado)', itemStyle: { color: '#dc2626' } },
            { value: high, name: 'Alto (Alerta)', itemStyle: { color: '#ea580c' } },
            { value: medium, name: 'Medio (Tratamiento)', itemStyle: { color: '#ca8a04' } },
            { value: low, name: 'Bajo (Preventivo)', itemStyle: { color: '#16a34a' } },
          ],
        },
      ],
    };
  }, [quarantineData]);

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
      {/* Header Toolbar */}
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
            Movimientos Sanitarios y Bioseguridad
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
            | Control de Aislamiento y Bajas
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Segmented View Toggle */}
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

          {/* Date Selector Badge */}
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
              Semestre Dic - May
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
          {/* Left: Monthly Movement Bar Chart */}
          <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.84rem', color: 'text.primary' }}>
                    Histórico de Aislamiento y Bajas
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', mt: 0.25 }}>
                    Dinámica de ingresos a cuarentena, faena interna y bajas
                  </Typography>
                </Box>
                <Chip
                  label="Sanidad & Bioseguridad"
                  size="small"
                  sx={{ fontWeight: 600, fontSize: '0.68rem', height: 22, bgcolor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}
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

          {/* Right: Severity Doughnut & Health KPIs */}
          <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.84rem', color: 'text.primary' }}>
                    Severidad de Cuarentena &amp; Métricas
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', mt: 0.25 }}>
                    Distribución de criticidad clínica y rendimiento sanitario
                  </Typography>
                </Box>
                <Chip
                  label="Vigilancia Activa"
                  size="small"
                  sx={{ fontWeight: 600, fontSize: '0.68rem', height: 22, bgcolor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}
                />
              </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1.2fr 1fr' }, gap: 2, alignItems: 'center', mt: 1 }}>
              <Box sx={{ height: 210, width: '100%' }}>
                <ReactECharts option={severityChartOptions} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'svg' }} />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, borderLeft: { xs: 'none', sm: '1px solid' }, borderColor: 'divider', pl: { xs: 0, sm: 2 } }}>
                <Box sx={{ p: 1, borderRadius: '6px', bgcolor: 'slate.50', border: '1px solid', borderColor: 'divider' }}>
                  <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                    AISLAMIENTO PROMEDIO
                  </Typography>
                  <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: 'text.primary' }}>
                    4.2 días
                  </Typography>
                </Box>
                <Box sx={{ p: 1, borderRadius: '6px', bgcolor: 'slate.50', border: '1px solid', borderColor: 'divider' }}>
                  <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                    PESO TOTAL FAENA
                  </Typography>
                  <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: '#047857' }}>
                    1,193.7 kg
                  </Typography>
                </Box>
                <Box sx={{ p: 1, borderRadius: '6px', bgcolor: 'slate.50', border: '1px solid', borderColor: 'divider' }}>
                  <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                    MORTANDAD MENSUAL
                  </Typography>
                  <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: '#dc2626' }}>
                    1.2 % (Normal)
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      ) : (
        /* Raw Data Matrix */
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
                <th>Período</th>
                <th style={{ textAlign: 'right' }}>Cuarentena (Cabezas)</th>
                <th style={{ textAlign: 'right' }}>Faena Interna (Cabezas)</th>
                <th style={{ textAlign: 'right' }}>Bajas Clínicas</th>
                <th style={{ textAlign: 'right' }}>Índice de Bajas</th>
              </tr>
            </thead>
            <tbody>
              {[
                { m: 'Diciembre 2025', q: 5, c: 2, b: 1, r: '0.8%' },
                { m: 'Enero 2026', q: 8, c: 3, b: 2, r: '1.4%' },
                { m: 'Febrero 2026', q: 4, c: 2, b: 1, r: '0.7%' },
                { m: 'Marzo 2026', q: 7, c: 4, b: 3, r: '1.5%' },
                { m: 'Abril 2026', q: 9, c: 3, b: 2, r: '1.1%' },
                { m: 'Mayo 2026 (Activo)', q: quarantineData.length || 4, c: consumptionData.length || 3, b: deathData.length || 3, r: '1.2%' },
              ].map((row, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600, fontFamily: 'inherit' }}>{row.m}</td>
                  <td style={{ textAlign: 'right', color: '#0284c7' }}>{row.q}</td>
                  <td style={{ textAlign: 'right', color: '#16a34a' }}>{row.c}</td>
                  <td style={{ textAlign: 'right', color: '#dc2626' }}>{row.b}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>{row.r}</td>
                </tr>
              ))}
            </tbody>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default FioriHealthAnalyticalContainer;
