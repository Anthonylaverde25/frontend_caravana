import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
} from '@mui/material';
import ReactECharts from 'echarts-for-react';

interface PaddockStatus {
  id: number;
  name: string;
  hectares: number;
  pastureType: string;
  animalCount: number;
  stockingRate: number; // EV / ha
  daysOccupied: number;
  status: 'OPTIMAL' | 'RECOVERY' | 'GRAZING';
}

const MOCK_PADDOCKS: PaddockStatus[] = [
  { id: 1, name: 'Potrero 1 (Bajo Dulce)', hectares: 120, pastureType: 'Festuca + Trébol Blanco', animalCount: 140, stockingRate: 1.17, daysOccupied: 12, status: 'GRAZING' },
  { id: 2, name: 'Potrero 4 (Bajos de Servicio)', hectares: 95, pastureType: 'Alfalfa + Rye Grass', animalCount: 67, stockingRate: 0.71, daysOccupied: 24, status: 'GRAZING' },
  { id: 3, name: 'Potrero 7 (La Loma)', hectares: 110, pastureType: 'Agropiro Alargado', animalCount: 72, stockingRate: 0.65, daysOccupied: 18, status: 'GRAZING' },
  { id: 4, name: 'Potrero 9 (Reserva Forrajera)', hectares: 80, pastureType: 'Alfalfa Pura (Corte)', animalCount: 0, stockingRate: 0.0, daysOccupied: 0, status: 'RECOVERY' },
  { id: 5, name: 'Potrero 12 (El Trébol)', hectares: 105, pastureType: 'Pastura Consociada Base Trébol', animalCount: 52, stockingRate: 0.50, daysOccupied: 8, status: 'OPTIMAL' },
];

export const DashboardPasturePanel: React.FC = () => {
  // ECharts: Stocking rate per paddock
  const pastureChartOptions = useMemo(() => ({
    grid: { top: 35, right: 15, bottom: 25, left: 25, containLabel: true },
    tooltip: { trigger: 'axis', textStyle: { fontSize: 11 } },
    xAxis: {
      type: 'category',
      data: MOCK_PADDOCKS.map((p) => p.name.split(' ')[1] || p.name),
      axisLabel: { color: '#64748b', fontWeight: 600, fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      name: 'EV / ha',
      splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } },
      axisLabel: { color: '#64748b', fontWeight: 600, fontSize: 10 },
    },
    series: [
      {
        name: 'Carga Animal (EV/ha)',
        type: 'bar',
        barWidth: '35%',
        data: MOCK_PADDOCKS.map((p) => p.stockingRate),
        itemStyle: {
          color: (params: any) => (params.value > 1.0 ? '#0284c7' : params.value > 0 ? '#107e3e' : '#94a3b8'),
          borderRadius: [4, 4, 0, 0],
        },
      },
    ],
  }), []);

  return (
    <Stack spacing={3}>
      {/* 1. Analytical Charts & Summary */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '3fr 2fr' }, gap: 2.5 }}>
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: '8px', bgcolor: 'background.paper' }}>
          <Stack spacing={1.5}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Carga Animal por Potrero (Equivalente Vaca / ha)</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Monitoreo de presión de pastoreo y balance forrajero</Typography>
            </Box>
            <Box sx={{ width: '100%', height: 240 }}>
              <ReactECharts option={pastureChartOptions} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'svg' }} />
            </Box>
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: '8px', bgcolor: 'background.paper' }}>
          <Stack spacing={2} sx={{ height: '100%' }}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Resumen Forrajero del Establecimiento</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Superficie ganadera y rotación</Typography>
            </Box>
            <Stack spacing={2} sx={{ flexGrow: 1, justifyContent: 'space-around' }}>
              <Box sx={{ p: 1.5, borderRadius: '6px', bgcolor: 'action.hover' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>SUPERFICIE GANADERA TOTAL</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>510 Hectáreas</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>5 potreros delimitados (80 ha en descanso/reserva)</Typography>
              </Box>
              <Box sx={{ p: 1.5, borderRadius: '6px', bgcolor: 'action.hover' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>CARGA MEDIA DEL CAMPO</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#107e3e' }}>0.65 EV / ha</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>Capacidad de sustentación forrajera óptima</Typography>
              </Box>
            </Stack>
          </Stack>
        </Paper>
      </Box>

      {/* 2. Paddocks Table */}
      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: '8px', bgcolor: 'background.paper' }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Estado de Potreros y Pastoreo</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Rotación, días de ocupación y oferta forrajera</Typography>
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell sx={{ fontWeight: 800, fontSize: '0.74rem' }}>Potrero</TableCell>
                  <TableCell sx={{ fontWeight: 800, fontSize: '0.74rem', textAlign: 'center' }}>Superficie (ha)</TableCell>
                  <TableCell sx={{ fontWeight: 800, fontSize: '0.74rem' }}>Tipo de Pastura / Base</TableCell>
                  <TableCell sx={{ fontWeight: 800, fontSize: '0.74rem', textAlign: 'center' }}>Cabezas</TableCell>
                  <TableCell sx={{ fontWeight: 800, fontSize: '0.74rem', textAlign: 'center' }}>Carga (EV/ha)</TableCell>
                  <TableCell sx={{ fontWeight: 800, fontSize: '0.74rem', textAlign: 'center' }}>Días Ocupado</TableCell>
                  <TableCell sx={{ fontWeight: 800, fontSize: '0.74rem', textAlign: 'center' }}>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {MOCK_PADDOCKS.map((paddock) => (
                  <TableRow key={paddock.id} hover>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem', color: 'primary.main' }}>
                      {paddock.name}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center', fontSize: '0.78rem' }}>{paddock.hectares} ha</TableCell>
                    <TableCell sx={{ fontSize: '0.78rem' }}>{paddock.pastureType}</TableCell>
                    <TableCell sx={{ textAlign: 'center', fontWeight: 700 }}>{paddock.animalCount}</TableCell>
                    <TableCell sx={{ textAlign: 'center', fontWeight: 700, color: paddock.stockingRate > 1.0 ? '#0284c7' : '#107e3e' }}>
                      {paddock.stockingRate > 0 ? `${paddock.stockingRate} EV/ha` : '—'}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center', fontSize: '0.76rem' }}>{paddock.daysOccupied} días</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Chip
                        label={paddock.status === 'GRAZING' ? 'En Pastoreo' : paddock.status === 'RECOVERY' ? 'En Descanso' : 'Óptimo'}
                        size="small"
                        color={paddock.status === 'GRAZING' ? 'primary' : paddock.status === 'RECOVERY' ? 'warning' : 'success'}
                        variant="outlined"
                        sx={{ fontWeight: 700, height: 22, fontSize: '0.7rem' }}
                      />
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

export default DashboardPasturePanel;
