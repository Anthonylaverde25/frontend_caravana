import React, { useState, useMemo } from 'react';
import { Box, Typography, Paper, Stack, Button, Chip } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import { useNavigate } from 'react-router';
import { useSnackbar } from 'notistack';

interface ServiceBatchItem {
  id: number;
  name: string;
  paddock: string;
  statusColor: 'green' | 'amber' | 'blue';
  females: number;
  males: number;
  ratio: number;
  startDate: string;
  endDate: string;
  pregnancyRate: number;
  status: string;
}

const MOCK_SERVICE_BATCHES: ServiceBatchItem[] = [
  {
    id: 1,
    name: 'Lote 01 - Vaquillonas 15M (Servicio Primavera)',
    paddock: 'Potrero 04 (Bajos)',
    statusColor: 'green',
    females: 65,
    males: 2,
    ratio: 3.08,
    startDate: '15/10/2026',
    endDate: '15/12/2026',
    pregnancyRate: 72,
    status: 'En Entore Activo',
  },
  {
    id: 2,
    name: 'Lote 02 - Vacas con Cría al pie (Multíparas)',
    paddock: 'Potrero 02 (El Bajo)',
    statusColor: 'green',
    females: 70,
    males: 2,
    ratio: 2.86,
    startDate: '01/11/2026',
    endDate: '01/01/2027',
    pregnancyRate: 84,
    status: 'En Entore Activo',
  },
  {
    id: 3,
    name: 'Lote 03 - Vacas CUT (Último servicio repaso)',
    paddock: 'Potrero 12 (El Trébol)',
    statusColor: 'amber',
    females: 50,
    males: 2,
    ratio: 4.00,
    startDate: '10/11/2026',
    endDate: '10/01/2027',
    pregnancyRate: 68,
    status: 'Refuerzo de Toros',
  },
];

export const DashboardReproductivePanel: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [viewMode, setViewMode] = useState<'charts' | 'raw'>('charts');
  const [filterText, setFilterText] = useState('');

  // ECharts: Conception curve simulation
  const serviceProgressChartOptions = useMemo(() => ({
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
        data: [0, 58, 76, 84, 88],
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

  const filteredBatches = useMemo(() => {
    if (!filterText.trim()) return MOCK_SERVICE_BATCHES;
    const q = filterText.toLowerCase();
    return MOCK_SERVICE_BATCHES.filter(
      (b) => b.name.toLowerCase().includes(q) || b.paddock.toLowerCase().includes(q)
    );
  }, [filterText]);

  const totals = useMemo(() => {
    const totalFemales = filteredBatches.reduce((acc, b) => acc + b.females, 0);
    const totalMales = filteredBatches.reduce((acc, b) => acc + b.males, 0);
    const avgRatio = totalFemales > 0 ? Number(((totalMales / totalFemales) * 100).toFixed(2)) : 0;
    return { totalFemales, totalMales, avgRatio };
  }, [filteredBatches]);

  return (
    <Stack spacing={3}>
      {/* 1. Unified Reproduction Analytical Dual Container */}
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
              Dinámica Reproductiva y Eficiencia de Entore
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
              | Ventana Temporal 60-90 Días
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

            {/* Date Pill */}
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
                Campaña 2026/2027
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
            {/* Left: Pregnancy Conception Curve */}
            <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.84rem', color: 'text.primary' }}>
                      Curva de Servicios &amp; Preñez Proyectada
                    </Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', mt: 0.25 }}>
                      Dinámica de concepción en ventana temporal de 60–90 días (INTA Balcarce)
                    </Typography>
                  </Box>
                  <Chip
                    label="Modelo Balcarce"
                    size="small"
                    sx={{ fontWeight: 600, fontSize: '0.68rem', height: 22, bgcolor: '#fff1f2', color: '#be123c', border: '1px solid #fecdd3' }}
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
                <ReactECharts option={serviceProgressChartOptions} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'svg' }} />
              </Box>
            </Box>

            {/* Right: Zootechnical Parameters */}
            <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.84rem', color: 'text.primary' }}>
                      Parámetros Zootécnicos del Rodeo
                    </Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', mt: 0.25 }}>
                      Capacidad de monta, ratio de asignación y sincronismo
                    </Typography>
                  </Box>
                  <Chip
                    label="Entore Activo"
                    size="small"
                    sx={{ fontWeight: 600, fontSize: '0.68rem', height: 22, bgcolor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 }}>
                <Box sx={{ p: 1.75, borderRadius: '6px', bgcolor: 'slate.50', border: '1px solid', borderColor: 'divider' }}>
                  <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                    RATIO GLOBAL DE TORADA
                  </Typography>
                  <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#047857', mt: 0.25 }}>
                    3.24% (1 Toro / 31 Vientres)
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', mt: 0.5 }}>
                    Recomendado: 2.5% a 3.5% en pasturas de llanura con topografía plana.
                  </Typography>
                </Box>

                <Box sx={{ p: 1.75, borderRadius: '6px', bgcolor: 'slate.50', border: '1px solid', borderColor: 'divider' }}>
                  <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                    PROYECCIÓN CABEZA DE PARICIÓN
                  </Typography>
                  <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#0284c7', mt: 0.25 }}>
                    68.5% en los primeros 21 días
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', mt: 0.5 }}>
                    Asegura un lote homogéneo al destete con pesos superiores a 180 kg.
                  </Typography>
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
                  <th>Ciclo Reproductivo</th>
                  <th>Días Transcurridos</th>
                  <th style={{ textAlign: 'right' }}>% Preñez Proyectada</th>
                  <th style={{ textAlign: 'right' }}>Meta INTA Balcarce</th>
                  <th>Estado del Ciclo</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { c: 'Inicio de Entore', d: 'Día 0', p: '0%', m: '—', s: 'Apertura de tranqueras' },
                  { c: 'Primer Celo (Cabeza)', d: 'Día 21', p: '58%', m: '> 65%', s: 'Pico de concepción' },
                  { c: 'Segundo Celo (Cuerpo)', d: 'Día 42', p: '76%', m: '> 65%', s: 'Consolidación de rodeo' },
                  { c: 'Tercer Celo (Cola)', d: 'Día 63', p: '84%', m: '> 65%', s: 'Servicio de repaso' },
                  { c: 'Cierre de Servicio', d: 'Día 90', p: '88%', m: '> 65%', s: 'Retiro de toros a descanso' },
                ].map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600, fontFamily: 'inherit' }}>{row.c}</td>
                    <td>{row.d}</td>
                    <td style={{ textAlign: 'right', color: '#d81b60', fontWeight: 700 }}>{row.p}</td>
                    <td style={{ textAlign: 'right', color: '#16a34a', fontWeight: 600 }}>{row.m}</td>
                    <td style={{ fontFamily: 'inherit', color: '#475569' }}>{row.s}</td>
                  </tr>
                ))}
              </tbody>
            </Box>
          </Box>
        )}
      </Paper>

      {/* 2. SAP ALV Grid: Breeding Service Batches */}
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
        {/* Table Header Toolbar */}
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
              <Box sx={{ width: 10, height: 10, bgcolor: '#d81b60', borderRadius: '2px' }} />
              <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem', color: 'text.primary', letterSpacing: '0.02em' }}>
                SAP ALV Grid · Lotes de Servicio Activos en Campo
              </Typography>
            </Box>
            <Chip
              label={`${filteredBatches.length} lotes en entore`}
              size="small"
              sx={{ fontWeight: 600, fontSize: '0.68rem', height: 22, bgcolor: '#fdf2f8', color: '#be123c', border: '1px solid #fbcfe8' }}
            />
            <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', display: { xs: 'none', md: 'inline' } }}>
              ({totals.totalFemales} vientres con {totals.totalMales} toros · Ratio global torada {totals.avgRatio}% Óptimo)
            </Typography>
          </Box>

          {/* Action Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ position: 'relative', width: 170 }}>
              <Box
                component="input"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder="Filtrar lote..."
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
              onClick={() => enqueueSnackbar('Exportando lotes de servicio a Excel...', { variant: 'info' })}
              sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600, color: 'text.primary', borderColor: 'divider', borderRadius: '5px', px: 1.5, py: 0.5 }}
              startIcon={
                <svg style={{ width: 14, height: 14, color: '#16a34a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              }
            >
              Exportar XLS
            </Button>

            <Button
              variant="contained"
              size="small"
              onClick={() => navigate('/gestation/service-batches')}
              sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600, color: '#ffffff', bgcolor: '#0a4d3c', borderRadius: '5px', px: 1.5, py: 0.5, boxShadow: 'none', '&:hover': { bgcolor: '#07382c', boxShadow: 'none' } }}
            >
              Gestionar Lotes
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
                <th>Lote de Servicio</th>
                <th>Potrero Asignado</th>
                <th style={{ textAlign: 'right' }}>Vientres (♀)</th>
                <th style={{ textAlign: 'right' }}>Toros (♂)</th>
                <th style={{ textAlign: 'right' }}>Ratio Torada</th>
                <th>Ventana Temporal</th>
                <th>Avance Preñez</th>
                <th style={{ textAlign: 'center', width: 90 }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {filteredBatches.map((batch, idx) => (
                <tr key={batch.id}>
                  <td style={{ textAlign: 'center', fontFamily: 'monospace', color: '#94a3b8', backgroundColor: '#f8fafc' }}>{idx + 1}</td>
                  <td style={{ fontWeight: 600, color: '#0a4d3c' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: batch.statusColor === 'green' ? '#10b981' : '#f59e0b' }} />
                      <Typography component="span" sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#0a4d3c' }}>
                        {batch.name}
                      </Typography>
                    </Box>
                  </td>
                  <td style={{ color: '#475569' }}>{batch.paddock}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>{batch.females}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>{batch.males}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                    <Box component="span" sx={{ fontWeight: 700, color: '#047857' }}>
                      {batch.ratio.toFixed(2)}%
                    </Box>{' '}
                    <Box component="span" sx={{ fontSize: '0.625rem', fontWeight: 700, px: 0.6, py: 0.1, borderRadius: '3px', bgcolor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
                      Óptimo
                    </Box>
                  </td>
                  <td style={{ color: '#475569', fontSize: '0.72rem' }}>
                    {batch.startDate} al {batch.endDate}
                  </td>
                  <td>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 70, height: 6, bgcolor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <Box sx={{ height: '100%', width: `${batch.pregnancyRate}%`, bgcolor: '#10b981' }} />
                      </Box>
                      <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, fontFamily: 'monospace' }}>
                        {batch.pregnancyRate}%
                      </Typography>
                    </Box>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <Button
                      size="small"
                      onClick={() => navigate('/gestation/service-batches')}
                      sx={{ textTransform: 'none', fontSize: '0.72rem', fontWeight: 600, color: '#0a4d3c', p: 0, minWidth: 'auto', '&:hover': { textDecoration: 'underline' } }}
                    >
                      Detalles →
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: '#f1f5f9', fontWeight: 700 }}>
                <td style={{ textAlign: 'center', fontFamily: 'monospace', color: '#94a3b8', backgroundColor: '#e2e8f0' }}>∑</td>
                <td colSpan={2} style={{ color: '#334155', textTransform: 'uppercase' }}>Totales Consolidados de Entore Activo</td>
                <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#064e3b', fontWeight: 800 }}>{totals.totalFemales} ♀</td>
                <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#064e3b', fontWeight: 800 }}>{totals.totalMales} ♂</td>
                <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#064e3b', fontWeight: 800 }}>{totals.avgRatio}% Global</td>
                <td colSpan={2} style={{ color: '#64748b', fontWeight: 500, fontSize: '0.7rem' }}>Actualizado hoy por Sistema Telemetría RFID</td>
                <td style={{ textAlign: 'center', fontFamily: 'monospace', color: '#64748b', fontSize: '0.7rem' }}>{filteredBatches.length} lotes</td>
              </tr>
            </tfoot>
          </Box>
        </Box>
      </Box>
    </Stack>
  );
};

export default DashboardReproductivePanel;
