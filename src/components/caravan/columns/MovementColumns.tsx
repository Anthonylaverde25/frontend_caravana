import { MRT_ColumnDef } from 'material-react-table';
import { CaravanMovement } from '@/core/caravans/domain/entities/CaravanMovement';
import { Box, Chip, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

const TYPE_CONFIG = {
  ORIGIN: { color: 'grey', icon: 'heroicons-outline:home', label: 'ORIGEN' },
  ENTRY: { color: 'success', icon: 'heroicons-outline:arrow-down-circle', label: 'ENTRADA' },
  TRANSFER: { color: 'primary', icon: 'heroicons-outline:arrows-right-left', label: 'TRANSFERENCIA' },
  EXIT: { color: 'warning', icon: 'heroicons-outline:arrow-up-circle', label: 'SALIDA' }
};

export const getMovementColumns = (onCaravanClick?: (id: string) => void): MRT_ColumnDef<CaravanMovement>[] => [
  {
    accessorKey: 'identification',
    header: 'CARAVANA',
    size: 150,
    Cell: ({ cell }) => (
      <Typography 
        variant="body2" 
        onClick={() => onCaravanClick?.(cell.getValue<string>())}
        sx={{ 
          fontWeight: 800, 
          color: 'primary.main', 
          cursor: 'pointer',
          '&:hover': { textDecoration: 'underline' }
        }}
      >
        {cell.getValue<string>() || 'N/A'}
      </Typography>
    )
  },
  {
    accessorKey: 'type',
    header: 'TIPO EVENTO',
    size: 160,
    Cell: ({ cell }) => {
      const type = cell.getValue<string>();
      const config = TYPE_CONFIG[type] || TYPE_CONFIG.TRANSFER;
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: config.color === 'grey' ? 'text.secondary' : `${config.color}.main` }}>
          <FuseSvgIcon size={18} color="inherit">{config.icon}</FuseSvgIcon>
          <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.02em' }}>
            {config.label}
          </Typography>
        </Box>
      );
    }
  },
  {
    accessorKey: 'movementDate',
    header: 'FECHA',
    size: 150,
    Cell: ({ cell }) => (
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {cell.getValue<string>()}
      </Typography>
    )
  },
  {
    accessorKey: 'renspa',
    header: 'RENSPA / ORIGEN',
    size: 200,
    Cell: ({ cell }) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <FuseSvgIcon size={14} color="disabled">heroicons-outline:map-pin</FuseSvgIcon>
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
          {cell.getValue<string>()}
        </Typography>
      </Box>
    )
  },
  {
    accessorKey: 'observations',
    header: 'DETALLE / OBSERVACIONES',
    size: 350,
    Cell: ({ cell }) => (
      <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
        {cell.getValue<string>() || '-'}
      </Typography>
    )
  }
];
