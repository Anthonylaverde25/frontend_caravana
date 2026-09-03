import React, { useMemo } from 'react';
import { Box, Typography, Paper, Stack } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import { DashboardHealthTables } from './health/DashboardHealthTables';

export interface QuarantineCaravan {
  id: string;
  tag: string;
  entryDate: string;
  diagnosis: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  daysIsolated: number;
}

export interface ConsumptionCaravan {
  id: string;
  tag: string;
  assignDate: string;
  weight: number;
  destination: string;
  status: string;
}

export interface DeathCaravan {
  id: string;
  tag: string;
  deathDate: string;
  cause: string;
  diagnosedBy: string;
  status: string;
}

interface DashboardHealthPanelProps {
  quarantineData: QuarantineCaravan[];
  consumptionData: ConsumptionCaravan[];
  deathData: DeathCaravan[];
  onActionClick: (action: string, tag: string) => void;
}

export const DashboardHealthPanel: React.FC<DashboardHealthPanelProps> = ({
  quarantineData,
  consumptionData,
  deathData,
  onActionClick,
}) => {
  // ECharts: Monthly data
  const monthlyChartOptions = useMemo(() => ({
    grid: { top: 35, right: 15, bottom: 25, left: 25, containLabel: true },
    legend: {
      top: 0,
      icon: 'rect',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { fontWeight: 600, color: '#64748b', fontSize: '0.75rem' },
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      borderColor: '#e2e8f0',
      textStyle: { color: '#1e293b', fontSize: 11 },
      axisPointer: { type: 'shadow' },
    },
    xAxis: {
      type: 'category',
      data: ['Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May'],
      axisLine: { lineStyle: { color: '#cbd5e1' } },
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

  // ECharts: Diagnosis severity doughnut
  const diagnosisChartOptions = useMemo(() => ({
    tooltip: { trigger: 'item', textStyle: { fontSize: 11 } },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8,
      textStyle: { fontWeight: 600, color: '#64748b', fontSize: '0.75rem' },
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
          { value: 1, name: 'Crítico', itemStyle: { color: '#dc2626' } },
          { value: 1, name: 'Alto', itemStyle: { color: '#ea580c' } },
          { value: 1, name: 'Medio', itemStyle: { color: '#ca8a04' } },
          { value: 1, name: 'Bajo', itemStyle: { color: '#16a34a' } },
        ],
      },
    ],
  }), []);

  return (
    <Stack spacing={3}>
      {/* 1. Analytical Charts Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '3fr 2fr' }, gap: 2.5 }}>
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: '8px', bgcolor: 'background.paper' }}>
          <Stack spacing={1.5}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Movimientos Mensuales de Lotes Internos</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Histórico comparativo de ingresos y registros de bajas</Typography>
            </Box>
            <Box sx={{ width: '100%', height: 240 }}>
              <ReactECharts option={monthlyChartOptions} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'svg' }} />
            </Box>
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: '8px', bgcolor: 'background.paper' }}>
          <Stack spacing={1.5} sx={{ height: '100%' }}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Estado y Métricas de Bioseguridad</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Severidad de aislamiento y rendimiento operativo</Typography>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1.2fr 1fr' }, gap: 2, alignItems: 'center', flexGrow: 1 }}>
              <Box sx={{ height: 190, width: '100%' }}>
                <ReactECharts option={diagnosisChartOptions} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'svg' }} />
              </Box>
              <Stack spacing={2} sx={{ borderLeft: { xs: 'none', sm: '1px solid' }, borderColor: 'divider', pl: { xs: 0, sm: 2 } }}>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', fontSize: '0.68rem' }}>AISLAMIENTO PROMEDIO</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>4.2 días</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', fontSize: '0.68rem' }}>PESO TOTAL CONSUMIDO</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>1,193.7 kg</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', fontSize: '0.68rem' }}>TASA DE BAJAS MENSUAL</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#dc2626' }}>1.2 %</Typography>
                </Box>
              </Stack>
            </Box>
          </Stack>
        </Paper>
      </Box>

      {/* 2. Sub-Tabs & Detailed Tables */}
      <DashboardHealthTables
        quarantineData={quarantineData}
        consumptionData={consumptionData}
        deathData={deathData}
        onActionClick={onActionClick}
      />
    </Stack>
  );
};

export default DashboardHealthPanel;
