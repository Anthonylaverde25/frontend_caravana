import { Typography, Chip, Avatar, Stack } from '@mui/material';
import { Supplier } from '@/core/suppliers/domain/entities/Supplier';

/**
 * Helper to get initials from a name.
 */
const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
};

/**
 * Column definitions for the Supplier Data Table.
 */
export const getSupplierColumns = (): MRT_ColumnDef<Supplier>[] => [
  {
    accessorKey: 'name',
    header: 'Nombre / Razón Social',
    size: 280,
    Cell: ({ row, cell }) => (
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar 
          sx={{ 
            bgcolor: 'primary.main', 
            fontSize: '0.875rem', 
            fontWeight: 600,
            width: 32,
            height: 32
          }}
        >
          {getInitials(cell.getValue<string>())}
        </Avatar>
        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
          {cell.getValue<string>()}
        </Typography>
      </Stack>
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
