import React, { useMemo } from 'react';
import { Box, Typography, Paper, Stack, Button, Chip } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import ReactECharts from 'echarts-for-react';
import { useNavigate } from 'react-router';

import { DashboardSummaryCards, DashboardKPIs } from '../cards/DashboardSummaryCards';
import { QuarantineCaravan, ConsumptionCaravan, DeathCaravan } from './DashboardHealthPanel';

interface DashboardGeneralPanelProps {
  kpis: DashboardKPIs;
  quarantineData: QuarantineCaravan[];
  consumptionData: ConsumptionCaravan[];
  deathData: DeathCaravan[];
  onActionClick: (action: string, tag: string) => void;
}

export const DashboardGeneralPanel: React.FC<DashboardGeneralPanelProps> = ({
  kpis,
  quarantineData,
  consumptionData,
  deathData,
  onActionClick,
}) => {
  const navigate = useNavigate();

  // ECharts: Monthly internal batches distribution
  const monthlyChartOptions = useMemo(() => ({
    grid: { top: 35, right: 15, bottom: 25, left: 25, containLabel: true },
    legend: {
      top: 0,
      icon: 'rect',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { fontWeight: 600, color: '#64748b', fontSize: '0.75rem' },
    },
    tooltip: { trigger: 'axis', textStyle: { fontSize: 11 } },
    xAxis: {
      type: 'category',
      data: ['Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May'],
      axisLabel: { color: '#64748b', fontWeight: 600, fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } },
      axisLabel: { color: '#64748b', fontWeight: 600, fontSize: 10 },
    },
    series: [
      { name: 'Cuarentena', type: 'bar', barWidth: '22%', color: '#0284c7', data: [5, 8, 4, 7, 9, quarantineData.length] },
      { name: 'Consumo Interno', type: 'bar', barWidth: '22%', color: '#107e3e', data: [2, 3, 2, 4, 3, consumptionData.length] },
      { name: 'Bajas', type: 'bar', barWidth: '22%', color: '#dc2626', data: [1, 2, 1, 3, 2, deathData.length] },
    ],
  }), [quarantineData.length, consumptionData.length, deathData.length]);

  // ECharts: Conception curve simulation during 60-90 day service window
  const serviceProgressChartOptions = useMemo(() => ({
    grid: { top: 35, right: 20, bottom: 25, left: 25, containLabel: true },
    tooltip: { trigger: 'axis', textStyle: { fontSize: 11 } },
    legend: {
      top: 0,
      icon: 'roundRect',
      textStyle: { fontWeight: 600, color: '#64748b', fontSize: '0.75rem' },
    },
    xAxis: {
      type: 'category',
      data: ['Día 0', 'Día 21', 'Día 42', 'Día 63', 'Día 90'],
      axisLabel: { color: '#64748b', fontWeight: 600, fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: '{value}%', color: '#64748b', fontWeight: 600, fontSize: 10 },
      splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } },
    },
    series: [
      {
        name: '% Preñez Acumulada Proyectada',
        type: 'line',
        smooth: true,
        data: [0, 58, 82, 92, 95],
        itemStyle: { color: '#db2777' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(219, 39, 119, 0.28)' },
              { offset: 1, color: 'rgba(219, 39, 119, 0.02)' },
            ],
          },
        },
      },
      {
        name: 'Meta Cabeza de Parición (>65%)',
        type: 'line',
        step: 'middle',
        data: [0, 65, 65, 65, 65],
        lineStyle: { type: 'dashed', color: '#16a34a', width: 2 },
        itemStyle: { color: '#16a34a' },
      },
    ],
  }), []);

  return (
    <Stack spacing={3}>
      {/* 1. Top 4 Executive KPI Cards */}
      <DashboardSummaryCards kpis={kpis} />

      {/* 2. Analytical Charts Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 2.5 }}>
        {/* Sanitary & Internal Batches Evolution */}
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: '8px', bgcolor: 'background.paper' }}>
          <Stack spacing={1.5}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Movimientos Mensuales de Lotes Internos</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Dinámica de ingresos a cuarentena, faena y bajas</Typography>
              </Box>
              <Chip label="Sanidad & Bioseguridad" size="small" sx={{ fontWeight: 700, bgcolor: '#e0f2fe', color: '#0284c7' }} />
            </Box>
            <Box sx={{ width: '100%', height: 230 }}>
              <ReactECharts option={monthlyChartOptions} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'svg' }} />
            </Box>
          </Stack>
        </Paper>

        {/* Reproductive Service Progress */}
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: '8px', bgcolor: 'background.paper' }}>
          <Stack spacing={1.5}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Curva de Servicios &amp; Preñez Proyectada</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Dinámica de concepción en ventana temporal de 60-90 días (INTA Balcarce)</Typography>
              </Box>
              <Chip label="Campaña 2026/2027" size="small" sx={{ fontWeight: 700, bgcolor: '#fdf2f8', color: '#db2777' }} />
            </Box>
            <Box sx={{ width: '100%', height: 230 }}>
              <ReactECharts option={serviceProgressChartOptions} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'svg' }} />
            </Box>
          </Stack>
        </Paper>
      </Box>

      {/* 3. Operational Highlights Card */}
      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: '8px', bgcolor: 'background.paper' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Gestión Integral del Rodeo de Cría</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              3 lotes en servicio activo ({kpis.serviceFemales} vientres con {kpis.serviceMales} toros) • Ratio global torada {kpis.serviceRatio}% (Óptimo)
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => navigate('/gestation/service-batches')}
            startIcon={<FuseSvgIcon size={16}>heroicons-outline:heart</FuseSvgIcon>}
            sx={{ borderRadius: '6px', fontWeight: 700, textTransform: 'none', px: 2, boxShadow: 'none' }}
          >
            Ver Lotes de Servicio
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
};

export default DashboardGeneralPanel;
