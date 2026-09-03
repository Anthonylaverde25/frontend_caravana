'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Alert,
  TextField,
  InputAdornment,
  TablePagination,
  IconButton,
  Tooltip,
  OutlinedInput,
  useTheme
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import ViewLayout from 'src/components/ViewLayout';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useCompany } from '@/contexts/CompanyContext';
import { useBatches } from '@/features/batches/hooks/useBatches';
import { useSuppliers } from '@/features/suppliers/hooks/useSuppliers';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import { useAssignExternalCaravans } from '@/features/batches/hooks/useAssignExternalCaravans';
import CreateBatchDialog from 'src/ui/batches/components/CreateBatchDialog';

export default function ExternalBatchAssignmentView() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const headerBg = isDark ? '#1e293b' : '#f8fafc';
  const zebraBg = isDark ? 'rgba(255, 255, 255, 0.02)' : '#fafafa';
  const headerBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0';
  const bodyBorder = isDark ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9';

  const headerCellStyle = {
    py: 1.5,
    px: 1.5,
    fontSize: '0.7rem',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    color: isDark ? '#94a3b8' : '#475569',
    borderBottom: '1px solid',
    borderRight: '1px solid',
    borderColor: headerBorder,
    whiteSpace: 'nowrap' as const,
    letterSpacing: '0.04em',
    bgcolor: headerBg,
  };
  const active = isDark ? '#60a5fa' : '#0a6ed1';

  const bodyCellStyle = {
    px: 1.5,
    py: 1.2,
    borderRight: '1px solid',
    borderBottom: '1px solid',
    borderColor: bodyBorder,
  };

  const { activeCompanyId } = useCompany();
  const { data: suppliers = [], isLoading: isLoadingSuppliers } = useSuppliers();
  const { data: batches = [], isLoading: isLoadingBatches } = useBatches();
  const { data: caravans = [], isLoading: isLoadingCaravans } = useCaravans(activeCompanyId, 'external');
  const assignMutation = useAssignExternalCaravans();


  const [selectedSupplierId, setSelectedSupplierId] = useState<number | ''>('');
  const [selectedBatchId, setSelectedBatchId] = useState<number | ''>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCaravanIds, setSelectedCaravanIds] = useState<number[]>([]);
  const [targetOwnBatchId, setTargetOwnBatchId] = useState<number | ''>('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isCreateBatchOpen, setIsCreateBatchOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'flat' | 'hierarchy'>('flat');

  const handleCreateBatchSuccess = async (createdBatch: any) => {
    if (createdBatch && createdBatch.id && selectedCaravanIds.length > 0) {
      try {
        const res = await assignMutation.mutateAsync({
          caravan_ids: selectedCaravanIds,
          target_batch_id: createdBatch.id,
          entry_date: new Date().toISOString().split('T')[0]
        });

        setSuccessMessage(res.message || `Se han transferido ${selectedCaravanIds.length} caravanas con éxito al lote "${createdBatch.name}".`);
        setSelectedCaravanIds([]);
      } catch (err) {
        console.error(err);
      }
    }
  };
   const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  // Reset page to 0 when any filter changes to prevent out-of-bounds rendering
  useEffect(() => {
    setPage(0);
  }, [searchTerm, selectedSupplierId, selectedBatchId]);

  // 1. Lotes Propios de la Empresa (Destinos válidos)
  const ownBatches = useMemo(() => {
    return batches.filter(b => b.provider_id === null || b.provider_id === undefined);
  }, [batches]);

  // 2. Lotes Externos (de Proveedor) filtrados
  const externalBatches = useMemo(() => {
    return batches.filter(b => {
      if (b.provider_id === null || b.provider_id === undefined) return false;
      if (selectedSupplierId !== '') return b.provider_id === selectedSupplierId;
      return true;
    });
  }, [batches, selectedSupplierId]);

  // 3. Caravanas externas aplanadas con su lote/proveedor
  const flatExternalCaravans = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    const rows: {
      caravan: (typeof caravans)[0];
      batch: (typeof externalBatches)[0];
    }[] = [];

    externalBatches.forEach(b => {
      if (selectedBatchId !== '' && b.id !== selectedBatchId) return;

      let bCaravans = caravans.filter(c => c.batch_id === b.id);

      if (term !== '') {
        bCaravans = bCaravans.filter(c =>
          c.identification.toLowerCase().includes(term) ||
          (c.category_name && c.category_name.toLowerCase().includes(term)) ||
          (c.subcategory_name && c.subcategory_name.toLowerCase().includes(term)) ||
          (c.category && c.category.toLowerCase().includes(term)) ||
          (c.breed && c.breed.toLowerCase().includes(term)) ||
          b.name.toLowerCase().includes(term) ||
          (b.provider_name && b.provider_name.toLowerCase().includes(term))
        );
      }

      bCaravans.forEach(caravan => rows.push({ caravan, batch: b }));
    });

    return rows;
  }, [externalBatches, caravans, searchTerm, selectedBatchId]);

  // 4. Filas paginadas
  const paginatedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return flatExternalCaravans.slice(start, start + rowsPerPage);
  }, [flatExternalCaravans, page, rowsPerPage]);

  const pageIds = useMemo(() => paginatedRows.map(r => r.caravan.id), [paginatedRows]);

  // 5. Estructura jerárquica Proveedor → Lotes → Caravanas
  const hierarchy = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    const providerMap = new Map<
      number,
      {
        providerId: number;
        providerName: string;
        batches: {
          batch: (typeof externalBatches)[0];
          caravans: (typeof caravans)[0][];
        }[];
        totalTime: number;
      }
    >();

    externalBatches.forEach(b => {
      if (selectedBatchId !== '' && b.id !== selectedBatchId) return;

      let bCaravans = caravans.filter(c => c.batch_id === b.id);

      if (term !== '') {
        bCaravans = bCaravans.filter(c =>
          c.identification.toLowerCase().includes(term) ||
          (c.category_name && c.category_name.toLowerCase().includes(term)) ||
          (c.subcategory_name && c.subcategory_name.toLowerCase().includes(term)) ||
          (c.category && c.category.toLowerCase().includes(term)) ||
          (c.breed && c.breed.toLowerCase().includes(term)) ||
          b.name.toLowerCase().includes(term) ||
          (b.provider_name && b.provider_name.toLowerCase().includes(term))
        );
      }

      if (bCaravans.length === 0) return;

      const providerId = b.provider_id as number;
      const entry = providerMap.get(providerId) || {
        providerId,
        providerName: b.provider_name || 'Proveedor Externo',
        batches: [],
        totalTime: 0
      };

      entry.batches.push({ batch: b, caravans: bCaravans });
      entry.totalTime += bCaravans.length;
      providerMap.set(providerId, entry);
    });

    return Array.from(providerMap.values()).sort((a, b) => a.providerName.localeCompare(b.providerName));
  }, [externalBatches, caravans, searchTerm, selectedBatchId]);

  // Total de caravanas externas elegibles
  const allEligibleCaravanIds = useMemo(() => {
    return flatExternalCaravans.map(r => r.caravan.id);
  }, [flatExternalCaravans]);

  const allPageSelected = pageIds.length > 0 && pageIds.every(id => selectedCaravanIds.includes(id));
  const somePageSelected = pageIds.some(id => selectedCaravanIds.includes(id)) && !allPageSelected;

  // Toggle individual
  const handleToggleCaravan = (id: number) => {
    setSelectedCaravanIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Toggle página completa
  const handleTogglePage = () => {
    if (allPageSelected) {
      setSelectedCaravanIds(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      setSelectedCaravanIds(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  // Toggle grupo de caravanas (un lote en vista jerárquica)
  const handleTogglePageGroup = (groupIds: number[]) => {
    if (groupIds.length === 0) return;
    const allSelected = groupIds.every(id => selectedCaravanIds.includes(id));
    if (allSelected) {
      setSelectedCaravanIds(prev => prev.filter(id => !groupIds.includes(id)));
    } else {
      setSelectedCaravanIds(prev => Array.from(new Set([...prev, ...groupIds])));
    }
  };

  // Toggle global
  const handleSelectAllGlobal = () => {
    if (selectedCaravanIds.length === allEligibleCaravanIds.length && allEligibleCaravanIds.length > 0) {
      setSelectedCaravanIds([]);
    } else {
      setSelectedCaravanIds(allEligibleCaravanIds);
    }
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Ejecutar transferencia
  const handleConfirmTransfer = async () => {
    if (!targetOwnBatchId || selectedCaravanIds.length === 0) return;

    try {
      const res = await assignMutation.mutateAsync({
        caravan_ids: selectedCaravanIds,
        target_batch_id: Number(targetOwnBatchId),
        entry_date: new Date().toISOString().split('T')[0]
      });

      setSuccessMessage(res.message || `Se han transferido ${selectedCaravanIds.length} caravanas con éxito.`);
      setIsConfirmOpen(false);
      setSelectedCaravanIds([]);
    } catch (err) {
      console.error(err);
    }
  };

  const isLoading = isLoadingSuppliers || isLoadingBatches || isLoadingCaravans;

  return (
    <ViewLayout
      title="Asignación de Hacienda Externa a Lotes Propios (Rodeo por regularizar)"
      subtitle="Visualiza y traslada las caravanas adquiridas desde sus lotes de procedencia hacia tus lotes operativos propios."
    >
      <Box sx={{ p: { xs: 2, md: 3 }, pb: { xs: 2, md: 3 } }}>
        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        )}

        {/* Barra de Filtros y Búsqueda */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 2,
            borderRadius: '8px',
            border: '1px solid',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
            bgcolor: isDark ? '#1e293b' : '#ffffff',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
          }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', md: 'center' }}
            spacing={1.5}
          >
            {/* Buscador */}
            <TextField
              size="small"
              hiddenLabel
              placeholder="Buscar por caravana, raza, categoría o lote..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              sx={{
                flexGrow: 1,
                maxWidth: { md: 380 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FuseSvgIcon size={18} color="action">heroicons-outline:magnifying-glass</FuseSvgIcon>
                  </InputAdornment>
                ),
              }}
            />

            {/* Filtros y acciones rápidas */}
            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap alignItems="center">
              {/* Filtro Proveedor */}
              <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 260 }, width: 'auto' }}>
                <Select
                  displayEmpty
                  value={selectedSupplierId}
                  onChange={e => setSelectedSupplierId(e.target.value as number | '')}
                  renderValue={(selected) => {
                    const val = selected as number | '';
                    if (val === '' || val == null) {
                      return (
                        <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem', lineHeight: 1.4 }}>
                          Todos los Proveedores
                        </Typography>
                      );
                    }
                    const s = suppliers.find(x => x.id === val);
                    return (
                      <Typography sx={{ fontSize: '0.85rem', lineHeight: 1.4, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {s ? `${s.name} (${s.commercial_name || s.cuit})` : ''}
                      </Typography>
                    );
                  }}
                  input={
                    <OutlinedInput
                      size="small"
                      startAdornment={
                        <InputAdornment position="start">
                          <FuseSvgIcon size={18} color="action">heroicons-outline:building-storefront</FuseSvgIcon>
                        </InputAdornment>
                      }
                    />
                  }
                  sx={{
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '6px',
                      '& .MuiInputBase-input': {
                        py: 1.15,
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                      },
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#d1d5db',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.25)' : '#9ca3af',
                    },
                  }}
                >
                  <MenuItem value="">Todos los Proveedores</MenuItem>
                  {suppliers.map(s => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name} ({s.commercial_name || s.cuit})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Filtro Lote */}
              <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 220 }, width: 'auto' }}>
                <Select
                  displayEmpty
                  value={selectedBatchId}
                  onChange={e => setSelectedBatchId(e.target.value as number | '')}
                  renderValue={(selected) => {
                    const val = selected as number | '';
                    if (val === '' || val == null) {
                      return (
                        <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem', lineHeight: 1.4 }}>
                          Todos los Lotes
                        </Typography>
                      );
                    }
                    const b = externalBatches.find(x => x.id === val);
                    return (
                      <Typography sx={{ fontSize: '0.85rem', lineHeight: 1.4, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {b ? `${b.name} (${b.provider_name || 'Externo'})` : ''}
                      </Typography>
                    );
                  }}
                  input={
                    <OutlinedInput
                      size="small"
                      startAdornment={
                        <InputAdornment position="start">
                          <FuseSvgIcon size={18} color="action">heroicons-outline:rectangle-stack</FuseSvgIcon>
                        </InputAdornment>
                      }
                    />
                  }
                  sx={{
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '6px',
                      '& .MuiInputBase-input': {
                        py: 1.15,
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                      },
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#d1d5db',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.25)' : '#9ca3af',
                    },
                  }}
                >
                  <MenuItem value="">Todos los Lotes</MenuItem>
                  {externalBatches.map(b => (
                    <MenuItem key={b.id} value={b.id}>
                      {b.name} ({b.provider_name || 'Externo'})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Contador de resultados */}
              <Chip
                size="small"
                variant="outlined"
                label={`${allEligibleCaravanIds.length} elegibles`}
                sx={{ height: 30, px: 0.5, fontWeight: 600, whiteSpace: 'nowrap', fontSize: '0.75rem', '& .MuiChip-label': { px: 1 } }}
              />

              {/* Toggle de Vista */}
              <Tooltip title={viewMode === 'hierarchy' ? 'Cambiar a vista de tabla plana' : 'Cambiar a organización jerárquica (Proveedor → Lotes)'}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setViewMode(prev => prev === 'flat' ? 'hierarchy' : 'flat')}
                  startIcon={<FuseSvgIcon size={16}>{viewMode === 'flat' ? 'heroicons-outline:building-library' : 'heroicons-outline:table-cells'}</FuseSvgIcon>}
                  sx={{ whiteSpace: 'nowrap', px: 2, height: 30, textTransform: 'none', fontSize: '0.8rem', borderRadius: '6px' }}
                >
                  {viewMode === 'flat' ? 'Proveedor → Lotes' : 'Tabla plana'}
                </Button>
              </Tooltip>

              {/* Botón Seleccionar Todo */}
              <Button
                variant={selectedCaravanIds.length === allEligibleCaravanIds.length && allEligibleCaravanIds.length > 0 ? 'contained' : 'outlined'}
                size="small"
                startIcon={<FuseSvgIcon size={16}>{selectedCaravanIds.length === allEligibleCaravanIds.length && allEligibleCaravanIds.length > 0 ? 'heroicons-outline:x-mark' : 'heroicons-outline:check-circle'}</FuseSvgIcon>}
                onClick={handleSelectAllGlobal}
                disabled={allEligibleCaravanIds.length === 0}
                sx={{ whiteSpace: 'nowrap', px: 2, height: 30, textTransform: 'none', fontSize: '0.8rem', borderRadius: '6px' }}
              >
                {selectedCaravanIds.length === allEligibleCaravanIds.length && allEligibleCaravanIds.length > 0
                  ? 'Deseleccionar'
                  : 'Seleccionar Todo'}
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* Banner de Selección (patrón Pedigree) */}
        {selectedCaravanIds.length > 0 && (
          <Paper
            elevation={0}
            sx={{
              mb: 2,
              p: 1.5,
              borderRadius: '8px',
              border: '1px solid',
              borderColor: alpha(active, isDark ? 0.22 : 0.16),
              bgcolor: alpha(active, isDark ? 0.08 : 0.05),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1.5,
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  px: 1.25,
                  py: 0.5,
                  borderRadius: '6px',
                  bgcolor: alpha(active, 0.14),
                  color: active,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                }}
              >
                {selectedCaravanIds.length} {selectedCaravanIds.length === 1 ? 'seleccionada' : 'seleccionadas'}
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                Asignación: caravanas externas listas para incorporarse a un lote propio
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <FormControl size="small" sx={{ minWidth: 260 }}>
                <InputLabel>Lote Propio Destino</InputLabel>
                <Select
                  value={targetOwnBatchId}
                  label="Lote Propio Destino"
                  onChange={e => setTargetOwnBatchId(e.target.value as number | '')}
                >
                  <MenuItem value="">-- Seleccionar Lote Propio --</MenuItem>
                  {ownBatches.map(b => (
                    <MenuItem key={b.id} value={b.id}>
                      {b.name} (Finca: {b.farm_name || 'Propia'})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Tooltip title="Alta Rápida de Lote (Propio)">
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={() => setIsCreateBatchOpen(true)}
                  startIcon={<FuseSvgIcon size={16}>heroicons-outline:folder-plus</FuseSvgIcon>}
                  sx={{
                    fontWeight: 600,
                    textTransform: 'none',
                    px: 1.25,
                    whiteSpace: 'nowrap',
                    height: 30,
                  }}
                >
                  Crear Lote
                </Button>
              </Tooltip>

              <Button
                variant="contained"
                size="small"
                disabled={targetOwnBatchId === '' || assignMutation.isPending}
                onClick={() => setIsConfirmOpen(true)}
                startIcon={<FuseSvgIcon size={16}>heroicons-outline:arrow-right-start-on-rectangle</FuseSvgIcon>}
                sx={{
                  fontWeight: 700,
                  textTransform: 'none',
                  px: 2,
                  whiteSpace: 'nowrap',
                  height: 30,
                }}
              >
                {assignMutation.isPending ? 'Transfiriendo...' : 'Transferir'}
              </Button>

              <Tooltip title="Limpiar Selección">
                <IconButton
                  size="small"
                  onClick={() => setSelectedCaravanIds([])}
                  sx={{ height: 30, width: 30, color: 'text.secondary' }}
                >
                  <FuseSvgIcon size={16}>heroicons-outline:x-circle</FuseSvgIcon>
                </IconButton>
              </Tooltip>
            </Stack>
          </Paper>
        )}

        {/* Listado de Caravanas Externas */}
        {isLoading ? (
          <Box sx={{ p: 6, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : viewMode === 'hierarchy' ? (
          hierarchy.length === 0 ? (
            <Paper sx={{ p: 5, textAlign: 'center', border: 1, borderColor: 'divider', borderRadius: 2 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No se encontraron proveedores con caravanas elegibles.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Verifique que los lotes de compra tengan animales asignados.
              </Typography>
            </Paper>
          ) : (
            <Stack spacing={3}>
              {hierarchy.map(group => (
                <Paper
                  key={group.providerId}
                  elevation={0}
                  sx={{
                    border: 1,
                    borderColor: theme.palette.divider,
                    borderRadius: '8px',
                    overflow: 'hidden',
                    bgcolor: 'background.paper',
                  }}
                >
                  {/* Cabecera de Proveedor */}
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    alignItems={{ xs: 'flex-start', md: 'center' }}
                    justifyContent="space-between"
                    spacing={1.5}
                    sx={{
                      px: 2.5,
                      py: 1.5,
                      borderBottom: '2px solid',
                      borderColor: isDark ? alpha(active, 0.55) : alpha(active, 0.35),
                      bgcolor: isDark
                        ? alpha(active, 0.16)
                        : `linear-gradient(90deg, ${alpha(active, 0.1)} 0%, ${alpha(active, 0.03)} 100%)`,
                      backgroundColor: isDark ? alpha(active, 0.16) : alpha('#0a6ed1', 0.07),
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 32,
                          height: 32,
                          borderRadius: '8px',
                          bgcolor: active,
                          color: '#ffffff',
                          flexShrink: 0,
                          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                        }}
                      >
                        <FuseSvgIcon size={18}>heroicons-outline:building-storefront</FuseSvgIcon>
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
                          {group.providerName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: isDark ? 'rgba(255, 255, 255, 0.65)' : 'text.secondary', fontWeight: 500 }}>
                          {group.batches.length} {group.batches.length === 1 ? 'lote' : 'lotes'} &bull; {group.totalTime} cabezas
                        </Typography>
                      </Box>
                    </Stack>

                    <Chip
                      size="small"
                      variant="outlined"
                      label={`${group.totalTime} cabezas`}
                      sx={{
                        fontWeight: 700,
                        color: active,
                        borderColor: alpha(active, 0.4),
                        bgcolor: 'background.paper',
                      }}
                    />
                  </Stack>

                  {/* Lotes del Proveedor */}
                  <Stack spacing={0}>
                  {group.batches.map(({ batch, caravans: bCaravans }) => {
                    const batchIds = bCaravans.map(c => c.id);
                    const selectedCountInBatch = batchIds.filter(id => selectedCaravanIds.includes(id)).length;

                    return (
                      <Box key={batch.id} sx={{ '& + &': { borderTop: '2px solid', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb' } }}>
                        {/* Cabecera de Lote */}
                        <Stack
                          direction={{ xs: 'column', md: 'row' }}
                          alignItems={{ xs: 'flex-start', md: 'center' }}
                          justifyContent="space-between"
                          spacing={1}
                          sx={{
                            px: 2.5,
                            py: 1.25,
                            borderLeft: '4px solid',
                            borderLeftColor: selectedCountInBatch > 0 ? 'primary.main' : alpha(active, 0.35),
                            bgcolor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#eef2f7',
                          }}
                        >
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 26,
                                height: 26,
                                borderRadius: '6px',
                                bgcolor: alpha(active, 0.12),
                                color: active,
                                flexShrink: 0,
                              }}
                            >
                              <FuseSvgIcon size={15}>heroicons-outline:rectangle-stack</FuseSvgIcon>
                            </Box>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
                                {batch.name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                Establecimiento: {batch.farm_name || 'Origen'}
                              </Typography>
                            </Box>
                          </Stack>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip
                              size="small"
                              variant="outlined"
                              label={`${bCaravans.length} cabezas`}
                              sx={{ fontSize: '0.72rem', height: 22, fontWeight: 600, bgcolor: 'background.paper' }}
                            />
                            {selectedCountInBatch > 0 && (
                              <Chip
                                size="small"
                                color="primary"
                                label={`${selectedCountInBatch} seleccionadas`}
                                sx={{ fontSize: '0.72rem', height: 22, fontWeight: 700 }}
                              />
                            )}
                          </Stack>
                        </Stack>

                        <TableContainer>
                          <Table stickyHeader size="small" sx={{ borderCollapse: 'collapse' }}>
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ ...headerCellStyle, width: 44, textAlign: 'center', p: 0.5 }}>
                                  <Checkbox
                                    size="small"
                                    checked={batchIds.length > 0 && batchIds.every(id => selectedCaravanIds.includes(id))}
                                    indeterminate={selectedCountInBatch > 0 && selectedCountInBatch < batchIds.length}
                                    onChange={() => handleTogglePageGroup(batchIds)}
                                    sx={{ p: 0.5 }}
                                  />
                                </TableCell>
                                <TableCell sx={{ ...headerCellStyle, width: 44, textAlign: 'center' }}>#</TableCell>
                                <TableCell sx={{ ...headerCellStyle, minWidth: 180 }}>Caravana</TableCell>
                                <TableCell sx={{ ...headerCellStyle, minWidth: 120 }}>Categoría</TableCell>
                                <TableCell sx={{ ...headerCellStyle, minWidth: 110 }}>Sexo</TableCell>
                                <TableCell sx={{ ...headerCellStyle, minWidth: 140 }}>Raza</TableCell>
                                <TableCell sx={{ ...headerCellStyle, minWidth: 100 }}>Dentición</TableCell>
                                <TableCell sx={{ ...headerCellStyle, minWidth: 130 }}>Peso Entrada</TableCell>
                                <TableCell sx={{ ...headerCellStyle, minWidth: 160 }}>RENSPA</TableCell>
                                <TableCell sx={{ ...headerCellStyle, minWidth: 150, borderRight: 0 }}>Estado</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {bCaravans.map((caravan, index) => {
                                const isSelected = selectedCaravanIds.includes(caravan.id);
                                const rowBg = isSelected
                                  ? (isDark ? 'rgba(99, 102, 241, 0.22)' : '#e0e7ff')
                                  : index % 2 === 1
                                  ? zebraBg
                                  : 'inherit';
                                return (
                                  <TableRow
                                    key={caravan.id}
                                    hover
                                    onClick={() => handleToggleCaravan(caravan.id)}
                                    sx={{ cursor: 'pointer', bgcolor: rowBg, transition: 'background-color 0.15s ease' }}
                                  >
                                    <TableCell sx={{ ...bodyCellStyle, textAlign: 'center', p: 0.5 }}>
                                      <Checkbox checked={isSelected} size="small" sx={{ p: 0.5 }} />
                                    </TableCell>
                                    <TableCell sx={{ ...bodyCellStyle, textAlign: 'center', color: 'text.secondary', fontSize: '0.75rem', fontWeight: 600 }}>
                                      {index + 1}
                                    </TableCell>
                                    <TableCell sx={bodyCellStyle}>
                                      <Typography sx={{ fontFamily: 'monospace', fontWeight: 800, color: 'primary.main', fontSize: '0.85rem', lineHeight: 1.1 }}>
                                        #{caravan.identification}
                                      </Typography>
                                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem', display: 'block' }}>
                                        {caravan.breed || ''}
                                      </Typography>
                                    </TableCell>
                                     <TableCell sx={bodyCellStyle}>
                                       <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}>
                                         {caravan.category_name || caravan.category || '-'}
                                       </Typography>
                                       {caravan.subcategory_name && (
                                         <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem', display: 'block' }}>
                                           {caravan.subcategory_name}
                                         </Typography>
                                       )}
                                     </TableCell>
                                    <TableCell sx={bodyCellStyle}>
                                      <Chip
                                        size="small"
                                        label={caravan.sex === 'M' ? 'Macho' : 'Hembra'}
                                        color={caravan.sex === 'M' ? 'info' : 'secondary'}
                                        variant="outlined"
                                        sx={{ fontWeight: 700, fontSize: '0.68rem', height: 22 }}
                                      />
                                    </TableCell>
                                    <TableCell sx={{ ...bodyCellStyle, fontSize: '0.78rem' }}>{caravan.breed || '-'}</TableCell>
                                    <TableCell sx={{ ...bodyCellStyle, fontSize: '0.78rem' }}>{caravan.teeth} D</TableCell>
                                    <TableCell sx={{ ...bodyCellStyle, fontSize: '0.78rem' }}>{caravan.entry_weight ? `${caravan.entry_weight} kg` : '-'}</TableCell>
                                    <TableCell sx={{ ...bodyCellStyle, fontSize: '0.78rem' }}>{caravan.renspa || 'NO_DEFINIDO'}</TableCell>
                                    <TableCell sx={{ ...bodyCellStyle, borderRight: 0 }}>
                                      <Chip size="small" label="En Lote Externo" color="warning" variant="outlined" />
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    );
                  })}
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )
        ) : flatExternalCaravans.length === 0 ? (
          <Paper sx={{ p: 5, textAlign: 'center', border: 1, borderColor: 'divider', borderRadius: 2 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No se encontraron caravanas externas con los filtros actuales.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Verifique que los lotes de compra tengan animales asignados.
            </Typography>
          </Paper>
        ) : (
          <Paper
            elevation={0}
            sx={{
              border: 1,
              borderColor: theme.palette.divider,
              borderRadius: '4px',
              overflow: 'hidden',
              bgcolor: 'background.paper',
            }}
          >
            <TableContainer sx={{ maxHeight: 'calc(100vh - 360px)' }}>
              <Table stickyHeader size="small" sx={{ minWidth: 1150, borderCollapse: 'collapse' }}>
                <TableHead>
                  {/* Fila 1: Cabeceras de Grupo */}
                  <TableRow>
                    <TableCell padding="none" sx={{ bgcolor: headerBg, width: 44, borderBottom: '1px solid', borderColor: headerBorder }} />
                    <TableCell colSpan={7} align="center" sx={{ bgcolor: headerBg, color: isDark ? '#94a3b8' : '#475569', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid', borderColor: headerBorder, py: 1 }}>
                      Datos de la Caravana
                    </TableCell>
                    <TableCell colSpan={3} align="center" sx={{ bgcolor: alpha(theme.palette.primary.main, isDark ? 0.09 : 0.06), color: 'primary.main', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid', borderColor: headerBorder, py: 1 }}>
                      Destino / Estado
                    </TableCell>
                  </TableRow>
                  {/* Fila 2: Encabezados de Columna (patrón Pedigree) */}
                  <TableRow>
                    <TableCell sx={{ ...headerCellStyle, width: 44, textAlign: 'center', p: 0.5 }}>
                      <Checkbox
                        size="small"
                        checked={allPageSelected}
                        indeterminate={somePageSelected}
                        onChange={handleTogglePage}
                        sx={{ p: 0.5 }}
                      />
                    </TableCell>
                    <TableCell sx={{ ...headerCellStyle, width: 44, textAlign: 'center' }}>#</TableCell>
                    <TableCell sx={{ ...headerCellStyle, minWidth: 180 }}>Caravana</TableCell>
                    <TableCell sx={{ ...headerCellStyle, minWidth: 120 }}>Categoría</TableCell>
                    <TableCell sx={{ ...headerCellStyle, minWidth: 110 }}>Sexo</TableCell>
                    <TableCell sx={{ ...headerCellStyle, minWidth: 140 }}>Raza</TableCell>
                    <TableCell sx={{ ...headerCellStyle, minWidth: 100 }}>Dentición</TableCell>
                    <TableCell sx={{ ...headerCellStyle, minWidth: 130 }}>Peso Entrada</TableCell>
                    <TableCell sx={{ ...headerCellStyle, minWidth: 190 }}>Lote / Proveedor</TableCell>
                    <TableCell sx={{ ...headerCellStyle, minWidth: 160 }}>RENSPA</TableCell>
                    <TableCell sx={{ ...headerCellStyle, minWidth: 150, borderRight: 0 }}>Estado</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginatedRows.map(({ caravan, batch }, index) => {
                    const isSelected = selectedCaravanIds.includes(caravan.id);
                    const rowBg = isSelected
                      ? (isDark ? 'rgba(99, 102, 241, 0.22)' : '#e0e7ff')
                      : index % 2 === 1
                      ? zebraBg
                      : 'inherit';
                    return (
                      <TableRow
                        key={caravan.id}
                        hover
                        onClick={() => handleToggleCaravan(caravan.id)}
                        sx={{
                          cursor: 'pointer',
                          bgcolor: rowBg,
                          transition: 'background-color 0.15s ease',
                        }}
                      >
                        <TableCell sx={{ ...bodyCellStyle, textAlign: 'center', p: 0.5 }}>
                          <Checkbox checked={isSelected} size="small" sx={{ p: 0.5 }} />
                        </TableCell>
                        <TableCell sx={{ ...bodyCellStyle, textAlign: 'center', color: 'text.secondary', fontSize: '0.75rem', fontWeight: 600 }}>
                          {page * rowsPerPage + index + 1}
                        </TableCell>
                        <TableCell sx={bodyCellStyle}>
                          <Typography sx={{ fontFamily: 'monospace', fontWeight: 800, color: 'primary.main', fontSize: '0.85rem', lineHeight: 1.1 }}>
                            #{caravan.identification}
                          </Typography>
                          {caravan.category && (
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem', display: 'block' }}>
                              {caravan.breed || ''}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={bodyCellStyle}>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}>
                            {caravan.category_name || caravan.category || '-'}
                          </Typography>
                          {caravan.subcategory_name && (
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem', display: 'block' }}>
                              {caravan.subcategory_name}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={bodyCellStyle}>
                          <Chip
                            size="small"
                            label={caravan.sex === 'M' ? 'Macho' : 'Hembra'}
                            color={caravan.sex === 'M' ? 'info' : 'secondary'}
                            variant="outlined"
                            sx={{ fontWeight: 700, fontSize: '0.68rem', height: 22 }}
                          />
                        </TableCell>
                        <TableCell sx={{ ...bodyCellStyle, fontSize: '0.78rem' }}>{caravan.breed || '-'}</TableCell>
                        <TableCell sx={{ ...bodyCellStyle, fontSize: '0.78rem' }}>{caravan.teeth} D</TableCell>
                        <TableCell sx={{ ...bodyCellStyle, fontSize: '0.78rem' }}>{caravan.entry_weight ? `${caravan.entry_weight} kg` : '-'}</TableCell>
                        <TableCell sx={bodyCellStyle}>
                          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.78rem', color: 'text.primary' }}>
                            {batch.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem', display: 'block' }}>
                            {batch.provider_name || 'Proveedor Externo'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ ...bodyCellStyle, fontSize: '0.78rem' }}>{caravan.renspa || 'NO_DEFINIDO'}</TableCell>
                        <TableCell sx={{ ...bodyCellStyle, borderRight: 0 }}>
                          <Chip size="small" label="En Lote Externo" color="warning" variant="outlined" />
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {paginatedRows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={11} sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
                        <Box sx={{ mb: 1, display: 'flex', justifyContent: 'center' }}>
                          <FuseSvgIcon size={36} color="disabled">
                            heroicons-outline:magnifying-glass
                          </FuseSvgIcon>
                        </Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          No se encontraron animales con los filtros seleccionados
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Intente cambiar el término de búsqueda o seleccione otro filtro.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[10, 15, 25, 50]}
              component="div"
              count={flatExternalCaravans.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Filas por página:"
              labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`}
              sx={{
                borderTop: 1,
                borderColor: theme.palette.divider,
                bgcolor: isDark ? 'rgba(255, 255, 255, 0.01)' : '#fafafa',
              }}
            />
          </Paper>
        )}

        {/* Modal de Confirmación */}
        <Dialog open={isConfirmOpen} onClose={() => setIsConfirmOpen(false)}>
          <DialogTitle sx={{ fontWeight: 700 }}>Confirmar Asignación a Lote Propio</DialogTitle>
          <DialogContent dividers>
            <Typography variant="body2" sx={{ mb: 2 }}>
              ¿Confirma la transferencia de <strong>{selectedCaravanIds.length} caravanas</strong> hacia el lote propio seleccionado?
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              &bull; Las caravanas saldrán del lote externo y pasarán a ser operativas en el lote propio.
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              &bull; Se registrará el movimiento de compra y se conservará el RENSPA/lote de procedencia en los metadatos.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsConfirmOpen(false)} color="inherit">
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmTransfer}
              variant="contained"
              color="primary"
              disabled={assignMutation.isPending}
            >
              Confirmar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal de Alta Rápida de Lote */}
        <CreateBatchDialog
          open={isCreateBatchOpen}
          onClose={() => setIsCreateBatchOpen(false)}
          onSuccess={handleCreateBatchSuccess}
        />
      </Box>
    </ViewLayout>
  );
}
