import React, { useState, useEffect, useMemo, useCallback, forwardRef, useImperativeHandle } from 'react';
import {
  Box,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  alpha,
  useTheme,
  Menu,
  IconButton,
  Tooltip,
  Typography
} from '@mui/material';
import DataTable from 'src/components/data-table/DataTable';
import axiosInstance from '@/lib/axiosInstance';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Caravan, getCaravanColumns } from './columns/CaravanColumns';

export interface CaravanDataTableRef {
  openAddDialog: () => void;
  refresh: () => void;
}

type ActionMode = 'create' | 'edit' | 'view';

/**
 * CaravanDataTable Component
 * High-level orchestration of the cattle inventory table.
 * Now modularized with external column definitions.
 */
const CaravanDataTable = forwardRef<CaravanDataTableRef>((_props, ref) => {
  const theme = useTheme();
  const [caravans, setCaravans] = useState<Caravan[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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

  const fetchCaravans = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/caravans');
      setCaravans(response.data);
    } catch (err) {
      console.error('Error fetching caravans:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useImperativeHandle(ref, () => ({
    openAddDialog: () => {
      setActionMode('create');
      setOpenDialog(true);
    },
    refresh: fetchCaravans
  }));

  useEffect(() => {
    fetchCaravans();
  }, [fetchCaravans]);

  const handleExportTxt = (selectedRows: Caravan[] = []) => {
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

  const handleOpenDialog = (mode: ActionMode, rowData?: Caravan) => {
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

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        entry_weight: formData.entry_weight ? parseFloat(formData.entry_weight) : null
      };

      if (actionMode === 'create') {
        await axiosInstance.post('/caravans', payload);
      } else {
        await axiosInstance.put(`/caravans/${formData.id}`, payload);
      }

      await fetchCaravans();
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving caravan:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Injection of external column definitions ───
  const columns = useMemo(() => getCaravanColumns(), []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="w-full">
      <DataTable
        columns={columns}
        data={caravans}
        enableRowSelection={true}
        enableColumnOrdering={true}
        enableGlobalFilter={true}
        enableRowActions={true}
        positionActionsColumn="last"
        initialState={{
          density: 'compact',
          showGlobalFilter: true,
          pagination: { pageSize: 15, pageIndex: 0 }
        }}
        renderRowActions={({ row }) => (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Ver Detalles">
              <IconButton size="small" color="primary" onClick={() => handleOpenDialog('view', row.original)}>
                <FuseSvgIcon size={20}>heroicons-outline:eye</FuseSvgIcon>
              </IconButton>
            </Tooltip>
            <Tooltip title="Editar">
              <IconButton size="small" color="secondary" onClick={() => handleOpenDialog('edit', row.original)}>
                <FuseSvgIcon size={20}>heroicons-outline:pencil-alt</FuseSvgIcon>
              </IconButton>
            </Tooltip>
          </Box>
        )}
        renderTopToolbarCustomActions={({ table }) => (
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ ml: 1 }}>
            <Button
              size="small"
              variant="contained"
              color="primary"
              sx={{ fontWeight: 600, textTransform: 'none', borderRadius: '8px', px: 2 }}
              startIcon={<FuseSvgIcon size={18}>heroicons-outline:document-text</FuseSvgIcon>}
              onClick={() => handleExportTxt(table.getSelectedRowModel().rows.map(row => row.original))}
            >
              Exportar TXT {table.getSelectedRowModel().rows.length > 0 ? `(${table.getSelectedRowModel().rows.length})` : ''}
            </Button>

            <IconButton
              size="small"
              onClick={(e) => setExportAnchorEl(e.currentTarget)}
              sx={{
                bgcolor: alpha(theme.palette.action.active, 0.05),
                borderRadius: '8px',
                '&:hover': { bgcolor: alpha(theme.palette.action.active, 0.1) }
              }}
            >
              <FuseSvgIcon size={20}>heroicons-outline:dots-vertical</FuseSvgIcon>
            </IconButton>

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
              <MenuItem onClick={() => { console.log('Export PDF'); setExportAnchorEl(null); }} sx={{ color: 'error.main' }}>
                <FuseSvgIcon size={20} className="mr-3" color="error">heroicons-outline:document-arrow-down</FuseSvgIcon>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>Exportar PDF</Typography>
              </MenuItem>
            </Menu>
          </Stack>
        )}
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
              <Button type="submit" variant="contained" color="primary" disabled={submitting} sx={{ px: 4, fontWeight: 700, borderRadius: '8px' }} startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}>
                {actionMode === 'create' ? 'Guardar Registro' : 'Actualizar Cambios'}
              </Button>
            )}
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
});

export default CaravanDataTable;
