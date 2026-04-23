import { 
  Paper, 
  Box, 
  Avatar, 
  Typography, 
  Chip, 
  IconButton 
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useMemo } from 'react';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import DataTable from '@/components/data-table/DataTable';
import { type MRT_ColumnDef } from 'material-react-table';
import { Farm } from '@/core/suppliers/domain/entities/Farm';

interface FarmsTableViewProps {
  farms: Farm[];
}

export const FarmsTableView = ({ farms }: FarmsTableViewProps) => {
  const farmColumns = useMemo<MRT_ColumnDef<Farm>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Establecimiento',
        Cell: ({ cell }) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1), color: 'primary.main', borderRadius: '4px', width: 32, height: 32 }}>
               <FuseSvgIcon size={18}>heroicons-outline:home-modern</FuseSvgIcon>
            </Avatar>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>{cell.getValue<string>()}</Typography>
          </Box>
        )
      },
      {
        accessorKey: 'renspa',
        header: 'RENSPA',
        Cell: ({ cell }) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{cell.getValue<string>() || 'N/A'}</Typography>
      },
      {
        accessorKey: 'location',
        header: 'Ubicación',
        Cell: ({ cell }) => <Typography variant="body2" color="text.secondary">{cell.getValue<string>() || '-'}</Typography>
      },
      {
        accessorKey: 'caravans_count',
        header: 'Caravanas',
        muiTableHeadCellProps: { align: 'right' },
        muiTableBodyCellProps: { align: 'right' },
        Cell: ({ cell }) => (
          <Typography variant="body2" sx={{ fontWeight: 800, color: (theme) => theme.palette.mode === 'light' ? '#0a6ed1' : 'primary.main' }}>
            {cell.getValue<number>() || 0}
          </Typography>
        )
      },
      {
        accessorKey: 'is_active',
        header: 'Estado',
        Cell: ({ cell }) => (
          <Chip 
            label={cell.getValue<boolean>() ? 'Activo' : 'Inactivo'} 
            size="small"
            sx={{ 
              height: 20, 
              fontSize: '0.75rem', 
              fontWeight: 700,
              bgcolor: (theme) => alpha(cell.getValue<boolean>() ? theme.palette.success.main : theme.palette.error.main, 0.1),
              color: (theme) => cell.getValue<boolean>() ? theme.palette.success.main : theme.palette.error.main
            }}
          />
        )
      }
    ],
    []
  );

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        borderRadius: '12px', 
        border: 1, 
        borderColor: 'divider', 
        overflow: 'hidden',
        bgcolor: 'background.paper'
      }}
    >
      <DataTable 
        columns={farmColumns} 
        data={farms}
        enableRowSelection={false}
        enableRowActions={true}
        renderRowActions={() => (
          <IconButton 
            size="small" 
            sx={{ color: (theme: any) => theme.palette.mode === 'light' ? '#0a6ed1' : theme.palette.primary.main }}
          >
            <FuseSvgIcon size={20}>heroicons-solid:chevron-right</FuseSvgIcon>
          </IconButton>
        )}
      />
    </Paper>
  );
};
