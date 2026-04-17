import { useMemo } from 'react';
import { Box, Typography, Button, Stack, CircularProgress } from '@mui/material';
import DataTable from '@/components/data-table/DataTable';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useSuppliers } from '@/features/suppliers/hooks/useSuppliers';
import { getSupplierColumns } from './SupplierColumns';

/**
 * SuppliersTable Component
 * Displays the list of providers using Material React Table.
 */
export function SuppliersTable() {
  const { suppliers, loading, error } = useSuppliers();
  const columns = useMemo(() => getSupplierColumns(), []);

  if (loading) {
    return (
      <Box className="flex items-center justify-center p-32">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="p-32 text-center text-error border border-error rounded-16 bg-error-light overflow-hidden">
        <Typography variant="h6">{error}</Typography>
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
        positionActionsColumn="last"
        initialState={{
          density: 'compact',
          showGlobalFilter: true,
          pagination: { pageSize: 15, pageIndex: 0 }
        }}
        renderTopToolbarCustomActions={() => (
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ ml: 1 }}>
            <Button
              size="small"
              variant="contained"
              color="primary"
              startIcon={<FuseSvgIcon size={18}>heroicons-outline:plus-circle</FuseSvgIcon>}
              sx={{ borderRadius: '8px' }}
            >
              Nuevo Proveedor
            </Button>
          </Stack>
        )}
      />
    </Box>
  );
}
