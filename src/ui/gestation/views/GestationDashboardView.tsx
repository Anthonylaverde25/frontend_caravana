import { useState, useMemo } from 'react';
import {
  Paper,
  Typography,
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Collapse,
  Divider,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';
import ReactEcharts from 'echarts-for-react';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import ViewLayout from 'src/components/ViewLayout';
import { useCompany } from '@/contexts/CompanyContext';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import React from 'react';
import { useNavigate } from 'react-router';

// Helper to compute remaining days of pregnancy
const getDaysLeft = (dueDateStr?: string | null) => {
  if (!dueDateStr) return 0;
  const dueDate = new Date(dueDateStr);
  const today = new Date();
  dueDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

// Helper to resolve risk based on category and days left
const getRiskDetails = (category: string | null, daysLeft: number) => {
  const catNormalized = (category || '').toLowerCase();
  if (catNormalized.includes('vaquillona') || catNormalized.includes('vaquilla')) {
    if (daysLeft <= 45) {
      return { risk: 'High', label: 'Alto (1er Parto Temprano)' };
    }
    return { risk: 'Medium', label: 'Medio (Vaquillona)' };
  }
  if (daysLeft <= 30) {
    return { risk: 'Medium', label: 'Medio (Parto Próximo)' };
  }
  return { risk: 'Low', label: 'Bajo' };
};

// Helper to get Spanish labels for gestation stages
const getStageLabel = (stage?: string) => {
  switch (stage) {
    case 'head': return 'Cabeza';
    case 'body': return 'Cuerpo';
    case 'tail': return 'Cola';
    default: return '-';
  }
};

function GestationDashboardView() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { activeCompanyId } = useCompany();
  const navigate = useNavigate();

  // Fetch caravans from active company
  const { data: caravans = [], isLoading } = useCaravans(activeCompanyId);

  // State for Smart Filter Bar
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState('all');
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterBarExpanded, setFilterBarExpanded] = useState(true);
  const [activeAnalysisTab, setActiveAnalysisTab] = useState(0);

  // Theme-aware styles and colors
  const textColor = theme.palette.text.primary;
  const secondaryTextColor = theme.palette.text.secondary;
  const gridLineColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)';

  // Reset filter inputs
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStage('all');
    setSelectedBatch('all');
    setSelectedCategory('all');
  };

  // Filter only pregnant caravans (active_gestation is not null)
  const gestatingCaravans = useMemo(() => {
    return caravans.filter(c => c.active_gestation !== null);
  }, [caravans]);

  // Dynamically extract batches and categories from gestating caravans for filters
  const batches = useMemo<string[]>(() => {
    const set = new Set<string>(gestatingCaravans.map(c => String(c.batch_name || 'Sin Lote')));
    return Array.from(set).sort();
  }, [gestatingCaravans]);

  const categories = useMemo<string[]>(() => {
    const set = new Set<string>(gestatingCaravans.map(c => String(c.category || 'Sin Categoría')));
    return Array.from(set).sort();
  }, [gestatingCaravans]);

  // Calculate dynamic stats
  const stats = useMemo(() => {
    const exposed = caravans.filter(c => c.sex === 'H').length;
    const pregnant = gestatingCaravans.length;
    const empty = exposed - pregnant;
    const pregnancyRate = exposed > 0 ? ((pregnant / exposed) * 100).toFixed(1) + '%' : '0.0%';

    const headCount = gestatingCaravans.filter(c => c.active_gestation?.gestation_stage === 'head').length;
    const headRate = pregnant > 0 ? ((headCount / pregnant) * 100).toFixed(1) + '%' : '0.0%';

    const bodyCount = gestatingCaravans.filter(c => c.active_gestation?.gestation_stage === 'body').length;
    const bodyRate = pregnant > 0 ? ((bodyCount / pregnant) * 100).toFixed(1) + '%' : '0.0%';

    const tailCount = gestatingCaravans.filter(c => c.active_gestation?.gestation_stage === 'tail').length;
    const tailRate = pregnant > 0 ? ((tailCount / pregnant) * 100).toFixed(1) + '%' : '0.0%';

    // Upcoming births (FPP in next 30 days)
    const upcomingBirths30d = gestatingCaravans.filter(c => {
      if (!c.active_gestation?.estimated_due_date) return false;
      const daysLeft = getDaysLeft(c.active_gestation.estimated_due_date);
      return daysLeft >= 0 && daysLeft <= 30;
    }).length;

    return {
      exposed,
      pregnant,
      empty,
      pregnancyRate,
      headCount,
      headRate,
      bodyCount,
      bodyRate,
      tailCount,
      tailRate,
      upcomingBirths30d,
      abortions: 0,
      abortionRate: '0.0%'
    };
  }, [caravans, gestatingCaravans]);

  // Dynamically filter animal records
  const filteredAnimals = useMemo(() => {
    return gestatingCaravans.filter((animal) => {
      const activeGestation = animal.active_gestation;
      
      const matchesSearch = 
        animal.identification.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (animal.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (animal.batch_name || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStage = selectedStage === 'all' || activeGestation?.gestation_stage === selectedStage;
      const matchesBatch = selectedBatch === 'all' || (animal.batch_name || 'Sin Lote') === selectedBatch;
      const matchesCategory = selectedCategory === 'all' || (animal.category || 'Sin Categoría') === selectedCategory;
      
      return matchesSearch && matchesStage && matchesBatch && matchesCategory;
    });
  }, [gestatingCaravans, searchQuery, selectedStage, selectedBatch, selectedCategory]);

  // Group filtered animals by batch
  const groupedAnimals = useMemo(() => {
    const groups: Record<string, typeof caravans> = {};
    filteredAnimals.forEach(c => {
      const batchName = c.batch_name || 'Sin Lote';
      if (!groups[batchName]) {
        groups[batchName] = [];
      }
      groups[batchName].push(c);
    });
    return groups;
  }, [filteredAnimals]);

  // Generate next 5 months for calving projection
  const next5Months = useMemo(() => {
    const list = [];
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('es-ES', { month: 'long' });
    for (let i = 0; i < 5; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const label = formatter.format(d);
      list.push({
        year: d.getFullYear(),
        month: d.getMonth(),
        label: label.charAt(0).toUpperCase() + label.slice(1)
      });
    }
    return list;
  }, []);

  // Compute calving calendar monthly data
  const calvingCalendarData = useMemo(() => {
    const headData = [0, 0, 0, 0, 0];
    const bodyData = [0, 0, 0, 0, 0];
    const tailData = [0, 0, 0, 0, 0];

    gestatingCaravans.forEach(c => {
      if (!c.active_gestation?.estimated_due_date) return;
      const dueDate = new Date(c.active_gestation.estimated_due_date);
      const dueYear = dueDate.getFullYear();
      const dueMonth = dueDate.getMonth();

      const index = next5Months.findIndex(m => m.year === dueYear && m.month === dueMonth);
      if (index !== -1) {
        const stage = c.active_gestation.gestation_stage;
        if (stage === 'head') {
          headData[index]++;
        } else if (stage === 'body') {
          bodyData[index]++;
        } else if (stage === 'tail') {
          tailData[index]++;
        }
      }
    });

    return { headData, bodyData, tailData };
  }, [gestatingCaravans, next5Months]);

  // Alert computations
  const upcomingTransferCount = useMemo(() => {
    return gestatingCaravans.filter(c => {
      if (c.active_gestation?.gestation_stage !== 'head') return false;
      const daysLeft = getDaysLeft(c.active_gestation.estimated_due_date);
      return daysLeft >= 0 && daysLeft <= 15;
    }).length;
  }, [gestatingCaravans]);

  const hasPregnantVaquillonas = useMemo(() => {
    return gestatingCaravans.some(c => (c.category || '').toLowerCase().includes('vaquillona'));
  }, [gestatingCaravans]);

  // ECharts Option A: Reproductive Status (Pregnancy vs Empty)
  const getPregnancyStatusOption = () => ({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: <b>{c}</b> ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: '0%',
      left: 'center',
      textStyle: { color: secondaryTextColor, fontSize: 10 }
    },
    series: [
      {
        name: 'Estado Reproductivo',
        type: 'pie',
        radius: ['55%', '75%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: isDark ? theme.palette.background.paper : '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '14',
            fontWeight: 'bold',
            formatter: '{b}\n{d}%',
            color: textColor
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: stats.pregnant, name: 'Preñadas', itemStyle: { color: '#0a6ed1' } },
          { value: stats.empty, name: 'Vacías', itemStyle: { color: isDark ? 'rgba(255, 255, 255, 0.2)' : '#e2e8f0' } }
        ]
      }
    ]
  });

  // ECharts Option B: Pregnancy Stage Distribution (Cabeza, Cuerpo, Cola)
  const getPregnancyStageOption = () => ({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: <b>{c}</b> ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: '0%',
      left: 'center',
      textStyle: { color: secondaryTextColor, fontSize: 10 }
    },
    series: [
      {
        name: 'Distribución de Preñez',
        type: 'pie',
        radius: ['55%', '75%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: isDark ? theme.palette.background.paper : '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '14',
            fontWeight: 'bold',
            formatter: '{b}\n{d}%',
            color: textColor
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: stats.headCount, name: 'Cabeza', itemStyle: { color: '#10b981' } },
          { value: stats.bodyCount, name: 'Cuerpo', itemStyle: { color: '#f59e0b' } },
          { value: stats.tailCount, name: 'Cola', itemStyle: { color: '#ef4444' } }
        ]
      }
    ]
  });

  // ECharts Option C: Projected Calving Calendar
  const getCalvingCalendarOption = () => ({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      textStyle: { color: secondaryTextColor, fontSize: 10 },
      bottom: '0%'
    },
    grid: {
      top: '10%',
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: next5Months.map(m => m.label),
        axisLabel: { color: secondaryTextColor, fontSize: 10 },
        axisLine: { lineStyle: { color: gridLineColor } }
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: 'Partos',
        nameTextStyle: { color: secondaryTextColor, fontSize: 10 },
        axisLabel: { color: secondaryTextColor, fontSize: 10 },
        axisLine: { lineStyle: { color: gridLineColor } },
        splitLine: { lineStyle: { color: gridLineColor } }
      }
    ],
    series: [
      {
        name: 'Cabeza (Parto Temprano)',
        type: 'bar',
        stack: 'Adul',
        emphasis: { focus: 'series' },
        itemStyle: { color: '#10b981' },
        data: calvingCalendarData.headData
      },
      {
        name: 'Cuerpo (Parto Medio)',
        type: 'bar',
        stack: 'Adul',
        emphasis: { focus: 'series' },
        itemStyle: { color: '#f59e0b' },
        data: calvingCalendarData.bodyData
      },
      {
        name: 'Cola (Parto Tardío)',
        type: 'bar',
        stack: 'Adul',
        emphasis: { focus: 'series' },
        itemStyle: { color: '#ef4444', borderRadius: [2, 2, 0, 0] },
        data: calvingCalendarData.tailData
      }
    ]
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: 2 }}>
        <CircularProgress />
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
          Cargando datos gestacionales...
        </Typography>
      </Box>
    );
  }

  return (
    <ViewLayout
      title="Panel de Control Gestacional"
      subtitle="Monitoreo de preñez, distribución de parición y alertas reproductivas."
      actions={
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<FuseSvgIcon size={20}>heroicons-outline:funnel</FuseSvgIcon>}
            onClick={() => setFilterBarExpanded(!filterBarExpanded)}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            {filterBarExpanded ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </Button>
          <Button
            variant="contained"
            startIcon={<FuseSvgIcon size={20}>heroicons-outline:plus</FuseSvgIcon>}
            sx={{ textTransform: 'none', fontWeight: 800, bgcolor: 'primary.main', color: '#fff' }}
          >
            Nuevo Tacto
          </Button>
        </Stack>
      }
    >
      <Stack spacing={4}>
        {/* SAP Fiori Smart Filter Bar */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            border: 1,
            borderColor: 'divider',
            borderRadius: '4px',
            bgcolor: isDark ? 'background.paper' : '#f8f9fa',
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: filterBarExpanded ? 2 : 0 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <FuseSvgIcon size={18} sx={{ color: 'text.secondary' }}>heroicons-outline:funnel</FuseSvgIcon>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Barra de Filtros Inteligente
              </Typography>
              <Chip
                label={`${(searchQuery ? 1 : 0) + (selectedStage !== 'all' ? 1 : 0) + (selectedBatch !== 'all' ? 1 : 0) + (selectedCategory !== 'all' ? 1 : 0)} activos`}
                size="small"
                sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
              />
            </Stack>
          </Stack>

          <Collapse in={filterBarExpanded}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '2fr 1.5fr 1.5fr 1.5fr 1fr' },
                gap: 2,
                alignItems: 'center',
                mt: 1
              }}
            >
              <TextField
                fullWidth
                size="small"
                label="Buscar Caravana"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ej: AR-1988"
                variant="outlined"
                sx={{ bgcolor: isDark ? 'background.default' : '#fff' }}
              />
              <FormControl fullWidth size="small">
                <InputLabel id="stage-filter-label">Estadio Preñez</InputLabel>
                <Select
                  labelId="stage-filter-label"
                  value={selectedStage}
                  label="Estadio Preñez"
                  onChange={(e) => setSelectedStage(e.target.value)}
                  sx={{ bgcolor: isDark ? 'background.default' : '#fff' }}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="head">Cabeza</MenuItem>
                  <MenuItem value="body">Cuerpo</MenuItem>
                  <MenuItem value="tail">Cola</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel id="batch-filter-label">Lote</InputLabel>
                <Select
                  labelId="batch-filter-label"
                  value={selectedBatch}
                  label="Lote"
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  sx={{ bgcolor: isDark ? 'background.default' : '#fff' }}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  {batches.map(batchName => (
                    <MenuItem key={batchName} value={batchName}>{batchName}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel id="category-filter-label">Categoría</InputLabel>
                <Select
                  labelId="category-filter-label"
                  value={selectedCategory}
                  label="Categoría"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  sx={{ bgcolor: isDark ? 'background.default' : '#fff' }}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  {categories.map(categoryName => (
                    <MenuItem key={categoryName} value={categoryName}>{categoryName}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="text"
                  color="secondary"
                  size="small"
                  onClick={handleResetFilters}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Limpiar
                </Button>
              </Box>
            </Box>
          </Collapse>
        </Paper>

        {/* Fiori KPI Tiles Row */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
            gap: 3
          }}
        >
          <Paper
            elevation={0}
            sx={{
              position: 'relative',
              p: 2,
              border: 1,
              borderColor: 'divider',
              borderRadius: '4px',
              bgcolor: 'background.paper',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: 110,
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                bgcolor: '#0a6ed1',
                borderTopLeftRadius: '4px',
                borderTopRightRadius: '4px'
              }
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                Tasa de Preñez
              </Typography>
              <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mt: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
                  {stats.pregnancyRate}
                </Typography>
              </Stack>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
              {stats.pregnant} de {stats.exposed} expuestas
            </Typography>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              position: 'relative',
              p: 2,
              border: 1,
              borderColor: 'divider',
              borderRadius: '4px',
              bgcolor: 'background.paper',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: 110,
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                bgcolor: '#10b981',
                borderTopLeftRadius: '4px',
                borderTopRightRadius: '4px'
              }
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                Cabeza de Parición
              </Typography>
              <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mt: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#10b981' }}>
                  {stats.headRate}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Estadio Temprano
                </Typography>
              </Stack>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
              {stats.headCount} vientres confirmados
            </Typography>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              position: 'relative',
              p: 2,
              border: 1,
              borderColor: 'divider',
              borderRadius: '4px',
              bgcolor: 'background.paper',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: 110,
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                bgcolor: '#ef4444',
                borderTopLeftRadius: '4px',
                borderTopRightRadius: '4px'
              }
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                Merma Tacto-Parto
              </Typography>
              <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mt: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#ef4444' }}>
                  {stats.abortionRate}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Abortos / Pérdidas
                </Typography>
              </Stack>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
              {stats.abortions} pérdidas registradas
            </Typography>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              position: 'relative',
              p: 2,
              border: 1,
              borderColor: 'divider',
              borderRadius: '4px',
              bgcolor: 'background.paper',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: 110,
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                bgcolor: '#f59e0b',
                borderTopLeftRadius: '4px',
                borderTopRightRadius: '4px'
              }
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                Partos Próximos (30d)
              </Typography>
              <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mt: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#f59e0b' }}>
                  {stats.upcomingBirths30d}
                </Typography>
                <Typography variant="caption" sx={{ color: '#f59e0b', fontWeight: 700 }}>
                  Crítico
                </Typography>
              </Stack>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
              Mover a potrero de maternidad
            </Typography>
          </Paper>
        </Box>

        {/* Content Split Layout */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '8fr 4fr' },
            gap: 3
          }}
        >
          {/* Main analytical dashboard column */}
          <Stack spacing={3}>
            {/* Fiori Tabbed Analytics Box */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                border: 1,
                borderColor: 'divider',
                borderRadius: '4px',
                bgcolor: 'background.paper',
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs
                  value={activeAnalysisTab}
                  onChange={(_e, v) => setActiveAnalysisTab(v)}
                  sx={{
                    minHeight: 0,
                    '& .MuiTab-root': {
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      py: 1.5,
                      minHeight: 0,
                    }
                  }}
                >
                  <Tab label="Distribución y Estadio" />
                  <Tab label="Proyección de Nacimientos" />
                </Tabs>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Estadísticas de Preñez
                </Typography>
              </Stack>

              {activeAnalysisTab === 0 && (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                    gap: 2
                  }}
                >
                  <Box sx={{ p: 1, border: 1, borderColor: 'divider', borderRadius: '4px', bgcolor: isDark ? 'background.default' : '#fafafa' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, textAlign: 'center' }}>
                      Tasa de Preñez
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', textAlign: 'center', mb: 1 }}>
                      Preñadas vs Vacías
                    </Typography>
                    <Box sx={{ height: 220 }}>
                      <ReactEcharts option={getPregnancyStatusOption()} style={{ height: '100%', width: '100%' }} />
                    </Box>
                  </Box>
                  <Box sx={{ p: 1, border: 1, borderColor: 'divider', borderRadius: '4px', bgcolor: isDark ? 'background.default' : '#fafafa' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, textAlign: 'center' }}>
                      Distribución por Estadio
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', textAlign: 'center', mb: 1 }}>
                      Cabeza / Cuerpo / Cola
                    </Typography>
                    <Box sx={{ height: 220 }}>
                      <ReactEcharts option={getPregnancyStageOption()} style={{ height: '100%', width: '100%' }} />
                    </Box>
                  </Box>
                </Box>
              )}

              {activeAnalysisTab === 1 && (
                <Box sx={{ p: 1, border: 1, borderColor: 'divider', borderRadius: '4px', bgcolor: isDark ? 'background.default' : '#fafafa' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, textAlign: 'center' }}>
                    Calendario Estimado de Partos
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', textAlign: 'center', mb: 1 }}>
                    Nacimientos proyectados por mes y estadio (siguientes 5 meses)
                  </Typography>
                  <Box sx={{ height: 220 }}>
                    <ReactEcharts option={getCalvingCalendarOption()} style={{ height: '100%', width: '100%' }} />
                  </Box>
                </Box>
              )}
            </Paper>

            {/* Fiori-style Worklist Table */}
            <Paper
              elevation={0}
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: '4px',
                overflow: 'hidden',
                bgcolor: 'background.paper',
              }}
            >
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: isDark ? 'background.paper' : '#f8f9fa' }}>
                <Stack>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Monitoreo de Vientres Gestantes
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Registros filtrados: {filteredAnimals.length} de {gestatingCaravans.length}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => navigate('/gestation/list')}
                    startIcon={<FuseSvgIcon size={16}>heroicons-outline:list-bullet</FuseSvgIcon>}
                    sx={{ textTransform: 'none', py: 0.5, px: 1.5, fontSize: '0.75rem', borderRadius: '4px', color: '#fff' }}
                  >
                    Ver Listado Completo
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<FuseSvgIcon size={16}>heroicons-outline:arrow-down-tray</FuseSvgIcon>}
                    sx={{ textTransform: 'none', py: 0.5, px: 1.5, fontSize: '0.75rem', borderRadius: '4px' }}
                  >
                    Exportar
                  </Button>
                </Stack>
              </Box>

              <TableContainer sx={{ maxHeight: 500 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem', bgcolor: isDark ? '#1e293b' : '#f1f5f9', color: 'text.secondary', py: 1.5 }}>Caravana</TableCell>
                      <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem', bgcolor: isDark ? '#1e293b' : '#f1f5f9', color: 'text.secondary', py: 1.5 }}>Categoría</TableCell>
                      <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem', bgcolor: isDark ? '#1e293b' : '#f1f5f9', color: 'text.secondary', py: 1.5 }}>Lote Actual</TableCell>
                      <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem', bgcolor: isDark ? '#1e293b' : '#f1f5f9', color: 'text.secondary', py: 1.5 }} align="center">Estadio Preñez</TableCell>
                      <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem', bgcolor: isDark ? '#1e293b' : '#f1f5f9', color: 'text.secondary', py: 1.5 }} align="center">Parto Estimado (FPP)</TableCell>
                      <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem', bgcolor: isDark ? '#1e293b' : '#f1f5f9', color: 'text.secondary', py: 1.5 }} align="right">Restante</TableCell>
                      <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem', bgcolor: isDark ? '#1e293b' : '#f1f5f9', color: 'text.secondary', py: 1.5 }}>Riesgo</TableCell>
                      <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem', bgcolor: isDark ? '#1e293b' : '#f1f5f9', color: 'text.secondary', py: 1.5 }} align="center">Acción</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.keys(groupedAnimals).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                            No se encontraron caravanas que coincidan con los filtros.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      Object.entries(groupedAnimals).map(([batchName, groupList]) => (
                        <React.Fragment key={batchName}>
                          {/* Batch Header Row */}
                          <TableRow sx={{ bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(10, 110, 209, 0.04)' }}>
                            <TableCell colSpan={8} sx={{ py: 1.5, borderLeft: `4px solid ${theme.palette.primary.main}`, fontWeight: 800 }}>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <FuseSvgIcon size={18} sx={{ color: 'primary.main' }}>heroicons-outline:circle-stack</FuseSvgIcon>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                                  Lote: {batchName} ({groupList.length} vientres)
                                </Typography>
                              </Stack>
                            </TableCell>
                          </TableRow>
                          {/* Animals in this Batch */}
                          {groupList.map((row) => {
                            const activeGestation = row.active_gestation;
                            const daysLeft = getDaysLeft(activeGestation?.estimated_due_date);
                            const riskInfo = getRiskDetails(row.category, daysLeft);

                            return (
                              <TableRow key={row.id} hover sx={{ '&:last-child td, &:last-child th': { borderBottom: 1, borderColor: 'divider' } }}>
                                <TableCell sx={{ fontWeight: 700, color: '#0a6ed1', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                  {row.identification}
                                </TableCell>
                                <TableCell sx={{ fontSize: '0.75rem', py: 1 }}>{row.category || '-'}</TableCell>
                                <TableCell sx={{ fontSize: '0.75rem', py: 1 }}>{row.batch_name || 'Sin Lote'}</TableCell>
                                <TableCell align="center" sx={{ py: 1 }}>
                                  <Chip
                                    label={getStageLabel(activeGestation?.gestation_stage)}
                                    size="small"
                                    sx={{
                                      fontWeight: 700,
                                      height: 18,
                                      fontSize: '0.65rem',
                                      bgcolor:
                                        activeGestation?.gestation_stage === 'head'
                                          ? 'rgba(16, 185, 129, 0.1)'
                                          : activeGestation?.gestation_stage === 'body'
                                          ? 'rgba(245, 158, 11, 0.1)'
                                          : 'rgba(239, 68, 68, 0.1)',
                                      color:
                                        activeGestation?.gestation_stage === 'head'
                                          ? '#10b981'
                                          : activeGestation?.gestation_stage === 'body'
                                          ? '#f59e0b'
                                          : '#ef4444',
                                      border: 1,
                                      borderColor:
                                        activeGestation?.gestation_stage === 'head'
                                          ? 'rgba(16, 185, 129, 0.2)'
                                          : activeGestation?.gestation_stage === 'body'
                                          ? 'rgba(245, 158, 11, 0.2)'
                                          : 'rgba(239, 68, 68, 0.2)'
                                    }}
                                  />
                                </TableCell>
                                <TableCell align="center" sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.75rem', py: 1 }}>
                                  {activeGestation?.estimated_due_date || '-'}
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1 }}>
                                  {daysLeft} d
                                </TableCell>
                                <TableCell sx={{ py: 1 }}>
                                  <Chip
                                    label={riskInfo.label}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                      fontWeight: 700,
                                      height: 18,
                                      fontSize: '0.65rem',
                                      color: riskInfo.risk === 'High' ? 'error.main' : riskInfo.risk === 'Medium' ? 'warning.main' : 'success.main',
                                      borderColor: riskInfo.risk === 'High' ? 'error.light' : riskInfo.risk === 'Medium' ? 'warning.light' : 'success.light',
                                      bgcolor: riskInfo.risk === 'High' ? 'rgba(239, 68, 68, 0.05)' : riskInfo.risk === 'Medium' ? 'rgba(245, 158, 11, 0.05)' : 'rgba(16, 185, 129, 0.05)',
                                      borderRadius: '2px'
                                    }}
                                  />
                                </TableCell>
                                <TableCell align="center" sx={{ py: 0.5 }}>
                                  <Tooltip title="Ver Ficha / Editar">
                                    <IconButton size="small" color="primary" sx={{ p: 0.25 }}>
                                      <FuseSvgIcon size={16}>heroicons-outline:pencil-square</FuseSvgIcon>
                                    </IconButton>
                                  </Tooltip>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </React.Fragment>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Stack>

          {/* Right side operational/alerts column */}
          <Stack spacing={3}>
            {/* Actionable Fiori Alerts */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                border: 1,
                borderColor: 'divider',
                borderRadius: '4px',
                bgcolor: 'background.paper',
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2, borderBottom: 1, borderColor: 'divider', pb: 1 }}>
                <FuseSvgIcon size={18} sx={{ color: 'error.main' }}>heroicons-outline:shield-exclamation</FuseSvgIcon>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Notificaciones Operativas
                </Typography>
              </Stack>

              <Stack spacing={2.5}>
                <Box
                  sx={{
                    p: 1.5,
                    border: 1,
                    borderColor: 'divider',
                    borderLeft: '4px solid #0a6ed1',
                    borderRadius: '2px',
                    bgcolor: isDark ? 'background.default' : '#f8fafc'
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#0a6ed1', display: 'flex', alignItems: 'center' }}>
                    <FuseSvgIcon size={16} sx={{ mr: 0.5 }}>heroicons-outline:truck</FuseSvgIcon>
                    Traslado Requerido (Manejo)
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5, lineHeight: 1.4 }}>
                    {upcomingTransferCount > 0 ? (
                      <>
                        <strong>{upcomingTransferCount} vientres</strong> en categoría <strong>Cabeza</strong> estimadas para parto en los próximos 15 días. Trasladar al potrero de maternidad.
                      </>
                    ) : (
                      <>No hay traslados críticos de vientres en estadio Cabeza programados para los próximos 15 días.</>
                    )}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    p: 1.5,
                    border: 1,
                    borderColor: 'divider',
                    borderLeft: '4px solid #f59e0b',
                    borderRadius: '2px',
                    bgcolor: isDark ? 'background.default' : '#fffbeb'
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#b45309', display: 'flex', alignItems: 'center' }}>
                    <FuseSvgIcon size={16} sx={{ mr: 0.5 }}>heroicons-outline:exclamation-triangle</FuseSvgIcon>
                    Baja Condición Corporal (Nutrición)
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5, lineHeight: 1.4 }}>
                    <strong>7 vientres preñados</strong> registran condición corporal inferior a 2.5. Apartar para suplementación preferencial.
                  </Typography>
                </Box>

                <Box
                  sx={{
                    p: 1.5,
                    border: 1,
                    borderColor: 'divider',
                    borderLeft: '4px solid #ef4444',
                    borderRadius: '2px',
                    bgcolor: isDark ? 'background.default' : '#fef2f2'
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#dc2626', display: 'flex', alignItems: 'center' }}>
                    <FuseSvgIcon size={16} sx={{ mr: 0.5 }}>heroicons-outline:beaker</FuseSvgIcon>
                    Protocolo Vacunación Vencido
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5, lineHeight: 1.4 }}>
                    {hasPregnantVaquillonas ? (
                      <>Lote de <strong>Vaquillonas</strong> registrado debe iniciar inmunización para Diarrea Neonatal Ternero (DNT) en los próximos 10 días.</>
                    ) : (
                      <>No se registran lotes de vaquillonas gestantes que requieran inicio de protocolo de inmunización DNT inmediato.</>
                    )}
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            {/* Quick Actions Panel */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                border: 1,
                borderColor: 'divider',
                borderRadius: '4px',
                bgcolor: 'background.paper',
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2, borderBottom: 1, borderColor: 'divider', pb: 1 }}>
                <FuseSvgIcon size={18} sx={{ color: 'primary.main' }}>heroicons-outline:bolt</FuseSvgIcon>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Acciones Rápidas
                </Typography>
              </Stack>

              <Stack spacing={1.5}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  startIcon={<FuseSvgIcon size={18}>heroicons-outline:plus</FuseSvgIcon>}
                  sx={{ textTransform: 'none', justifyContent: 'flex-start', py: 1, fontWeight: 700, borderRadius: '4px', fontSize: '0.8rem' }}
                >
                  Registrar Nuevo Tacto
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  startIcon={<FuseSvgIcon size={18}>heroicons-outline:calendar-days</FuseSvgIcon>}
                  sx={{ textTransform: 'none', justifyContent: 'flex-start', py: 1, fontWeight: 700, borderRadius: '4px', fontSize: '0.8rem' }}
                >
                  Programar Alertas Sanitarias
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  startIcon={<FuseSvgIcon size={18}>heroicons-outline:arrows-right-left</FuseSvgIcon>}
                  sx={{ textTransform: 'none', justifyContent: 'flex-start', py: 1, fontWeight: 700, borderRadius: '4px', fontSize: '0.8rem' }}
                >
                  Movimiento de Lote Gestante
                </Button>
                <Divider sx={{ my: 0.5 }} />
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  startIcon={<FuseSvgIcon size={18} sx={{ color: '#fff' }}>heroicons-outline:arrow-down-tray</FuseSvgIcon>}
                  sx={{ textTransform: 'none', py: 1, fontWeight: 800, borderRadius: '4px', fontSize: '0.8rem', color: '#fff' }}
                >
                  Descargar Reporte FPP
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </Box>
      </Stack>
    </ViewLayout>
  );
}

export default GestationDashboardView;
