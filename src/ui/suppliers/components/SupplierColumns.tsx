import { MRT_ColumnDef } from 'material-react-table';
import { Typography, Chip } from '@mui/material';
import { Supplier } from '@/core/suppliers/domain/entities/Supplier';

/**
 * Column definitions for the Supplier Data Table.
 */
export const getSupplierColumns = (): MRT_ColumnDef<Supplier>[] => [
  {
    accessorKey: 'name',
    header: 'Nombre / Razón Social',
    size: 250,
    Cell: ({ cell }) => (
      <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
        {cell.getValue<string>()}
      </Typography>
    ),
  },
  {
    accessorKey: 'commercial_name',
    header: 'Nombre Comercial',
    size: 200,
    Cell: ({ cell }) => cell.getValue() || '-',
  },
  {
    accessorKey: 'cuit',
    header: 'CUIT',
    size: 150,
    Cell: ({ cell }) => (
      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
        {cell.getValue<string>()}
      </Typography>
    ),
  },
  {
    accessorKey: 'email',
    header: 'Email',
    size: 200,
  },
  {
    accessorKey: 'phone',
    header: 'Teléfono',
    size: 150,
  },
  {
    accessorKey: 'is_active',
    header: 'Estado',
    size: 100,
    Cell: ({ cell }) => (
      <Chip
        label={cell.getValue<boolean>() ? 'Activo' : 'Inactivo'}
        color={cell.getValue<boolean>() ? 'success' : 'error'}
        size="small"
        sx={{ fontWeight: 600 }}
      />
    ),
  },
];
