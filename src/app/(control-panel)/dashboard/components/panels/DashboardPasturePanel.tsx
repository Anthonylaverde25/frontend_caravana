import React, { useState, useMemo } from 'react';
import { Box, Typography, Paper, Stack, Button, Chip } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import { useSnackbar } from 'notistack';

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
  { id: 1, name: 'Potrero 01 (Bajo Dulce)', hectares: 120, pastureType: 'Festuca + Trébol Blanco', animalCount: 140, stockingRate: 1.17, daysOccupied: 12, status: 'GRAZING' },
  { id: 2, name: 'Potrero 04 (Bajos de Servicio)', hectares: 95, pastureType: 'Alfalfa + Rye Grass', animalCount: 67, stockingRate: 0.71, daysOccupied: 24, status: 'GRAZING' },
  { id: 3, name: 'Potrero 07 (La Loma)', hectares: 110, pastureType: 'Agropiro Alargado', animalCount: 72, stockingRate: 0.65, daysOccupied: 18, status: 'GRAZING' },
  { id: 4, name: 'Potrero 09 (Reserva Forrajera)', hectares: 80, pastureType: 'Alfalfa Pura (Corte)', animalCount: 0, stockingRate: 0.0, daysOccupied: 0, status: 'RECOVERY' },
  { id: 5, name: 'Potrero 12 (El Trébol)', hectares: 105, pastureType: 'Pastura Consociada Base Trébol', animalCount: 52, stockingRate: 0.50, daysOccupied: 8, status: 'OPTIMAL' },
];

export const DashboardPasturePanel: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [viewMode, setViewMode] = useState<'charts' | 'raw'>('charts');
  const [filterText, setFilterText] = useState('');

  // ECharts: Stocking rate per paddock
  const pastureChartOptions = useMemo(() => ({
    grid: { top: 25, right: 15, bottom: 25, left: 30, containLabel: true },
    tooltip: { trigger: 'axis', textStyle: { fontSize: 11 } },
    legend: { show: false },
    xAxis: {
      type: 'category',
      data: MOCK_PADDOCKS.map((p) => p.name.split(' ')[1] || p.name),
      axisLine: { lineStyle: { color: '#cbd5e1' } },
      axisLabel: { color: '#556b82', fontWeight: 600, fontSize: 11 },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      name: 'EV/ha',
      max: 1.5,
      splitLine: { lineStyle: { type: 'solid', color: '#f1f5f9' } },
      axisLabel: { color: '#8c9baa', fontSize: 10 },
    },
    series: [
      {
        name: 'Carga Animal (EV/ha)',
        type: 'bar',
        barWidth: 20,
        data: MOCK_PADDOCKS.map((p) => p.stockingRate),
        itemStyle: {
          color: (params: { value: number }) => (params.value > 1.0 ? '#0284c7' : params.value > 0 ? '#107e3e' : '#94a3b8'),
          borderRadius: [3, 3, 0, 0],
        },
      },
    ],
  }), []);

  // ECharts: Surface Distribution Pie
  const surfaceChartOptions = useMemo(() => ({
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
        name: 'Superficie',
        type: 'pie',
        radius: ['55%', '80%'],
        center: ['65%', '50%'],
        avoidLabelOverlap: false,
        label: { show: false },
        data: [
          { value: 430, name: 'En Pastoreo Activo (430 ha)', itemStyle: { color: '#107e3e' } },
          { value: 80, name: 'Reserva / Descanso (80 ha)', itemStyle: { color: '#d97706' } },
        ],
      },
    ],
  }), []);

  const filteredPaddocks = useMemo(() => {
    if (!filterText.trim()) return MOCK_PADDOCKS;
    const q = filterText.toLowerCase();
    return MOCK_PADDOCKS.filter(
      (p) => p.name.toLowerCase().includes(q) || p.pastureType.toLowerCase().includes(q)
    );
  }, [filterText]);

  const totals = useMemo(() => {
    const totalHectares = filteredPaddocks.reduce((acc, p) => acc + p.hectares, 0);
    const totalAnimals = filteredPaddocks.reduce((acc, p) => acc + p.animalCount, 0);
    const avgStocking = totalHectares > 0 ? Number(((totalAnimals * 0.9) / totalHectares).toFixed(2)) : 0;
    return { totalHectares, totalAnimals, avgStocking };
  }, [filteredPaddocks]);

  return (
    <Stack spacing={3}>
      {/* 1. Unified Pasture Analytical Dual Container */}
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
              Balance Forrajero y Presión de Pastoreo
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
              | Monitoreo de Carga EV/ha
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* View Mode Toggle */}
            <Box sx={{ display: 'inline-flex', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: '6px', p: 0.3 }}>
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

            {/* Rotation Badge */}
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
              <svg style={{ width: 14, height: 14, color: '#107e3e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              <Typography component="span" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                Rotación Otoño - Invierno
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Content */}
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
            {/* Left: Stocking Rate Chart */}
            <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.84rem', color: 'text.primary' }}>
                      Carga Animal por Potrero (EV / ha)
                    </Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', mt: 0.25 }}>
                      Presión forrajera instantánea comparada contra límite de sustentabilidad
                    </Typography>
                  </Box>
                  <Chip
                    label="Límite 1.0 EV/ha"
                    size="small"
                    sx={{ fontWeight: 600, fontSize: '0.68rem', height: 22, bgcolor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}
                  />
                </Box>
              </Box>

              <Box sx={{ width: '100%', height: 230, mt: 1 }}>
                <ReactECharts option={pastureChartOptions} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'svg' }} />
              </Box>
            </Box>

            {/* Right: Surface Allocation & Summary */}
            <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.84rem', color: 'text.primary' }}>
                      Distribución de Superficie &amp; Descanso
                    </Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', mt: 0.25 }}>
                      Superficie asignada y recuperación biológica de pasturas
                    </Typography>
                  </Box>
                  <Chip
                    label="510 Hectáreas"
                    size="small"
                    sx={{ fontWeight: 600, fontSize: '0.68rem', height: 22, bgcolor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1.2fr 1fr' }, gap: 2, alignItems: 'center', mt: 1 }}>
                <Box sx={{ height: 210, width: '100%' }}>
                  <ReactECharts option={surfaceChartOptions} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'svg' }} />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, borderLeft: { xs: 'none', sm: '1px solid' }, borderColor: 'divider', pl: { xs: 0, sm: 2 } }}>
                  <Box sx={{ p: 1, borderRadius: '6px', bgcolor: 'slate.50', border: '1px solid', borderColor: 'divider' }}>
                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                      SUPERFICIE TOTAL
                    </Typography>
                    <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: 'text.primary' }}>
                      510 ha
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1, borderRadius: '6px', bgcolor: 'slate.50', border: '1px solid', borderColor: 'divider' }}>
                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                      CARGA MEDIA GLOBAL
                    </Typography>
                    <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: '#047857' }}>
                      0.65 EV / ha
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1, borderRadius: '6px', bgcolor: 'slate.50', border: '1px solid', borderColor: 'divider' }}>
                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                      ESTADO GENERAL
                    </Typography>
                    <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: '#1d4ed8' }}>
                      Sustentable
                    </Typography>
                  </Box>
                </Box>
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
                  <th>Potrero</th>
                  <th style={{ textAlign: 'right' }}>Superficie (ha)</th>
                  <th>Base Forrajera</th>
                  <th style={{ textAlign: 'right' }}>Cabezas</th>
                  <th style={{ textAlign: 'right' }}>Carga (EV/ha)</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_PADDOCKS.map((p, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600, fontFamily: 'inherit' }}>{p.name}</td>
                    <td style={{ textAlign: 'right' }}>{p.hectares} ha</td>
                    <td style={{ fontFamily: 'inherit' }}>{p.pastureType}</td>
                    <td style={{ textAlign: 'right' }}>{p.animalCount}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: p.stockingRate > 1.0 ? '#0284c7' : '#107e3e' }}>
                      {p.stockingRate > 0 ? `${p.stockingRate} EV/ha` : '—'}
                    </td>
                    <td style={{ fontFamily: 'inherit' }}>{p.status}</td>
                  </tr>
                ))}
              </tbody>
            </Box>
          </Box>
        )}
      </Paper>

      {/* 2. SAP ALV Grid: Paddocks and Grazing Management */}
      <Box
        sx={{
          borderRadius: '8px',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        {/* Table Toolbar */}
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 10, height: 10, bgcolor: '#107e3e', borderRadius: '2px' }} />
              <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem', color: 'text.primary', letterSpacing: '0.02em' }}>
                SAP ALV Grid · Estado de Potreros y Pastoreo
              </Typography>
            </Box>
            <Chip
              label={`${filteredPaddocks.length} potreros monitoreados`}
              size="small"
              sx={{ fontWeight: 600, fontSize: '0.68rem', height: 22, bgcolor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}
            />
            <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', display: { xs: 'none', md: 'inline' } }}>
              ({totals.totalHectares} ha totales · {totals.totalAnimals} cabezas asignadas)
            </Typography>
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ position: 'relative', width: 170 }}>
              <Box
                component="input"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder="Filtrar potrero..."
                sx={{
                  width: '100%',
                  bgcolor: 'background.paper',
                  fontSize: '0.75rem',
                  borderRadius: '5px',
                  px: 1.25,
                  py: 0.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  outline: 'none',
                  '&:focus': { borderColor: '#0a4d3c' },
                }}
              />
            </Box>

            <Button
              variant="outlined"
              size="small"
              onClick={() => enqueueSnackbar('Exportando balance de potreros a Excel...', { variant: 'info' })}
              sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600, color: 'text.primary', borderColor: 'divider', borderRadius: '5px', px: 1.5, py: 0.5 }}
              startIcon={
                <svg style={{ width: 14, height: 14, color: '#16a34a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              }
            >
              Exportar XLS
            </Button>
          </Box>
        </Box>

        {/* Dense Table */}
        <Box sx={{ overflowX: 'auto' }}>
          <Box
            component="table"
            sx={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.75rem',
              textAlign: 'left',
              '& th': {
                bgcolor: '#f1f5f9',
                fontSize: '0.7rem',
                fontWeight: 700,
                color: '#475569',
                borderBottom: '1px solid #cbd5e1',
                borderRight: '1px solid #e2e8f0',
                py: 1,
                px: 1.5,
                whiteSpace: 'nowrap',
                textTransform: 'uppercase',
              },
              '& td': {
                borderBottom: '1px solid #e2e8f0',
                borderRight: '1px solid #e2e8f0',
                py: 1,
                px: 1.5,
                fontSize: '0.75rem',
                whiteSpace: 'nowrap',
              },
              '& tbody tr:hover': { bgcolor: '#f8fafc' },
            }}
          >
            <thead>
              <tr>
                <th style={{ textAlign: 'center', width: 40, backgroundColor: '#e2e8f0' }}>#</th>
                <th>Potrero</th>
                <th style={{ textAlign: 'right' }}>Superficie (ha)</th>
                <th>Base Forrajera</th>
                <th style={{ textAlign: 'right' }}>Cabezas</th>
                <th style={{ textAlign: 'right' }}>Carga (EV/ha)</th>
                <th style={{ textAlign: 'right' }}>Días Ocupado</th>
                <th style={{ textAlign: 'center' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredPaddocks.map((paddock, idx) => (
                <tr key={paddock.id}>
                  <td style={{ textAlign: 'center', fontFamily: 'monospace', color: '#94a3b8', backgroundColor: '#f8fafc' }}>{idx + 1}</td>
                  <td style={{ fontWeight: 600, color: '#0a4d3c' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: paddock.status === 'GRAZING' ? '#10b981' : paddock.status === 'RECOVERY' ? '#f59e0b' : '#3b82f6',
                        }}
                      />
                      <Typography component="span" sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#0a4d3c' }}>
                        {paddock.name}
                      </Typography>
                    </Box>
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>{paddock.hectares} ha</td>
                  <td style={{ color: '#475569' }}>{paddock.pastureType}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>{paddock.animalCount}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                    <Box component="span" sx={{ fontWeight: 700, color: paddock.stockingRate > 1.0 ? '#0284c7' : '#047857' }}>
                      {paddock.stockingRate > 0 ? `${paddock.stockingRate} EV/ha` : '—'}
                    </Box>
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{paddock.daysOccupied} d</td>
                  <td style={{ textAlign: 'center' }}>
                    <Chip
                      label={paddock.status === 'GRAZING' ? 'En Pastoreo' : paddock.status === 'RECOVERY' ? 'En Descanso' : 'Óptimo'}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.65rem',
                        height: 20,
                        bgcolor: paddock.status === 'GRAZING' ? '#ecfdf5' : paddock.status === 'RECOVERY' ? '#fef3c7' : '#eff6ff',
                        color: paddock.status === 'GRAZING' ? '#065f46' : paddock.status === 'RECOVERY' ? '#b45309' : '#1d4ed8',
                        border: '1px solid',
                        borderColor: paddock.status === 'GRAZING' ? '#a7f3d0' : paddock.status === 'RECOVERY' ? '#fde68a' : '#bfdbfe',
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: '#f1f5f9', fontWeight: 700 }}>
                <td style={{ textAlign: 'center', fontFamily: 'monospace', color: '#94a3b8', backgroundColor: '#e2e8f0' }}>∑</td>
                <td style={{ color: '#334155', textTransform: 'uppercase' }}>Superficie Ganadera Total</td>
                <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#064e3b', fontWeight: 800 }}>{totals.totalHectares} ha</td>
                <td style={{ color: '#64748b', fontSize: '0.7rem' }}>5 Potreros Delimitados</td>
                <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#064e3b', fontWeight: 800 }}>{totals.totalAnimals} Cabezas</td>
                <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#064e3b', fontWeight: 800 }}>{totals.avgStocking} EV/ha Prom.</td>
                <td colSpan={2} style={{ color: '#64748b', fontWeight: 500, fontSize: '0.7rem' }}>Monitoreo Forrajero Satelital Activo</td>
              </tr>
            </tfoot>
          </Box>
        </Box>
      </Box>
    </Stack>
  );
};

export default DashboardPasturePanel;
