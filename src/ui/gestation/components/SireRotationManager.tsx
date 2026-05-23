import { useState, useMemo } from 'react';
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
  Tooltip,
  Divider,
  Alert,
  IconButton,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';

interface SireRotationManagerProps {
  caravans: Caravan[];
  batches: string[];
}

/**
 * SireRotationManager Component
 * Designed in SAP Fiori style.
 * Uses native Flexbox and Stack layouts via Box elements, without using MUI Grid or CSS Grid layouts.
 */
function SireRotationManager({ caravans, batches }: SireRotationManagerProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // 1. Local States
  const [selectedBatchName, setSelectedBatchName] = useState(batches[0] || 'all');
  const [serviceType, setServiceType] = useState<'single' | 'rotation' | 'ai'>('single');
  const [selectedSireIds, setSelectedSireIds] = useState<number[]>([]);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(
    new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [isConfigSaved, setIsConfigSaved] = useState<boolean>(false);

  // 2. Filter Male Caravans (available bulls)
  const availableBulls = useMemo(() => {
    return caravans.filter(c => c.sex === 'M');
  }, [caravans]);

  // Compute rotation days dynamically based on date range and selected sire count
  const calculatedRotationDays = useMemo(() => {
    if (selectedSireIds.length === 0) return 0;
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(1, Math.floor(totalDays / selectedSireIds.length));
    } catch (e) {
      return 15;
    }
  }, [startDate, endDate, selectedSireIds.length]);

  // 3. Count pregnant/exposed cows in the selected batch
  const batchCowCount = useMemo(() => {
    if (selectedBatchName === 'all') {
      return caravans.filter(c => c.sex === 'H').length;
    }
    return caravans.filter(c => c.sex === 'H' && c.batch_name === selectedBatchName).length;
  }, [caravans, selectedBatchName]);

  // 4. Bull-to-Cow Ratio Calculation
  const ratioDetails = useMemo(() => {
    const bullCount = selectedSireIds.length;
    if (bullCount === 0 || batchCowCount === 0) {
      return { ratio: 0, status: 'none', label: 'Sin toros asignados', color: 'text.secondary', alertMsg: '', severity: 'info' as const };
    }
    
    if (serviceType === 'ai') {
      return { ratio: 0, status: 'optimal', label: 'I.A. Activa', color: 'secondary.main', alertMsg: 'Inseminación Artificial activa para este lote.', severity: 'success' as const };
    }

    const ratio = Math.round(batchCowCount / bullCount);
    
    let status: 'optimal' | 'warning' | 'danger' = 'optimal';
    let label = `Ratio 1:${ratio} (Óptimo)`;
    let color = 'success.main';
    let severity: 'success' | 'warning' | 'error' = 'success';
    let alertMsg = 'Relación de carga óptima para asegurar altos índices de concepción.';

    if (ratio > 35) {
      status = 'danger';
      label = `Ratio 1:${ratio} (Sobrecarga)`;
      color = 'error.main';
      severity = 'error';
      alertMsg = '¡Alerta! Sobrecarga de vientres por toro. Puede comprometer la tasa de preñez.';
    } else if (ratio < 15) {
      status = 'warning';
      label = `Ratio 1:${ratio} (Subutilizado)`;
      color = 'warning.main';
      severity = 'warning';
      alertMsg = 'Baja carga por macho. Podrías optimizar retirando toros.';
    }

    return { ratio, status, label, color, alertMsg, severity };
  }, [selectedSireIds, batchCowCount, serviceType]);

  // 5. Compute rotation timeline preview (Process Flow)
  const rotationTimeline = useMemo(() => {
    if (serviceType !== 'rotation' || selectedSireIds.length === 0) return [];
    
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const periods = [];
      let currentDate = new Date(start);
      let bullIndex = 0;

      while (currentDate < end) {
        const periodStart = new Date(currentDate);
        const periodEnd = new Date(currentDate);
        periodEnd.setDate(periodEnd.getDate() + calculatedRotationDays);
        
        const finalEnd = periodEnd > end ? end : periodEnd;
        const assignedBullId = selectedSireIds[bullIndex % selectedSireIds.length];
        const bullCaravan = availableBulls.find(b => b.id === assignedBullId);

        periods.push({
          startStr: periodStart.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
          endStr: finalEnd.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
          bullIdentification: bullCaravan ? bullCaravan.identification : `Toro #${assignedBullId}`,
          bullBreed: bullCaravan ? bullCaravan.breed : 'N/A'
        });

        currentDate = new Date(finalEnd);
        bullIndex++;
      }

      return periods;
    } catch (e) {
      return [];
    }
  }, [selectedSireIds, serviceType, calculatedRotationDays, startDate, endDate, availableBulls]);

  // 6. Handlers
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

  const handleSaveConfig = () => {
    setIsConfigSaved(true);
    setTimeout(() => setIsConfigSaved(false), 3000);
  };

  const borderStyle = isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.08)';
  const sectionHeaderBg = isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8f9fa';

  const cellStyle = {
    px: 2,
    py: 1,
    borderBottom: 1,
    borderColor: theme.palette.divider,
    fontSize: '0.75rem'
  };

  const spreadsheetHeaderCell = {
    px: 1.5,
    py: 0.75,
    borderBottom: '1px solid',
    borderRight: '1px solid',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
    fontSize: '0.72rem',
    fontWeight: 700,
    color: 'text.primary',
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8f9fa'
  };

  const spreadsheetDataCell = {
    px: 1.5,
    py: 0.5,
    borderBottom: '1px solid',
    borderRight: '1px solid',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
    fontSize: '0.75rem',
    backgroundColor: isDark ? 'background.paper' : '#ffffff'
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: 1,
        borderColor: 'divider',
        borderRadius: '4px',
        bgcolor: 'background.paper',
        width: '100%',
        boxShadow: 'none'
      }}
    >
      {/* 1. MINIMALIST HEADER ZONE */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={1.5}
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.88rem' }}>
            Asignación y Rotación de Toros
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
            Planificación reproductiva de monta natural o servicio controlado.
          </Typography>
        </Box>

        {/* Minimal inline metrics */}
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ alignSelf: { xs: 'flex-end', sm: 'auto' } }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
            Vientres: <strong>{batchCowCount}</strong>
          </Typography>
          <Divider orientation="vertical" flexItem sx={{ height: 12, my: 'auto' }} />
          <Typography variant="caption" sx={{ color: ratioDetails.color, fontSize: '0.7rem', fontWeight: 600 }}>
            {ratioDetails.label}
          </Typography>
          <Divider orientation="vertical" flexItem sx={{ height: 12, my: 'auto' }} />
          <Chip
            label={serviceType === 'single' ? 'Toro Único' : serviceType === 'rotation' ? 'Rotativo' : 'I.A.'}
            size="small"
            color={serviceType === 'ai' ? 'secondary' : 'primary'}
            variant="outlined"
            sx={{ height: 16, fontSize: '0.58rem', fontWeight: 700, borderRadius: '2px', px: 0.5 }}
          />
        </Stack>
      </Stack>

      <Stack spacing={3}>
        {/* 2. GROUP 1: CONFIGURACIÓN GENERAL DEL SERVICIO */}
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.disabled', letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '0.62rem', display: 'block', mb: 1.5 }}>
            Configuración del Servicio
          </Typography>

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 2,
              '& > *': {
                flex: 1,
                width: '100%'
              }
            }}
          >
            <FormControl fullWidth size="small">
              <InputLabel id="sire-batch-select-label">Lote de Vientres</InputLabel>
              <Select
                labelId="sire-batch-select-label"
                value={selectedBatchName}
                label="Lote de Vientres"
                onChange={(e) => {
                  setSelectedBatchName(e.target.value);
                  setSelectedSireIds([]);
                }}
              >
                <MenuItem value="all"><em>Todos los vientres</em></MenuItem>
                {batches.map(name => (
                  <MenuItem key={name} value={name}>{name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel id="service-type-label">Modalidad de Servicio</InputLabel>
              <Select
                labelId="service-type-label"
                value={serviceType}
                label="Modalidad de Servicio"
                onChange={(e) => {
                  setServiceType(e.target.value as 'single' | 'rotation' | 'ai');
                  setSelectedSireIds([]);
                }}
              >
                <MenuItem value="single">Toro Único (Servicio Individual)</MenuItem>
                <MenuItem value="rotation">Rotación de Toros (Colectivo)</MenuItem>
                <MenuItem value="ai">Inseminación Artificial (I.A.)</MenuItem>
              </Select>
            </FormControl>

            {serviceType === 'ai' ? (
              <TextField
                disabled
                fullWidth
                size="small"
                label="Tipo de Servicio"
                value="I.A. Sistemática"
                variant="outlined"
              />
            ) : (
              <FormControl fullWidth size="small">
                <InputLabel id="bull-add-label">Asignar Macho (Toro)</InputLabel>
                <Select
                  labelId="bull-add-label"
                  value=""
                  label="Asignar Macho (Toro)"
                  onChange={(e) => handleAddBull(Number(e.target.value))}
                >
                  <MenuItem value="" disabled><em>-- Agregar Macho --</em></MenuItem>
                  {availableBulls.map(bull => (
                    <MenuItem
                      key={bull.id}
                      value={bull.id}
                      disabled={selectedSireIds.includes(bull.id)}
                    >
                      {bull.identification} ({bull.breed || 'Sin Raza'})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {serviceType === 'ai' ? (
              <TextField
                disabled
                fullWidth
                size="small"
                label="Fecha Programada"
                value="Inmediata"
                variant="outlined"
              />
            ) : (
              <Stack direction="row" spacing={1}>
                <TextField
                  label="Inicio"
                  type="date"
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <TextField
                  label="Fin Estimado"
                  type="date"
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Stack>
            )}
          </Box>
        </Box>

        {/* 3. GROUP 2: DETALLE DE TOROS ASIGNADOS Y CRONOGRAMA PROYECTADO */}
        {serviceType !== 'ai' && (
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.disabled', letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '0.62rem', display: 'block', mb: 1.5 }}>
              {serviceType === 'rotation' ? 'Toros Registrados y Cronograma de Rotación' : 'Macho Seleccionado'}
            </Typography>

            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', lg: 'row' },
                gap: 3,
                alignItems: 'stretch'
              }}
            >
              {/* Column 1: Spreadsheet Table (Rotation) or Single Bull Card (Single) */}
              <Box sx={{ flex: 1.2, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                {serviceType === 'single' ? (
                  <Box
                    sx={{
                      p: 2.5,
                      border: borderStyle,
                      borderRadius: '4px',
                      bgcolor: isDark ? 'rgba(255, 255, 255, 0.01)' : 'rgba(0, 0, 0, 0.01)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: '100%',
                      minHeight: 140
                    }}
                  >
                    {selectedSireIds.length === 0 ? (
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ color: 'text.disabled' }}>
                        <FuseSvgIcon size={24} sx={{ opacity: 0.5 }}>heroicons-outline:user-minus</FuseSvgIcon>
                        <Typography variant="body2" sx={{ fontStyle: 'italic', fontSize: '0.78rem' }}>
                          Sin toro único asignado. Seleccione un macho arriba.
                        </Typography>
                      </Stack>
                    ) : (() => {
                      const bull = availableBulls.find(b => b.id === selectedSireIds[0]);
                      return (
                        <Stack direction="row" spacing={3} alignItems="center" sx={{ width: '100%', justifyContent: 'space-between' }}>
                          <Stack direction="row" spacing={2.5} alignItems="center">
                            {/* Fiori-style Visual Icon Badge */}
                            <Box
                              sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '4px',
                                bgcolor: 'primary.main',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                boxShadow: '0 2px 8px rgba(10, 110, 209, 0.15)'
                              }}
                            >
                              <FuseSvgIcon size={26}>heroicons-outline:shield-check</FuseSvgIcon>
                            </Box>
                            <Box>
                              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase' }}>
                                Macho en Servicio Activo
                              </Typography>
                              <Typography variant="subtitle1" sx={{ fontWeight: 800, fontFamily: 'monospace', color: 'primary.main', lineHeight: 1.2 }}>
                                {bull?.identification || `Toro #${selectedSireIds[0]}`}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                Raza: <strong>{bull?.breed || 'Sin Raza'}</strong> • Categoría: <strong>Reproductor</strong>
                              </Typography>
                            </Box>
                          </Stack>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => setSelectedSireIds([])}
                            startIcon={<FuseSvgIcon size={14}>heroicons-outline:trash</FuseSvgIcon>}
                            sx={{ textTransform: 'none', fontSize: '0.72rem', py: 0.5, borderRadius: '4px' }}
                          >
                            Remover
                          </Button>
                        </Stack>
                      );
                    })()}
                  </Box>
                ) : (
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      borderLeft: borderStyle,
                      borderTop: borderStyle,
                      borderRadius: '4px 4px 0 0',
                      overflow: 'hidden',
                      width: '100%',
                      bgcolor: 'background.paper'
                    }}
                  >
                    <TableContainer sx={{ maxHeight: 220 }}>
                      <Table size="small" sx={{ borderCollapse: 'collapse' }}>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={spreadsheetHeaderCell}>Identificación</TableCell>
                            <TableCell sx={spreadsheetHeaderCell}>Raza</TableCell>
                            <TableCell sx={spreadsheetHeaderCell}>Categoría</TableCell>
                            <TableCell sx={{ ...spreadsheetHeaderCell, borderRight: 0 }} align="center">Acción</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedSireIds.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.disabled', fontStyle: 'italic', fontSize: '0.75rem', borderBottom: '1px solid', borderRight: '1px solid', borderColor: theme.palette.divider }}>
                                No hay toros asignados a este lote. Agregue machos utilizando el selector superior.
                              </TableCell>
                            </TableRow>
                          ) : (
                            selectedSireIds.map(id => {
                              const bull = availableBulls.find(b => b.id === id);
                              return (
                                <TableRow key={id} hover>
                                  <TableCell sx={{ ...spreadsheetDataCell, fontWeight: 700, fontFamily: 'monospace', color: 'primary.main' }}>
                                    {bull?.identification || `Toro #${id}`}
                                  </TableCell>
                                  <TableCell sx={spreadsheetDataCell}>
                                    {bull?.breed || 'Sin Raza'}
                                  </TableCell>
                                  <TableCell sx={spreadsheetDataCell}>
                                    <Chip label="Activo" size="small" color="success" variant="outlined" sx={{ height: 16, fontSize: '0.55rem', fontWeight: 700, borderRadius: '2px' }} />
                                  </TableCell>
                                  <TableCell sx={{ ...spreadsheetDataCell, borderRight: 0 }} align="center">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleRemoveBull(id)}
                                      sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' }, p: 0.25 }}
                                    >
                                      <FuseSvgIcon size={14}>heroicons-outline:x-mark</FuseSvgIcon>
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                )}
              </Box>

              {/* Column 2: Process Flow (Rotation) or Details/Status Card (Single) */}
              <Box sx={{ flex: 1.8, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                {serviceType === 'rotation' ? (
                  <Box
                    sx={{
                      p: 2,
                      border: borderStyle,
                      borderRadius: '4px',
                      bgcolor: isDark ? 'rgba(255, 255, 255, 0.01)' : 'rgba(0,0,0,0.01)',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                      justifyContent: 'center'
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.disabled', display: 'block', mb: 1.5, fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Cronograma Proyectado
                    </Typography>
                    {rotationTimeline.length === 0 ? (
                      <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic', display: 'block', textAlign: 'center', py: 2 }}>
                        Asigne toros para proyectar la rotación.
                      </Typography>
                    ) : (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          overflowX: 'auto',
                          py: 1,
                          '&::-webkit-scrollbar': { height: '3px' },
                          '&::-webkit-scrollbar-thumb': { bgcolor: theme.palette.divider, borderRadius: '2px' }
                        }}
                      >
                        {rotationTimeline.map((period, i) => (
                          <Stack key={i} direction="row" alignItems="center" spacing={1.5} sx={{ flexShrink: 0 }}>
                            <Box
                              sx={{
                                py: 0.5,
                                px: 1,
                                borderLeft: i === 0 ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
                                pl: 1.5,
                                display: 'flex',
                                flexDirection: 'column'
                              }}
                            >
                              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.6rem', fontWeight: 600 }}>
                                {period.startStr} - {period.endStr}
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.75rem', color: i === 0 ? 'primary.main' : 'text.primary' }}>
                                {period.bullIdentification}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6rem' }}>
                                {period.bullBreed || 'Sin Raza'}
                              </Typography>
                            </Box>
                            {i < rotationTimeline.length - 1 && (
                              <FuseSvgIcon size={12} sx={{ color: 'text.disabled', opacity: 0.5 }}>
                                heroicons-outline:chevron-right
                              </FuseSvgIcon>
                            )}
                          </Stack>
                        ))}
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      p: 2,
                      border: borderStyle,
                      borderRadius: '4px',
                      bgcolor: isDark ? 'rgba(255, 255, 255, 0.01)' : 'rgba(0,0,0,0.01)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      height: '100%',
                      minHeight: 140
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem', lineHeight: 1.4 }}>
                      <strong>Servicio de Toro Único:</strong> El macho seleccionado permanecerá activo en el lote durante todo el ciclo reproductivo programado sin períodos de descanso ni rotaciones programadas.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Bottom Row: Minimal inline warnings & turns */}
            {selectedSireIds.length > 0 && (ratioDetails.alertMsg || serviceType === 'rotation') && (
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                justifyContent="space-between"
                sx={{
                  mt: 2,
                  py: 1,
                  px: 1.5,
                  borderRadius: '4px',
                  bgcolor: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)'
                }}
              >
                {serviceType === 'rotation' && (
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
                    Turnos calculados de <strong>{calculatedRotationDays} días</strong> por macho según período.
                  </Typography>
                )}
                {ratioDetails.alertMsg && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <FuseSvgIcon size={14} sx={{ color: ratioDetails.color }}>heroicons-outline:information-circle</FuseSvgIcon>
                    <Typography variant="caption" sx={{ color: ratioDetails.color, fontWeight: 600, fontSize: '0.68rem' }}>
                      {ratioDetails.alertMsg}
                    </Typography>
                  </Stack>
                )}
              </Stack>
            )}
          </Box>
        )}

        {/* 5. FOOTER: Action Buttons */}
        <Box>
          <Divider sx={{ my: 0.5 }} />
          <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 1 }}>
            <Button
              variant="text"
              sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary', py: 0.5, fontSize: '0.8rem' }}
              onClick={() => setSelectedSireIds([])}
            >
              Descartar
            </Button>
            <Button
              variant="contained"
              color="primary"
              disabled={selectedSireIds.length === 0 && serviceType !== 'ai'}
              onClick={handleSaveConfig}
              startIcon={
                isConfigSaved ? (
                  <FuseSvgIcon size={16}>heroicons-outline:check</FuseSvgIcon>
                ) : (
                  <FuseSvgIcon size={16}>heroicons-outline:arrow-down-on-square</FuseSvgIcon>
                )
              }
              sx={{ textTransform: 'none', fontWeight: 800, px: 3, py: 0.5, color: '#fff', borderRadius: '4px', fontSize: '0.8rem' }}
            >
              {isConfigSaved ? '¡Guardado!' : 'Aplicar Servicio'}
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
}

export default SireRotationManager;
