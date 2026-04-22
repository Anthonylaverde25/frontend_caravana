import { Typography, Chip, Avatar, Stack, Box } from '@mui/material';
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
            bgcolor: '#0a6ed1',
            fontSize: '0.75rem',
            fontWeight: 700,
            width: 32,
            height: 32
          }}
        >
          {getInitials(cell.getValue<string>())}
        </Avatar>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>
            {cell.getValue<string>()}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace', fontWeight: 500 }}>
            CUIT: {row.original.cuit}
          </Typography>
        </Box>
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
