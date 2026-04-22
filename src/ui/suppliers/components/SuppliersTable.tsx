import { useMemo, useState } from 'react';
import { Box, Typography, Button, Stack, CircularProgress, Paper, Chip, IconButton } from '@mui/material';
import DataTable from '@/components/data-table/DataTable';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useSuppliers } from '@/features/suppliers/hooks/useSuppliers';
import { useCreateFarm } from '@/features/suppliers/hooks/useCreateFarm';
import { getSupplierColumns } from './SupplierColumns';
import AddFarmDialog from './AddFarmDialog';
import { FarmFormValues } from './SupplierSchema';
import { useSnackbar } from 'notistack';

/**
 * SuppliersTable Component
 * Displays the list of providers using Material React Table.
 */
export function SuppliersTable() {
  const { data: suppliers = [], isLoading, isError } = useSuppliers();
  const { mutate: createFarm } = useCreateFarm();
  const { enqueueSnackbar } = useSnackbar();
  
  const [isAddFarmDialogOpen, setIsAddFarmDialogOpen] = useState(false);
  const [activeSupplierId, setActiveSupplierId] = useState<number | undefined>();

  const columns = useMemo(() => getSupplierColumns(), []);

  const handleOpenAddFarm = (supplierId: number) => {
    setActiveSupplierId(supplierId);
    setIsAddFarmDialogOpen(true);
  };

  const handleAddFarm = (farmData: FarmFormValues) => {
    if (!activeSupplierId) return;

    createFarm({
      ...farmData,
      provider_id: activeSupplierId
    }, {
      onSuccess: () => {
        enqueueSnackbar('Establecimiento añadido correctamente', { variant: 'success' });
      },
      onError: (error: any) => {
        const msg = error.response?.data?.message || 'Error al añadir el establecimiento';
        enqueueSnackbar(msg, { variant: 'error' });
      }
    });
  };

  if (isLoading) {
    return (
      <Box className="flex items-center justify-center p-32">
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box className="p-32 text-center text-error border border-error rounded-8 bg-error-50 overflow-hidden">
        <Typography variant="h6">Error al cargar la lista de proveedores</Typography>
        <Typography variant="body2">Por favor, intente nuevamente más tarde.</Typography>
      </Box>
    );
  }

  return (
    <Box className="w-full">
      <DataTable
        columns={columns}
        data={suppliers}
        enableRowSelection={true}
        enableColumnOrdering={true}
        enableGlobalFilter={true}
        enableRowActions={true}
        enableExpanding={true}
        positionActionsColumn="last"
        renderDetailPanel={({ row }) => {
          const farms = row.original.farms || [];

          return (
            <Box
              sx={{
                display: 'grid',
                width: '100%',
                p: 3,
                bgcolor: '#fafafa',
                borderTop: '1px solid #e5e5e5',
                borderBottom: '1px solid #e5e5e5'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="overline" sx={{ color: '#6a6d70', fontWeight: 700, display: 'block' }}>
                  Detalle de Establecimientos / Granjas ({farms.length})
                </Typography>
                <Button
                  size="small"
                  startIcon={<FuseSvgIcon size={18}>heroicons-outline:plus-circle</FuseSvgIcon>}
                  onClick={() => handleOpenAddFarm(row.original.id)}
                  sx={{ textTransform: 'none', fontWeight: 700, color: '#0a6ed1' }}
                >
                  Nuevo Establecimiento
                </Button>
              </Box>

              {farms.length > 0 ? (
                <Stack spacing={1.5}>
                  {farms.map((farm) => (
                    <Paper
                      key={farm.id}
                      elevation={0}
                      sx={{
                        p: 2,
                        px: 3,
                        borderRadius: '6px',
                        border: '1px solid #d8dde6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        bgcolor: '#ffffff'
                      }}
                    >
                      <Stack direction="row" spacing={3} alignItems="center">
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {farm.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            {farm.location || 'Sin ubicación especificada'}
                          </Typography>
                          {farm.renspa && (
                            <Typography variant="caption" sx={{ color: '#0a6ed1', fontWeight: 600 }}>
                              RENSPA: {farm.renspa}
                            </Typography>
                          )}
                        </Box>
                      </Stack>

                      <Chip
                        label={farm.is_active ? 'Activa' : 'Inactiva'}
                        size="small"
                        color={farm.is_active ? 'success' : 'default'}
                        variant="outlined"
                        sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                      />
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                  Este proveedor no tiene granjas asociadas registradas.
                </Typography>
              )}
            </Box>
          );
        }}
        renderRowActions={({ row }) => (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              size="small"
              title="Ver detalle"
              sx={{ color: '#0a6ed1' }}
              onClick={() => console.log('Ver proveedor', row.original.id)}
            >
              <FuseSvgIcon size={18}>heroicons-outline:eye</FuseSvgIcon>
            </IconButton>
            <IconButton
              size="small"
              title="Más opciones"
              sx={{ color: 'text.secondary' }}
              onClick={() => console.log('Acciones adicionales', row.original.id)}
            >
              <FuseSvgIcon size={18}>heroicons-outline:ellipsis-vertical</FuseSvgIcon>
            </IconButton>
          </Box>
        )}
        renderTopToolbarCustomActions={() => (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <IconButton
              size="small"
              sx={{ color: '#6a6d70' }}
              onClick={() => console.log('Opciones de tabla')}
            >
              <FuseSvgIcon size={20}>heroicons-outline:ellipsis-vertical</FuseSvgIcon>
            </IconButton>
            <Button
              variant="text"
              color="inherit"
              startIcon={<FuseSvgIcon size={20}>heroicons-outline:arrow-down-tray</FuseSvgIcon>}
              sx={{ fontWeight: 600, textTransform: 'none', color: '#6a6d70' }}
              onClick={() => console.log('Exportar a Excel')}
            >
              Exportar
            </Button>
          </Box>
        )}
        muiTopToolbarProps={{
          sx: {
            p: '5px',
          }
        }}
        initialState={{
          density: 'compact',
          showGlobalFilter: true,
          pagination: { pageSize: 15, pageIndex: 0 }
        }}
      />

      <AddFarmDialog
        open={isAddFarmDialogOpen}
        onClose={() => setIsAddFarmDialogOpen(false)}
        onAdd={handleAddFarm}
      />
    </Box>
  );
}
