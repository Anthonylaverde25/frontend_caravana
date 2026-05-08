import { useMemo } from 'react';
import { Box, Typography, CircularProgress, Paper, IconButton } from '@mui/material';
import DataTable from '@/components/data-table/DataTable';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useBreeds } from '@/features/breeds/hooks/useBreeds';
import { MRT_ColumnDef } from 'material-react-table';
import { Breed } from '@/core/breeds/domain/entities/Breed';

/**
 * BreedsTable Component
 * Displays the list of animal breeds using Material React Table.
 */
export function BreedsTable() {
  const { data: breeds = [], isLoading, isError } = useBreeds();

  const columns = useMemo<MRT_ColumnDef<Breed>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        size: 80,
      },
      {
        accessorKey: 'name',
        header: 'Nombre de la Raza',
        size: 250,
        Cell: ({ cell }) => (
          <Typography sx={{ fontWeight: 600, color: 'primary.main' }}>
            {cell.getValue<string>()}
          </Typography>
        ),
      },
    ],
    []
  );

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
        <Typography variant="h6">Error al cargar la lista de razas</Typography>
        <Typography variant="body2">Por favor, intente nuevamente más tarde.</Typography>
      </Box>
    );
  }

  return (
    <Box className="w-full">
      <DataTable
        columns={columns}
        data={breeds}
        enableRowSelection={true}
        enableColumnOrdering={true}
        enableGlobalFilter={true}
        enableRowActions={true}
        positionActionsColumn="last"
        renderRowActions={({ row }) => (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              size="small"
              title="Editar"
              sx={{ color: '#0a6ed1' }}
              onClick={() => console.log('Editar raza', row.original.id)}
            >
              <FuseSvgIcon size={18}>heroicons-outline:pencil</FuseSvgIcon>
            </IconButton>
          </Box>
        )}
        initialState={{
          density: 'compact',
          showGlobalFilter: true,
          pagination: { pageSize: 15, pageIndex: 0 }
        }}
      />
    </Box>
  );
}
