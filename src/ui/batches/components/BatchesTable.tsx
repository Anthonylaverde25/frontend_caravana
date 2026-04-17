import { useMemo } from 'react';
import { Box, Typography, CircularProgress, IconButton, Paper, Stack, Chip } from '@mui/material';
import DataTable from '@/components/data-table/DataTable';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useBatches } from '@/features/batches/hooks/useBatches';
import { useSuppliers } from '@/features/suppliers/hooks/useSuppliers';
import { getSupplierColumns } from '../../suppliers/components/SupplierColumns';

/**
 * BatchesTable Component
 * Displays the list of providers and their associated batches in a detail panel.
 */
export function BatchesTable() {
  const { data: suppliers = [], isLoading: isLoadingSuppliers, isError: isErrorSuppliers } = useSuppliers();
  const { data: batches = [], isLoading: isLoadingBatches } = useBatches();
  
  const columns = useMemo(() => getSupplierColumns(), []);

  const isLoading = isLoadingSuppliers || isLoadingBatches;

  if (isLoading) {
    return (
      <Box className="flex items-center justify-center p-32">
        <CircularProgress />
      </Box>
    );
  }

  if (isErrorSuppliers) {
    return (
      <Box className="p-32 text-center text-error border border-error rounded-8 bg-error-50 overflow-hidden">
        <Typography variant="h6">Error al cargar el panel de lotes</Typography>
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
          const providerBatches = batches.filter(b => b.provider_id === row.original.id);

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
              <Typography variant="overline" sx={{ color: '#6a6d70', fontWeight: 700, mb: 2, display: 'block' }}>
                Lotes asociados a este Proveedor ({providerBatches.length})
              </Typography>

              {providerBatches.length > 0 ? (
                <Stack spacing={1.5}>
                  {providerBatches.map((batch) => (
                    <Paper
                      key={batch.id}
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
                            {batch.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                            Establecimiento: {batch.farm_name || 'No asignado'}
                          </Typography>
                          
                          <Stack direction="row" spacing={2}>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <FuseSvgIcon size={16} sx={{ color: '#6a6d70' }}>heroicons-outline:users</FuseSvgIcon>
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                120 Cabezas
                              </Typography>
                            </Stack>
                            <Chip 
                              label="NOVILLOS" 
                              size="small" 
                              sx={{ 
                                height: 20, 
                                fontSize: '0.65rem', 
                                fontWeight: 700, 
                                bgcolor: '#e8f0fe', 
                                color: '#1967d2',
                                border: 'none'
                              }} 
                            />
                          </Stack>
                        </Box>
                      </Stack>

                      <Chip
                        label={batch.is_active ? 'Activo' : 'Inactivo'}
                        size="small"
                        color={batch.is_active ? 'success' : 'default'}
                        variant="outlined"
                        sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                      />
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                  Este proveedor no tiene lotes registrados.
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
        initialState={{
          density: 'compact',
          showGlobalFilter: true,
          pagination: { pageSize: 15, pageIndex: 0 },
        }}
      />
    </Box>
  );
}
