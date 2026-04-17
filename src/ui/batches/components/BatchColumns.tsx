import { MRT_ColumnDef } from 'material-react-table';
import { Batch } from '@/core/batches/domain/entities/Batch';
import { Chip, Typography } from '@mui/material';

export const getBatchColumns = (): MRT_ColumnDef<Batch>[] => [
  {
    accessorKey: 'name',
    header: 'Nombre del Lote',
    size: 200,
    Cell: ({ cell }) => (
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        {cell.getValue<string>()}
      </Typography>
    ),
  },
  {
    accessorKey: 'provider_name',
    header: 'Proveedor',
    size: 200,
  },
  {
    accessorKey: 'farm_name',
    header: 'Establecimiento / Granja',
    size: 200,
  },
  {
    accessorKey: 'is_active',
    header: 'Estado',
    size: 150,
    Cell: ({ cell }) => (
      <Chip
        label={cell.getValue<boolean>() ? 'Activo' : 'Inactivo'}
        size="small"
        color={cell.getValue<boolean>() ? 'success' : 'default'}
        variant="outlined"
      />
    ),
  },
  {
    accessorKey: 'created_at',
    header: 'Fecha de Creación',
    size: 200,
  },
];
