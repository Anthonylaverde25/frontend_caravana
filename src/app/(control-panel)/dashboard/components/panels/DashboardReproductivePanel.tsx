import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import ReactECharts from 'echarts-for-react';
import { useNavigate } from 'react-router';

interface ServiceBatchMock {
  id: number;
  name: string;
  paddock: string;
  females: number;
  males: number;
  ratio: number;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  status: 'OPTIMAL' | 'ATTENTION';
}

const MOCK_SERVICE_BATCHES: ServiceBatchMock[] = [
  { id: 1, name: 'Lote Vaquillonas 15M (Servicio Primavera)', paddock: 'Potrero 4 (Bajos)', females: 65, males: 2, ratio: 3.1, startDate: '2026-10-15', endDate: '2026-12-15', daysRemaining: 44, status: 'OPTIMAL' },
  { id: 2, name: 'Lote Vacas CUT 2do Servicio', paddock: 'Potrero 7 (La Loma)', females: 70, males: 2, ratio: 2.9, startDate: '2026-11-01', endDate: '2027-01-01', daysRemaining: 60, status: 'OPTIMAL' },
  { id: 3, name: 'Lote Rodeo General Repaso', paddock: 'Potrero 12 (El Trébol)', females: 50, males: 2, ratio: 4.0, startDate: '2026-11-10', endDate: '2027-01-10', daysRemaining: 70, status: 'OPTIMAL' },
];

export const DashboardReproductivePanel: React.FC = () => {
  const navigate = useNavigate();

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
      data: ['Día 0 (Inicio)', 'Día 21 (1er Celo)', 'Día 42 (2do Celo)', 'Día 63 (3er Celo)', 'Día 90 (Cierre)'],
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
        name: 'Objetivo de Cabeza de Parición (INTA >65%)',
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
      {/* 1. Analytical Charts & Conception Curve */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '3fr 2fr' }, gap: 2.5 }}>
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: '8px', bgcolor: 'background.paper' }}>
          <Stack spacing={1.5}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Curva de Servicios &amp; Preñez Proyectada</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Dinámica de concepción en ventana temporal de 60-90 días (INTA Balcarce)</Typography>
              </Box>
              <Chip label="Campaña 2026/2027" size="small" sx={{ fontWeight: 700, bgcolor: '#fdf2f8', color: '#db2777' }} />
            </Box>
            <Box sx={{ width: '100%', height: 240 }}>
              <ReactECharts option={serviceProgressChartOptions} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'svg' }} />
            </Box>
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: '8px', bgcolor: 'background.paper' }}>
          <Stack spacing={2} sx={{ height: '100%' }}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Parámetros Zootécnicos del Rodeo</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Capacidad reproductiva y eficiencia de servicio</Typography>
            </Box>
            <Stack spacing={2} sx={{ flexGrow: 1, justifyContent: 'space-around' }}>
              <Box sx={{ p: 1.5, borderRadius: '6px', bgcolor: 'action.hover' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>RATIO GLOBAL DE TORADA</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#107e3e' }}>3.2% (1 Toro / 31 Vientres)</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>Rango recomendado: 2.5% a 3.5% en pasturas</Typography>
              </Box>
              <Box sx={{ p: 1.5, borderRadius: '6px', bgcolor: 'action.hover' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>PROYECCIÓN CABEZA DE PARICIÓN</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0284c7' }}>68% en los primeros 21 días</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>Garantiza terneros pesados y parejos al destete</Typography>
              </Box>
            </Stack>
          </Stack>
        </Paper>
      </Box>

      {/* 2. Active Breeding Batches Table */}
      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: '8px', bgcolor: 'background.paper' }}>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Lotes de Servicio Activos en Campo</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Vientres homogéneos y torada en potreros de entore</Typography>
            </Box>
            <Button
              variant="contained"
              size="small"
              onClick={() => navigate('/gestation/service-batches')}
              startIcon={<FuseSvgIcon size={16}>heroicons-outline:arrow-top-right-on-square</FuseSvgIcon>}
              sx={{ fontWeight: 700, textTransform: 'none', borderRadius: '6px' }}
            >
              Gestionar Lotes de Servicio
            </Button>
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell sx={{ fontWeight: 800, fontSize: '0.74rem' }}>Lote de Servicio</TableCell>
                  <TableCell sx={{ fontWeight: 800, fontSize: '0.74rem' }}>Potrero</TableCell>
                  <TableCell sx={{ fontWeight: 800, fontSize: '0.74rem', textAlign: 'center' }}>♀ Vientres</TableCell>
                  <TableCell sx={{ fontWeight: 800, fontSize: '0.74rem', textAlign: 'center' }}>♂ Toros</TableCell>
                  <TableCell sx={{ fontWeight: 800, fontSize: '0.74rem', textAlign: 'center' }}>Ratio Torada</TableCell>
                  <TableCell sx={{ fontWeight: 800, fontSize: '0.74rem' }}>Ventana Temporal</TableCell>
                  <TableCell sx={{ fontWeight: 800, fontSize: '0.74rem', textAlign: 'center' }}>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {MOCK_SERVICE_BATCHES.map((batch) => (
                  <TableRow key={batch.id} hover>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem', color: 'primary.main' }}>
                      {batch.name}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.78rem' }}>{batch.paddock}</TableCell>
                    <TableCell sx={{ textAlign: 'center', fontWeight: 700, color: '#db2777' }}>{batch.females}</TableCell>
                    <TableCell sx={{ textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>{batch.males}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Chip label={`${batch.ratio}%`} size="small" sx={{ fontWeight: 800, bgcolor: '#e7f6ec', color: '#107e3e', height: 22, fontSize: '0.72rem' }} />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.76rem' }}>{batch.startDate} al {batch.endDate}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Chip label="En Servicio" color="success" size="small" variant="outlined" sx={{ fontWeight: 700, height: 22, fontSize: '0.7rem' }} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </Paper>
    </Stack>
  );
};

export default DashboardReproductivePanel;
