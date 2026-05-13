import React, { useState, useMemo, forwardRef, useImperativeHandle } from 'react';
import {
  Box,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  alpha,
  useTheme,
  Menu,
  MenuItem,
  IconButton,
  Tooltip,
  Typography,
  Avatar,
  Chip
} from '@mui/material';
import DataTable from 'src/components/data-table/DataTable';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { getCaravanColumns } from './columns/CaravanColumns';
import { CaravanWeightDialog } from './CaravanWeightDialog';
import { useCompany } from '@/contexts/CompanyContext';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import { useUpsertCaravan } from '@/features/caravans/hooks/useUpsertCaravan';
import { useQueryClient } from '@tanstack/react-query';
import { Caravan as CaravanEntity } from '@/core/caravans/domain/entities/Caravan';

export interface CaravanDataTableRef {
  openAddDialog: () => void;
  refresh: () => void;
}

type ActionMode = 'create' | 'edit' | 'view';

interface CaravanDataTableProps {
  onBulkWeightEntry?: (batchId: number) => void;
}

const CaravanDataTable = forwardRef<CaravanDataTableRef, CaravanDataTableProps>((props, ref) => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { activeCompanyId } = useCompany();

  // Data Fetching via React Query (Auto-reacts to activeCompanyId change)
  const { data: caravans = [], isLoading } = useCaravans(activeCompanyId);
  const upsertMutation = useUpsertCaravan();

  const [openDialog, setOpenDialog] = useState(false);
  const [actionMode, setActionMode] = useState<ActionMode>('create');

  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  const openExportMenu = Boolean(exportAnchorEl);

  const [formData, setFormData] = useState({
    id: 0,
    identification: '',
    category: '',
    breed: '',
    teeth: 0,
    entry_weight: '',
    sex: 'M',
    entry_date: new Date().toISOString().split('T')[0]
  });

  // --- Transfer Flow State ---
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [selectedCaravan, setSelectedCaravan] = useState<any>(null);
  const [targetCompanyId, setTargetCompanyId] = useState<number | string>('');
  const [weightDialogOpen, setWeightDialogOpen] = useState(false);
  const [caravanForWeight, setCaravanForWeight] = useState<any>(null);

  const handleOpenWeight = (caravan: any) => {
    setCaravanForWeight(caravan);
    setWeightDialogOpen(true);
  };

  const { companies } = useCompany();
  const availableCompanies = companies.filter(c => c.id !== activeCompanyId);

  const handleOpenTransfer = (caravans: any | any[]) => {
    const data = Array.isArray(caravans) ? caravans : [caravans];
    setSelectedCaravan(data);
    setTransferDialogOpen(true);
  };

  const handleCloseTransfer = () => {
    setTransferDialogOpen(false);
    setSelectedCaravan(null);
    setTargetCompanyId('');
  };

  const handleConfirmTransfer = () => {
    const count = Array.isArray(selectedCaravan) ? selectedCaravan.length : 1;
    const ids = Array.isArray(selectedCaravan) ? selectedCaravan.map(c => c.identification).join(', ') : selectedCaravan?.identification;
    
    console.log(`Iniciando transferencia masiva (${count} animales): ${ids} a empresa ID: ${targetCompanyId}`);
    
    enqueueSnackbar(`${count} caravanas preparadas para transferencia`, { variant: 'info' });
    handleCloseTransfer();
  };

  useImperativeHandle(ref, () => ({
    openAddDialog: () => {
      setActionMode('create');
      setOpenDialog(true);
    },
    refresh: () => queryClient.invalidateQueries({ queryKey: ['caravans'] })
  }));

  const handleExportTxt = (selectedRows: any[] = []) => {
    const dataToExport = selectedRows.length > 0 ? selectedRows : caravans;
    if (dataToExport.length === 0) return;

    let content = '';
    dataToExport.forEach(c => {
      content += `${c.identification || '-'}-${c.sex || '-'}-${c.breed || '-'}-${c.entry_date || '-'};\r\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileName = selectedRows.length > 0 ? 'seleccion_caravanas' : 'todas_las_caravanas';
    link.download = `${fileName}_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenDialog = (mode: ActionMode, rowData?: any) => {
    setActionMode(mode);
    if (rowData) {
      setFormData({
        id: rowData.id,
        identification: rowData.identification,
        category: rowData.category || '',
        breed: rowData.breed || '',
        teeth: rowData.teeth,
        entry_weight: rowData.entry_weight?.toString() || '',
        sex: rowData.sex || 'M',
        entry_date: rowData.entry_date || ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      id: 0,
      identification: '',
      category: '',
      breed: '',
      teeth: 0,
      entry_weight: '',
      sex: 'M',
      entry_date: new Date().toISOString().split('T')[0]
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (actionMode === 'view') return;

    const payload = {
      ...formData,
      entry_weight: formData.entry_weight ? parseFloat(formData.entry_weight) : null,
      teeth: Number(formData.teeth)
    };

    upsertMutation.mutate(payload, {
      onSuccess: () => {
        handleCloseDialog();
      }
    });
  };

  // ─── Data Transformation: Group Caravans by Batch ───
  const groupedBatches = useMemo(() => {
    const batchesMap: Record<number, any> = {};
    
    caravans.forEach(caravan => {
      const bId = caravan.batch_id || 0;
      if (!batchesMap[bId]) {
        batchesMap[bId] = {
          id: bId,
          name: caravan.batch_name || 'SIN LOTE ASIGNADO',
          caravans: []
        };
      }
      batchesMap[bId].caravans.push(caravan);
    });
    
    return Object.values(batchesMap);
  }, [caravans]);

  // ─── Columns for the Batch Rows (Top Level) ───
  const batchColumns = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Lote / Grupo',
      size: 300,
      Cell: ({ cell, row }: any) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar 
            sx={{ 
              bgcolor: (theme) => theme.palette.primary.main, 
              width: 36, 
              height: 36, 
              fontSize: '0.875rem', 
              fontWeight: 800,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            {cell.getValue<string>().substring(0, 2).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
              {cell.getValue<string>()}
            </Typography>
            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
              {row.original.caravans.length} Animales en inventario
            </Typography>
          </Box>
        </Stack>
      )
    },
    {
      header: 'Categoría Predominante',
      size: 200,
      accessorFn: (row: any) => row.caravans[0]?.category || '-',
      Cell: ({ cell }: any) => (
        <Chip 
          label={cell.getValue() || '-'} 
          size="small" 
          variant="outlined"
          sx={{ fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase' }}
        />
      )
    },
    {
      header: 'Peso Promedio',
      size: 150,
      accessorFn: (row: any) => {
        const weights = row.caravans.filter((c: any) => c.current_weight).map((c: any) => c.current_weight);
        if (weights.length === 0) return 0;
        return weights.reduce((a: number, b: number) => a + b, 0) / weights.length;
      },
      Cell: ({ cell }: any) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
          {cell.getValue() > 0 ? `${Math.round(cell.getValue())} kg` : '-'}
        </Typography>
      )
    }
  ], []);

  // ─── Columns for the Caravans (Detail Level) ───
  const caravanColumns = useMemo(() => getCaravanColumns().filter(col => col.accessorKey !== 'batch_name'), []);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="w-full">
      <DataTable
        columns={batchColumns}
        data={groupedBatches}
        enableRowSelection={true}
        enableColumnOrdering={true}
        enableGlobalFilter={true}
        enableRowActions={true}
        enableExpanding={true}
        positionActionsColumn="last"
        renderDetailPanel={({ row }) => (
          <Box
            sx={{
              display: 'grid',
              width: '100%',
              px: 1,
              py: 3,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
              borderTop: '1px solid',
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block' }}>
                Detalle de Animales en {row.original.name} ({row.original.caravans.length})
              </Typography>
              <Button
                size="small"
                variant="text"
                startIcon={<FuseSvgIcon size={18}>heroicons-outline:plus-circle</FuseSvgIcon>}
                onClick={() => handleOpenDialog('create')}
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                Añadir Caravana
              </Button>
            </Box>

            <DataTable
              columns={caravanColumns}
              data={row.original.caravans}
              enableTopToolbar={false}
              enableBottomToolbar={false}
              enableRowActions={true}
              renderRowActions={({ row: caravanRow }) => (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton size="small" onClick={() => handleOpenDialog('view', caravanRow.original)}>
                    <FuseSvgIcon size={16}>heroicons-outline:eye</FuseSvgIcon>
                  </IconButton>
                  <IconButton size="small" onClick={() => handleOpenDialog('edit', caravanRow.original)}>
                    <FuseSvgIcon size={16}>heroicons-outline:pencil-alt</FuseSvgIcon>
                  </IconButton>
                  <IconButton size="small" color="success" onClick={() => handleOpenWeight(caravanRow.original)}>
                    <FuseSvgIcon size={16}>heroicons-outline:scale</FuseSvgIcon>
                  </IconButton>
                  <IconButton size="small" color="primary" onClick={() => handleOpenTransfer(caravanRow.original)}>
                    <FuseSvgIcon size={16}>heroicons-outline:arrows-right-left</FuseSvgIcon>
                  </IconButton>
                </Box>
              )}
              muiTableProps={{
                sx: {
                  width: '100%',
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  '& .MuiTableHead-root': {
                    bgcolor: 'action.hover',
                  }
                }
              }}
              muiTableHeadCellProps={{
                sx: {
                  borderRight: '1px solid',
                  borderBottom: '2px solid',
                  borderColor: 'divider',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  bgcolor: 'action.hover',
                }
              }}
              muiTableBodyCellProps={{
                sx: {
                  borderRight: '1px solid',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  p: '6px 12px',
                }
              }}
              initialState={{ 
                density: 'compact',
                columnVisibility: { id: false }
              }}
            />
          </Box>
        )}
        renderRowActions={({ row }) => (
          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
            <Tooltip title="Carga Masiva de Pesajes">
              <IconButton 
                size="small" 
                color="success"
                onClick={() => props.onBulkWeightEntry?.(row.original.id)}
              >
                <FuseSvgIcon size={18}>heroicons-outline:scale</FuseSvgIcon>
              </IconButton>
            </Tooltip>
            <Tooltip title="Gestionar Lote">
              <IconButton size="small" color="primary">
                <FuseSvgIcon size={18}>heroicons-outline:folder-open</FuseSvgIcon>
              </IconButton>
            </Tooltip>
            <Tooltip title="Más opciones">
              <IconButton size="small">
                <FuseSvgIcon size={18}>heroicons-outline:ellipsis-vertical</FuseSvgIcon>
              </IconButton>
            </Tooltip>
          </Box>
        )}
        renderTopToolbarCustomActions={({ table }) => (
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ ml: 1 }}>
            <Button
              size="small"
              color="inherit"
              sx={{
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: '8px',
                px: 2,
                bgcolor: (theme) => alpha(theme.palette.action.active, 0.05),
                '&:hover': { bgcolor: (theme) => alpha(theme.palette.action.active, 0.1) }
              }}
              startIcon={<FuseSvgIcon size={18}>heroicons-outline:document-text</FuseSvgIcon>}
              onClick={() => handleExportTxt()}
            >
              Exportar Inventario
            </Button>
            
            <Menu
              anchorEl={exportAnchorEl}
              open={openExportMenu}
              onClose={() => setExportAnchorEl(null)}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={() => { console.log('Export CSV'); setExportAnchorEl(null); }}>
                <FuseSvgIcon size={20} className="mr-3" color="action">heroicons-outline:table</FuseSvgIcon>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>Exportar CSV</Typography>
              </MenuItem>
            </Menu>
          </Stack>
        )}
        muiTableProps={{
          sx: {
            width: '100%',
            border: '1px solid',
            borderColor: 'divider',
          }
        }}
        muiTableHeadCellProps={{
          sx: {
            borderRight: '1px solid',
            borderBottom: '2px solid',
            borderColor: 'divider',
            bgcolor: 'action.hover',
            fontWeight: 800,
          }
        }}
        muiTableBodyCellProps={{
          sx: {
            borderRight: '1px solid',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }
        }}
        initialState={{
          density: 'compact',
          showGlobalFilter: true,
          pagination: { pageSize: 15, pageIndex: 0 }
        }}
      />

      {/* Reusable Dialog for Create/Edit/View */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth scroll="paper" PaperProps={{ sx: { borderRadius: '16px' } }}>
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ p: 3, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <FuseSvgIcon color="primary" size={24}>
              {actionMode === 'create' ? 'heroicons-outline:plus-circle' : actionMode === 'edit' ? 'heroicons-outline:pencil-alt' : 'heroicons-outline:information-circle'}
            </FuseSvgIcon>
            {actionMode === 'create' ? 'Insertar Nueva Caravana' : actionMode === 'edit' ? 'Editar Caravana' : 'Detalles de la Caravana'}
          </DialogTitle>
          <DialogContent dividers sx={{ p: 3 }}>
            <Box className="grid grid-cols-1 sm:grid-cols-2 gap-16">
              <Box><TextField name="identification" label="Identificación" required fullWidth disabled={actionMode === 'view'} value={formData.identification} onChange={handleChange} /></Box>
              <Box><TextField name="category" label="Categoría" fullWidth disabled={actionMode === 'view'} value={formData.category} onChange={handleChange} /></Box>
              <Box><TextField name="breed" label="Raza" fullWidth disabled={actionMode === 'view'} value={formData.breed} onChange={handleChange} /></Box>
              <Box>
                <TextField name="sex" label="Sexo" select fullWidth disabled={actionMode === 'view'} value={formData.sex} onChange={handleChange}>
                  <MenuItem value="M">Macho</MenuItem>
                  <MenuItem value="H">Hembra</MenuItem>
                </TextField>
              </Box>
              <Box className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-16">
                <Box><TextField name="teeth" label="Dientes" type="number" fullWidth disabled={actionMode === 'view'} value={formData.teeth} onChange={handleChange} /></Box>
                <Box><TextField name="entry_weight" label="Peso (Kg)" type="number" fullWidth disabled={actionMode === 'view'} value={formData.entry_weight} onChange={handleChange} /></Box>
                <Box><TextField name="entry_date" label="Fecha" type="date" fullWidth disabled={actionMode === 'view'} value={formData.entry_date} onChange={handleChange} InputLabelProps={{ shrink: true }} /></Box>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleCloseDialog} color="inherit" sx={{ fontWeight: 600 }}>{actionMode === 'view' ? 'Cerrar' : 'Cancelar'}</Button>
            {actionMode !== 'view' && (
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={upsertMutation.isPending}
                sx={{
                  px: 4,
                  fontWeight: 700,
                }}
                startIcon={upsertMutation.isPending ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {actionMode === 'create' ? 'Guardar Registro' : 'Actualizar Cambios'}
              </Button>
            )}
          </DialogActions>
        </form>
      </Dialog>

      {/* --- Transfer Dialog --- */}
      <Dialog 
        open={transferDialogOpen} 
        onClose={handleCloseTransfer} 
        maxWidth="sm" 
        fullWidth 
        PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
          <Box sx={{ p: 1, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: '12px', display: 'flex' }}>
            <FuseSvgIcon color="primary" size={24}>heroicons-outline:arrows-right-left</FuseSvgIcon>
          </Box>
          Transferencia {Array.isArray(selectedCaravan) && selectedCaravan.length > 1 ? `Masiva de ${selectedCaravan.length} Animales` : 'de Animal'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
            {Array.isArray(selectedCaravan) && selectedCaravan.length > 1 
              ? `Estás por transferir un lote de ${selectedCaravan.length} animales.` 
              : `Estás por transferir la caravana ${selectedCaravan?.[0]?.identification}.`
            }
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Esta acción registrará un movimiento de salida en la empresa actual y una entrada automática en la empresa destino para cada animal seleccionado.
          </Typography>
          
          <Box sx={{ p: 2, bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04), borderRadius: '12px', mb: 3, border: 1, borderColor: 'divider' }}>
            <TextField
              select
              fullWidth
              label="Empresa Destino"
              value={targetCompanyId}
              onChange={(e) => setTargetCompanyId(e.target.value)}
              variant="outlined"
              helperText={availableCompanies.length === 0 ? "No tienes otras empresas registradas" : "Selecciona la empresa que recibirá los animales"}
            >
              {availableCompanies.map((company) => (
                <MenuItem key={company.id} value={company.id}>
                  {company.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1.5 }}>
          <Button onClick={handleCloseTransfer} color="inherit" sx={{ fontWeight: 600, textTransform: 'none' }}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmTransfer} 
            variant="contained" 
            color="primary" 
            disabled={!targetCompanyId}
            sx={{ 
              fontWeight: 700, 
              textTransform: 'none', 
              px: 4, 
              borderRadius: '8px',
              boxShadow: 'none',
              '&:hover': { boxShadow: 'none' }
            }}
          >
            Confirmar Transferencia
          </Button>
        </DialogActions>
      </Dialog>

      <CaravanWeightDialog
        open={weightDialogOpen}
        onClose={() => {
          setWeightDialogOpen(false);
          setCaravanForWeight(null);
        }}
        caravan={caravanForWeight}
      />
    </Box>
  );
});

export default CaravanDataTable;
