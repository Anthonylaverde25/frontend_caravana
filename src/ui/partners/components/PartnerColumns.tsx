import { Typography, Chip, Avatar, Stack, Box } from '@mui/material';
import { MRT_ColumnDef } from 'material-react-table';
import { Partner } from '@/core/partners/domain/entities/Partner';

import { formatCuit } from '@/core/shared/domain/cuit';
/**
 * Helper to get initials from a name.
 */
const getInitials = (name: string) => {
  if (!name) return '??';
  return name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().substring(0, 2);
};

/**
 * Column definitions for the Partner Data Table.
 */
export const getPartnerColumns = (): MRT_ColumnDef<Partner>[] => [
  {
    accessorKey: 'name',
    header: 'Nombre / Razón Social',
    size: 280,
    Cell: ({ row, cell }) => {
      const val = cell.getValue<string>() || '';
      return (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              fontSize: '0.75rem',
              fontWeight: 700,
              width: 32,
              height: 32
            }}
          >
            {getInitials(val)}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>
              {val}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace', fontWeight: 500 }}>
              CUIT: {formatCuit(row.original.cuit)}
            </Typography>
          </Box>
        </Stack>
      );
    },
  },
  {
    accessorKey: 'commercial_name',
    header: 'Nombre Comercial',
    size: 200,
    Cell: ({ cell }) => cell.getValue<string>() || '-',
  },
  {
    accessorKey: 'cuit',
    header: 'CUIT',
    size: 150,
    Cell: ({ cell }) => (
      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
        {formatCuit(cell.getValue<string>())}
      </Typography>
    ),
  },
  {
    id: 'contact',
    header: 'Contacto',
    size: 260,
    accessorFn: (partner) => partner.getContactInfo(),
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
