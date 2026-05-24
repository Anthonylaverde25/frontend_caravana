import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import {
  Paper,
  Typography,
  Box,
  Stack,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
  Chip,
  Divider,
  Alert,
  IconButton,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  CircularProgress,
  Autocomplete,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  CardContent,
  Avatar,
  Tooltip
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useCompany } from '@/contexts/CompanyContext';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import { useBatches } from '@/features/batches/hooks/useBatches';
import axiosInstance from '@/utils/axios';
import { toast } from 'sonner';

/**
 * SireRotationManager Component
 * Re-designed in SAP Fiori style.
 * Uses strict rectangular layouts (borderRadius: 0), solid corporate colors, and zero gradients/shadows.
 * Features a flow starting from a "Nueva Orden de Servicio" button.
 */
function SireRotationManager() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Helper to generate default service order code
  const generateDefaultCode = () => {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randStr = Math.floor(1000 + Math.random() * 9000);
    return `SO-${dateStr}-${randStr}`;
  };

  // 1. Fetch active company and load data from database (API)
  const { activeCompanyId } = useCompany();
  const { data: dbBatches = [], isLoading: isLoadingBatches } = useBatches();
  const { data: caravans = [], isLoading: isLoadingCaravans } = useCaravans(activeCompanyId);

  // Read search parameters from URL
  const [searchParams] = useSearchParams();
  const shouldCreate = searchParams.get('action') === 'create';

  // 2. Local States
  const [isCreating, setIsCreating] = useState<boolean>(shouldCreate);

  useEffect(() => {
    if (shouldCreate) {
      setIsCreating(true);
    }
  }, [shouldCreate]);
  const [selectedBatchId, setSelectedBatchId] = useState<number | 'all'>('all');
  const [orderCode, setOrderCode] = useState<string>(generateDefaultCode());
  const [observations, setObservations] = useState<string>('');
  const [serviceType, setServiceType] = useState<'single' | 'rotation'>('single');
  const [selectedSireIds, setSelectedSireIds] = useState<number[]>([]);
  const [selectedFemaleIds, setSelectedFemaleIds] = useState<number[]>([]);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 3. Filter Male Caravans (available bulls) directly from database
  const availableBulls = useMemo(() => {
    return caravans
      .filter(c => c.sex === 'M' && (c.category || '').toLowerCase() === 'toro')
      .sort((a, b) => a.identification.localeCompare(b.identification));
  }, [caravans]);

  // 4. Filter eligible female caravans from selected source batch (cows & heifers with no active gestation)
  const eligibleFemales = useMemo(() => {
    const list = caravans.filter(c => {
      const matchBatch = selectedBatchId === 'all' ? true : c.batch_id === selectedBatchId;
      const isFemale = c.sex === 'H';
      const isCorrectCategory = ['vaca', 'vaquillona', 'vaca_vacia'].includes((c.category || '').toLowerCase());
      const hasNoActiveGestation = c.active_gestation === null;
      return matchBatch && isFemale && isCorrectCategory && hasNoActiveGestation;
    });

    return list.sort((a, b) => a.identification.localeCompare(b.identification));
  }, [caravans, selectedBatchId]);

  // Calculate live counts of eligible females by category
  const categoryCounts = useMemo(() => {
    const counts = { all: eligibleFemales.length, vaca: 0, vaquillona: 0, vaca_vacia: 0 };
    eligibleFemales.forEach(f => {
      const cat = (f.category || '').toLowerCase();
      if (cat === 'vaca') counts.vaca++;
      else if (cat === 'vaquillona') counts.vaquillona++;
      else if (cat === 'vaca_vacia') counts.vaca_vacia++;
    });
    return counts;
  }, [eligibleFemales]);

  // Search & category filtered females
  const filteredFemales = useMemo(() => {
    return eligibleFemales.filter(f => {
      const matchesSearch = f.identification.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategoryFilter === 'all'
        ? true
        : (f.category || '').toLowerCase() === selectedCategoryFilter.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [eligibleFemales, searchQuery, selectedCategoryFilter]);

  // Auto-select eligible females when the source batch changes
  useEffect(() => {
    setSelectedFemaleIds(eligibleFemales.map(f => f.id));
  }, [eligibleFemales]);

  // 5. Count selected females in service
  const selectedCowCount = selectedFemaleIds.length;

  // 7. Handlers
  const handleAddBull = (bullId: number) => {
    if (serviceType === 'single') {
      setSelectedSireIds([bullId]);
    } else {
      if (!selectedSireIds.includes(bullId)) {
        setSelectedSireIds([...selectedSireIds, bullId]);
      }
    }
  };

  const handleRemoveBull = (bullId: number) => {
    setSelectedSireIds(selectedSireIds.filter(id => id !== bullId));
  };

  const handleSelectFemale = (id: number) => {
    if (selectedFemaleIds.includes(id)) {
      setSelectedFemaleIds(selectedFemaleIds.filter(fId => fId !== id));
    } else {
      setSelectedFemaleIds([...selectedFemaleIds, id]);
    }
  };

  const handleSelectAllFemales = () => {
    if (selectedFemaleIds.length === filteredFemales.length) {
      setSelectedFemaleIds([]);
    } else {
      setSelectedFemaleIds(filteredFemales.map(f => f.id));
    }
  };

  const handleDiscard = () => {
    setSelectedSireIds([]);
    setSelectedFemaleIds([]);
    setObservations('');
    setSelectedBatchId('all');
    setOrderCode(generateDefaultCode());
    setSearchQuery('');
    setSelectedCategoryFilter('all');
    setErrorMsg(null);
    setIsCreating(false);
  };

  const handleCreateOrder = async () => {
    if (selectedBatchId === 'all') {
      toast.error('Debe seleccionar un lote específico para generar la orden de servicio');
      return;
    }
    if (selectedSireIds.length === 0) {
      toast.error('Debe asignar al menos un toro reproductor');
      return;
    }
    if (selectedFemaleIds.length === 0) {
      toast.error('Debe seleccionar al menos un vientre apto');
      return;
    }
    if (!orderCode.trim()) {
      toast.error('Debe ingresar un código para la orden de servicio');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await axiosInstance.post('/service-orders', {
        batch_id: selectedBatchId,
        code: orderCode.trim(),
        planned_start_date: startDate,
        observations: observations.trim() || null,
        male_caravan_ids: selectedSireIds,
        female_caravan_ids: selectedFemaleIds
      });

      toast.success('Orden de Servicio creada exitosamente en borrador');
      handleDiscard();
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || 'Error desconocido';
      setErrorMsg(msg);
      toast.error(`Error al crear la orden: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper styles for Fiori semantic categorization colors (flat & serious)
  const getCategoryBadgeStyles = (category: string) => {
    const lowerCategory = (category || '').toLowerCase();
    if (lowerCategory === 'vaca') {
      return {
        bg: isDark ? 'rgba(16, 185, 129, 0.1)' : '#eefbee',
        color: isDark ? '#4ade80' : '#107e3e',
        border: isDark ? '1px solid rgba(74, 222, 128, 0.3)' : '1px solid #107e3e',
        label: 'Vaca'
      };
    }
    if (lowerCategory === 'vaquillona') {
      return {
        bg: isDark ? 'rgba(59, 130, 246, 0.1)' : '#f0f4fa',
        color: isDark ? '#60a5fa' : '#0a6ed1',
        border: isDark ? '1px solid rgba(96, 165, 250, 0.3)' : '1px solid #0a6ed1',
        label: 'Vaquillona'
      };
    }
    return {
      bg: isDark ? 'rgba(245, 158, 11, 0.1)' : '#fff7e6',
      color: isDark ? '#fbbf24' : '#e97c00',
      border: isDark ? '1px solid rgba(251, 191, 36, 0.3)' : '1px solid #e97c00',
      label: 'Vaca Vacía'
    };
  };

  const activeBatchName = useMemo(() => {
    if (selectedBatchId === 'all') return null;
    const batch = dbBatches.find(b => b.id === selectedBatchId);
    return batch ? `${batch.name} ${batch.farm_name ? `(${batch.farm_name})` : ''}` : null;
  }, [selectedBatchId, dbBatches]);

  const borderStyle = isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #d3d7db';
  const cellStyle = {
    px: 2,
    py: 1.25,
    borderBottom: '1px solid',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e5e9ec',
    fontSize: '0.8rem',
    borderRadius: 0,
    backgroundColor: 'transparent'
  };

  const tableHeaderStyle = {
    px: 2,
    py: 1.5,
    borderBottom: '2px solid',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : '#b4bbc2',
    fontSize: '0.78rem',
    fontWeight: 700,
    color: isDark ? 'text.secondary' : '#32363a',
    backgroundColor: isDark ? '#1e293b' : '#fafafa',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderRadius: 0
  };

  // Render loading state if data is fetching
  if (isLoadingBatches || isLoadingCaravans) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 12, gap: 2.5, borderRadius: 0 }}>
        <CircularProgress size={40} thickness={4} sx={{ borderRadius: 0 }} />
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: '0.2px' }}>
          Cargando configuración reproductiva...
        </Typography>
      </Box>
    );
  }

  // 8. INITIAL WELCOME/EMPTY STATE
  if (!isCreating) {
    return (
      <Box 
        sx={{ 
          width: '100%', 
          p: 6, 
          border: borderStyle, 
          borderRadius: 0,
          bgcolor: isDark ? '#1e293b' : '#fafafa',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          boxShadow: 'none'
        }}
      >
        <Avatar 
          sx={{ 
            bgcolor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#e1f0fc', 
            color: isDark ? '#60a5fa' : '#0a6ed1',
            width: 56, 
            height: 56,
            borderRadius: 0,
            mb: 2.5,
            border: isDark ? '1px solid rgba(96, 165, 250, 0.2)' : '1px solid #b4bbc2'
          }}
        >
          <FuseSvgIcon size={28}>heroicons-outline:document-text</FuseSvgIcon>
        </Avatar>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
          Órdenes de Servicio Reproductivo
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 450, mb: 4.5, fontSize: '0.85rem', lineHeight: 1.5 }}>
          Planifique y configure las asignaciones de toros reproductores a sus vientres por lotes específicos. Configure los sementales, controle el ratio de carga recomendado y genere el documento oficial.
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            setOrderCode(generateDefaultCode());
            setIsCreating(true);
          }}
          startIcon={<FuseSvgIcon size={18}>heroicons-outline:document-plus</FuseSvgIcon>}
          sx={{ 
            textTransform: 'none', 
            fontWeight: 700, 
            py: 1.25, 
            px: 4,
            color: '#fff', 
            borderRadius: 0, 
            fontSize: '0.85rem',
            boxShadow: 'none',
            bgcolor: isDark ? '#1b6ec2' : '#0064d2',
            '&:hover': {
              bgcolor: isDark ? '#155aa0' : '#004ca3',
              boxShadow: 'none'
            }
          }}
        >
          Nueva Orden de Servicio
        </Button>
      </Box>
    );
  }

  // 9. FORM CREATION MODE
  return (
    <Box sx={{ width: '100%', pb: 2, borderRadius: 0 }}>
      {errorMsg && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 0, border: '1px solid', borderColor: 'error.light', boxShadow: 'none' }} onClose={() => setErrorMsg(null)}>
          {errorMsg}
        </Alert>
      )}

      {/* TWO-COLUMN LAYOUT */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          gap: 4,
          alignItems: 'stretch',
          borderRadius: 0
        }}
      >
        {/* LEFT COLUMN: Configuration and Selection Fields */}
        <Box sx={{ flex: 1.8, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4, borderRadius: 0 }}>
          
          {/* STEP 1: General Order Metadata */}
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 0, 
              border: borderStyle,
              boxShadow: 'none',
              overflow: 'visible' 
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 3 }}>
                <Box sx={{ color: isDark ? '#60a5fa' : '#0f5b94', display: 'flex' }}>
                  <FuseSvgIcon size={18}>heroicons-outline:cog-8-tooth</FuseSvgIcon>
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.78rem', color: isDark ? 'text.secondary' : '#32363a' }}>
                  1. Configuración de la Orden
                </Typography>
              </Box>

              <Stack spacing={3}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2.5 }}>
                  <FormControl fullWidth size="small" required sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}>
                    <InputLabel id="source-batch-select-label">Lote de Trabajo (Servicio)</InputLabel>
                    <Select
                      labelId="source-batch-select-label"
                      value={selectedBatchId}
                      label="Lote de Trabajo (Servicio)"
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedBatchId(val === 'all' ? 'all' : Number(val));
                      }}
                    >
                      <MenuItem value="all"><em>-- Seleccione un Lote --</em></MenuItem>
                      {dbBatches.map(b => (
                        <MenuItem key={b.id} value={b.id}>
                          {b.name} {b.farm_name ? `(${b.farm_name})` : ''}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    required
                    fullWidth
                    size="small"
                    label="Código de la Orden"
                    placeholder="SO-YYYYMMDD-XXXX"
                    value={orderCode}
                    onChange={(e) => setOrderCode(e.target.value)}
                    InputProps={{ sx: { borderRadius: 0 } }}
                  />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2.5 }}>
                  <TextField
                    required
                    fullWidth
                    label="Fecha Programada de Inicio"
                    type="date"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputProps={{ sx: { borderRadius: 0 } }}
                  />

                  <FormControl fullWidth size="small">
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, mb: 0.75, display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.2px' }}>
                      Modalidad de Servicio
                    </Typography>
                    <ToggleButtonGroup
                      value={serviceType}
                      exclusive
                      onChange={(e, val) => {
                        if (val !== null) {
                          setServiceType(val);
                          setSelectedSireIds([]);
                        }
                      }}
                      fullWidth
                      size="small"
                      color="primary"
                      sx={{ 
                        height: 38,
                        borderRadius: 0,
                        '& .MuiToggleButton-root': {
                          textTransform: 'none',
                          fontWeight: 700,
                          borderRadius: 0,
                          border: borderStyle,
                          '&.Mui-selected': {
                            backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#e1f0fc',
                            color: isDark ? '#60a5fa' : '#0a6ed1',
                            borderColor: isDark ? '#60a5fa' : '#0a6ed1',
                            '&:hover': {
                              backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#d0e7f8',
                            }
                          }
                        }
                      }}
                    >
                      <ToggleButton value="single" sx={{ gap: 1 }}>
                        <FuseSvgIcon size={16}>heroicons-outline:user</FuseSvgIcon>
                        Toro Único
                      </ToggleButton>
                      <ToggleButton value="rotation" sx={{ gap: 1 }}>
                        <FuseSvgIcon size={16}>heroicons-outline:users</FuseSvgIcon>
                        Rotativo Colectivo
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </FormControl>
                </Box>

                <TextField
                  size="small"
                  fullWidth
                  multiline
                  rows={3}
                  label="Observaciones de la Orden"
                  placeholder="Escriba aquí los detalles sobre el potrero asignado, las condiciones de salud de los toros o cualquier especificación técnica..."
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  InputProps={{ sx: { borderRadius: 0 } }}
                />
              </Stack>
            </CardContent>
          </Card>

          {/* STEP 2: Sire Assignment (Bulls) */}
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 0, 
              border: borderStyle,
              boxShadow: 'none',
              overflow: 'visible' 
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 3 }}>
                <Box sx={{ color: isDark ? '#60a5fa' : '#0f5b94', display: 'flex' }}>
                  <FuseSvgIcon size={18}>heroicons-outline:shield-check</FuseSvgIcon>
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.78rem', color: isDark ? 'text.secondary' : '#32363a' }}>
                  2. Asignar Machos Reproductores
                </Typography>
              </Box>

              <Stack spacing={3}>
                <Autocomplete
                  options={availableBulls.filter(bull => !selectedSireIds.includes(bull.id))}
                  getOptionLabel={(option) => `${option.identification} - ${option.breed || 'Sin Raza'}`}
                  onChange={(event, value) => {
                    if (value) {
                      handleAddBull(value.id);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Buscar y Asignar Semental (Toro)"
                      size="small"
                      placeholder="Escriba la identificación o raza del toro..."
                    />
                  )}
                  value={null}
                  blurOnSelect
                  clearOnBlur
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 0
                    }
                  }}
                />

                {/* VISUAL CARDS FOR ASSIGNED BULLS (Rectangular Fiori Style) */}
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 1.5, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.2px' }}>
                    Sementales Asignados ({selectedSireIds.length})
                  </Typography>

                  {selectedSireIds.length === 0 ? (
                    <Box 
                      sx={{ 
                        p: 4, 
                        border: '1px dashed', 
                        borderColor: isDark ? 'rgba(255,255,255,0.15)' : '#b4bbc2', 
                        borderRadius: 0, 
                        textAlign: 'center',
                        bgcolor: isDark ? '#1e293b' : '#fafafa'
                      }}
                    >
                      <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                        No hay toros asignados. Utilice el selector de arriba para buscar y agregar reproductores.
                      </Typography>
                    </Box>
                  ) : (
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: 2 
                      }}
                    >
                      {selectedSireIds.map(id => {
                        const bull = availableBulls.find(b => b.id === id);
                        return (
                          <Card
                            key={id}
                            variant="outlined"
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              p: 2,
                              borderRadius: 0,
                              minWidth: 200,
                              flex: '1 1 calc(50% - 8px)',
                              borderColor: isDark ? 'rgba(255,255,255,0.15)' : '#d3d7db',
                              background: isDark ? '#1e293b' : '#f8f9fa',
                              position: 'relative',
                              boxShadow: 'none',
                              '&:hover': {
                                borderColor: isDark ? '#60a5fa' : '#0a6ed1'
                              }
                            }}
                          >
                            <Avatar 
                              sx={{ 
                                bgcolor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#e1f0fc', 
                                color: isDark ? '#60a5fa' : '#0a6ed1',
                                mr: 2, 
                                width: 36, 
                                height: 36,
                                borderRadius: 0,
                                border: isDark ? '1px solid rgba(96, 165, 250, 0.3)' : '1px solid #0a6ed1'
                              }}
                            >
                              <FuseSvgIcon size={18}>heroicons-outline:shield-check</FuseSvgIcon>
                            </Avatar>
                            <Box sx={{ flexGrow: 1, pr: 2 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: 'monospace', color: isDark ? '#60a5fa' : '#0a6ed1', fontSize: '0.92rem' }}>
                                {bull?.identification || `Toro #${id}`}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                {bull?.breed || 'Sin Raza'}
                              </Typography>
                            </Box>
                            <Tooltip title="Remover Semental">
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveBull(id)}
                                sx={{
                                  color: 'text.disabled',
                                  borderRadius: 0,
                                  '&:hover': { 
                                    color: isDark ? '#ef4444' : '#bb0000',
                                    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)'
                                  }
                                }}
                              >
                                <FuseSvgIcon size={16}>heroicons-outline:x-mark</FuseSvgIcon>
                              </IconButton>
                            </Tooltip>
                          </Card>
                        );
                      })}
                    </Box>
                  )}
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* STEP 3: Vientres Disponibles (Eligible Females) */}
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 0, 
              border: borderStyle,
              boxShadow: 'none',
              overflow: 'hidden' 
            }}
          >
            <CardContent sx={{ p: 0 }}>
              {/* Header inside Card */}
              <Box sx={{ p: 3, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <Box sx={{ color: isDark ? '#60a5fa' : '#0f5b94', display: 'flex' }}>
                    <FuseSvgIcon size={18}>heroicons-outline:clipboard-document-list</FuseSvgIcon>
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.78rem', color: isDark ? 'text.secondary' : '#32363a' }}>
                    3. Selección de Vientres Aptos
                  </Typography>
                </Box>

                {selectedBatchId !== 'all' && filteredFemales.length > 0 && (
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={handleSelectAllFemales}
                    sx={{ 
                      fontSize: '0.72rem', 
                      textTransform: 'none', 
                      borderRadius: 0,
                      fontWeight: 700,
                      borderColor: isDark ? 'rgba(255,255,255,0.3)' : '#b4bbc2',
                      color: 'text.primary'
                    }}
                  >
                    {selectedFemaleIds.length === filteredFemales.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
                  </Button>
                )}
              </Box>

              {selectedBatchId === 'all' ? (
                <Box sx={{ px: 3, pb: 4, pt: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                  <Box sx={{ color: 'text.disabled', mb: 2, opacity: 0.6, display: 'flex' }}>
                    <FuseSvgIcon size={44}>heroicons-outline:information-circle</FuseSvgIcon>
                  </Box>
                  <Typography variant="subtitle2" color="text.primary" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Seleccione un Lote de Trabajo
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 320, display: 'block' }}>
                    Por favor, seleccione un lote de origen en el paso 1 para listar y elegir los vientres disponibles en esta orden.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ px: 3, pb: 3, borderRadius: 0 }}>
                  {/* Search and Filters Segment */}
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2.5, mt: 1 }}>
                    <TextField
                      size="small"
                      placeholder="Buscar por caravana..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      sx={{ 
                        flexGrow: 1,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 0
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <Box sx={{ color: 'text.disabled', mr: 1, display: 'flex', alignItems: 'center' }}>
                            <FuseSvgIcon size={16}>heroicons-outline:magnifying-glass</FuseSvgIcon>
                          </Box>
                        )
                      }}
                    />

                    {/* Quick Category Filters (Fiori flat style chips) */}
                    <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 0.5, alignItems: 'center' }}>
                      <Chip
                        label={`Todas (${categoryCounts.all})`}
                        onClick={() => setSelectedCategoryFilter('all')}
                        color={selectedCategoryFilter === 'all' ? 'primary' : 'default'}
                        variant={selectedCategoryFilter === 'all' ? 'filled' : 'outlined'}
                        size="small"
                        sx={{ fontWeight: 700, borderRadius: 0, px: 0.5 }}
                      />
                      <Chip
                        label={`Vacas (${categoryCounts.vaca})`}
                        onClick={() => setSelectedCategoryFilter('vaca')}
                        color={selectedCategoryFilter === 'vaca' ? 'primary' : 'default'}
                        variant={selectedCategoryFilter === 'vaca' ? 'filled' : 'outlined'}
                        size="small"
                        sx={{ fontWeight: 700, borderRadius: 0, px: 0.5 }}
                      />
                      <Chip
                        label={`Vaquillonas (${categoryCounts.vaquillona})`}
                        onClick={() => setSelectedCategoryFilter('vaquillona')}
                        color={selectedCategoryFilter === 'vaquillona' ? 'primary' : 'default'}
                        variant={selectedCategoryFilter === 'vaquillona' ? 'filled' : 'outlined'}
                        size="small"
                        sx={{ fontWeight: 700, borderRadius: 0, px: 0.5 }}
                      />
                      <Chip
                        label={`Vacías (${categoryCounts.vaca_vacia})`}
                        onClick={() => setSelectedCategoryFilter('vaca_vacia')}
                        color={selectedCategoryFilter === 'vaca_vacia' ? 'primary' : 'default'}
                        variant={selectedCategoryFilter === 'vaca_vacia' ? 'filled' : 'outlined'}
                        size="small"
                        sx={{ fontWeight: 700, borderRadius: 0, px: 0.5 }}
                      />
                    </Box>
                  </Stack>

                  {/* Vientres Table */}
                  <TableContainer 
                    sx={{ 
                      maxHeight: 380, 
                      borderRadius: 0, 
                      border: borderStyle,
                      overflow: 'auto',
                      bgcolor: isDark ? '#111827' : '#fafafa'
                    }}
                  >
                    <Table size="small" stickyHeader sx={{ borderCollapse: 'collapse', borderRadius: 0 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ ...tableHeaderStyle, width: 60 }} align="center">
                            <Checkbox
                              size="small"
                              indeterminate={selectedFemaleIds.length > 0 && selectedFemaleIds.length < filteredFemales.length}
                              checked={filteredFemales.length > 0 && selectedFemaleIds.length === filteredFemales.length}
                              onChange={handleSelectAllFemales}
                              sx={{ p: 0, borderRadius: 0 }}
                            />
                          </TableCell>
                          <TableCell sx={tableHeaderStyle}>Caravana</TableCell>
                          <TableCell sx={tableHeaderStyle}>Categoría</TableCell>
                          <TableCell sx={tableHeaderStyle}>Raza</TableCell>
                          <TableCell sx={{ ...tableHeaderStyle, borderRight: 0 }} align="right">Peso Act.</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredFemales.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.disabled', fontStyle: 'italic', fontSize: '0.8rem' }}>
                              {searchQuery || selectedCategoryFilter !== 'all'
                                ? 'No se encontraron vientres con ese criterio de búsqueda o filtro.'
                                : 'No hay vientres aptos disponibles en este lote (vacías, sin preñez activa).'}
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredFemales.map(female => {
                            const isChecked = selectedFemaleIds.includes(female.id);
                            const badge = getCategoryBadgeStyles(female.category);
                            return (
                              <TableRow 
                                key={female.id} 
                                hover 
                                onClick={() => handleSelectFemale(female.id)} 
                                sx={{ 
                                  cursor: 'pointer',
                                  backgroundColor: isChecked 
                                    ? isDark ? 'rgba(59, 130, 246, 0.08)' : '#e1f0fc'
                                    : 'transparent',
                                  transition: 'background-color 0.15s ease',
                                  borderRadius: 0
                                }}
                              >
                                <TableCell sx={cellStyle} align="center" onClick={(e) => e.stopPropagation()}>
                                  <Checkbox
                                    size="small"
                                    checked={isChecked}
                                    onChange={() => handleSelectFemale(female.id)}
                                    sx={{ p: 0, borderRadius: 0 }}
                                  />
                                </TableCell>
                                <TableCell sx={{ ...cellStyle, fontWeight: 700, fontFamily: 'monospace', color: isChecked ? (isDark ? '#60a5fa' : '#0a6ed1') : 'text.primary', fontSize: '0.85rem' }}>
                                  {female.identification}
                                </TableCell>
                                <TableCell sx={cellStyle}>
                                  <Chip
                                    label={badge.label}
                                    size="small"
                                    sx={{
                                      bgcolor: badge.bg,
                                      color: badge.color,
                                      border: badge.border,
                                      fontWeight: 700,
                                      fontSize: '0.68rem',
                                      borderRadius: '2px',
                                      height: 20
                                    }}
                                  />
                                </TableCell>
                                <TableCell sx={{ ...cellStyle, color: 'text.secondary' }}>
                                  {female.breed || 'N/A'}
                                </TableCell>
                                <TableCell sx={{ ...cellStyle, borderRight: 0, fontWeight: 600 }} align="right">
                                  {female.current_weight ? `${female.current_weight} kg` : 'N/A'}
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* RIGHT COLUMN: Sticky Summary Panel */}
        <Box sx={{ flex: 1.2, minWidth: 0, borderRadius: 0 }}>
          <Box sx={{ position: 'sticky', top: 24, borderRadius: 0 }}>
            <Card 
              elevation={0}
              sx={{ 
                borderRadius: 0, 
                border: borderStyle,
                boxShadow: 'none',
                overflow: 'hidden',
                background: isDark ? '#1e293b' : '#ffffff'
              }}
            >
              {/* Summary Header (SAP Fiori solid blue header) */}
              <Box 
                sx={{ 
                  p: 2.5, 
                  color: '#ffffff',
                  background: isDark ? '#1e3a8a' : '#0f5b94',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  borderRadius: 0
                }}
              >
                <FuseSvgIcon size={20}>heroicons-outline:document-plus</FuseSvgIcon>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.2px' }}>
                    Orden en Construcción
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.72rem', display: 'block', mt: 0.25 }}>
                    Resumen operativo y métricas
                  </Typography>
                </Box>
              </Box>

              <CardContent sx={{ p: 3 }}>
                <Stack spacing={3.5}>
                  
                  {/* METADATA LIST */}
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                        Lote de Trabajo:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, textAlign: 'right' }}>
                        {activeBatchName || <span style={{ color: theme.palette.text.disabled, fontStyle: 'italic', fontWeight: 500 }}>Sin Lote</span>}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                        Código de Orden:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                        {orderCode || <span style={{ color: theme.palette.text.disabled, fontStyle: 'italic', fontWeight: 500 }}>No especificado</span>}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                        Fecha de Inicio:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {startDate}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                        Modalidad:
                      </Typography>
                      <Chip
                        label={serviceType === 'single' ? 'Toro Único' : 'Rotativo'}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 700, fontSize: '0.68rem', borderRadius: 0 }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                        Toros Asignados:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {selectedSireIds.length === 1 ? '1 toro' : `${selectedSireIds.length} toros`}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                        Vientres Seleccionados:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {selectedCowCount === 1 ? '1 vientre' : `${selectedCowCount} vientres`}
                      </Typography>
                    </Box>
                  </Stack>

                  {observations.trim() && (
                    <>
                      <Divider />
                      <Box sx={{ p: 1.5, bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#fafafa', border: borderStyle }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 0.75, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.68rem' }}>
                          Observaciones
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', display: 'block', fontStyle: 'italic', maxHeight: 80, overflowY: 'auto' }}>
                          "{observations}"
                        </Typography>
                      </Box>
                    </>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>

      {/* FIORI FOOTER ACTION BAR */}
      <Box
        sx={{
          mt: 4,
          p: 2.5,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 2,
          borderTop: borderStyle,
          bgcolor: isDark ? '#1e293b' : '#eff2f5',
          borderRadius: 0
        }}
      >
        <Button
          variant="text"
          sx={{ 
            textTransform: 'none', 
            fontWeight: 700, 
            color: 'text.secondary', 
            py: 1, 
            px: 3,
            fontSize: '0.8rem',
            borderRadius: 0,
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'
            }
          }}
          onClick={handleDiscard}
          disabled={isSubmitting}
        >
          Descartar Borrador
        </Button>
        
        <Button
          variant="contained"
          disabled={
            isSubmitting ||
            selectedBatchId === 'all' ||
            selectedFemaleIds.length === 0 ||
            selectedSireIds.length === 0 ||
            !orderCode.trim()
          }
          onClick={handleCreateOrder}
          startIcon={
            isSubmitting ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <FuseSvgIcon size={16}>heroicons-outline:document-plus</FuseSvgIcon>
            )
          }
          sx={{ 
            textTransform: 'none', 
            fontWeight: 700, 
            py: 1, 
            px: 3.5,
            color: '#fff', 
            borderRadius: 0, 
            fontSize: '0.85rem',
            boxShadow: 'none',
            bgcolor: isDark ? '#1b6ec2' : '#0064d2',
            '&:hover': {
              bgcolor: isDark ? '#155aa0' : '#004ca3',
              boxShadow: 'none'
            },
            '&:disabled': {
              background: isDark ? 'rgba(255,255,255,0.05)' : '#e5e9ec',
              color: 'text.disabled',
              boxShadow: 'none'
            }
          }}
        >
          {isSubmitting ? 'Creando Orden...' : 'Generar Orden de Servicio'}
        </Button>
      </Box>
    </Box>
  );
}

export default SireRotationManager;
