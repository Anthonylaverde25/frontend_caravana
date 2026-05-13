import { MRT_ColumnDef } from 'material-react-table';
import { Typography, Chip } from '@mui/material';

export interface Caravan {
  id: number;
  identification: string;
  category: string | null;
  breed: string | null;
  teeth: number;
  entry_weight: number | null;
  current_weight: number | null;
  sex: string | null;
  entry_date: string | null;
  batch_name: string | null;
}

/**
 * Column definitions for the Caravan Data Table.
 * Separated to improve maintainability and component cleanliness.
 */
export const getCaravanColumns = (): MRT_ColumnDef<Caravan>[] => [
  {
    accessorKey: 'batch_name',
    header: 'Lote',
    size: 140,
    enableGrouping: true,
    enableColumnFilter: false,
    enableColumnActions: false,
    GroupedCell: ({ cell, row }) => (
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip 
          label={`LOTE: ${cell.getValue<string>() || 'SIN ASIGNAR'}`}
          color="primary"
          size="small"
          sx={{ fontWeight: 800, borderRadius: '4px' }}
        />
        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
          ({row.subRows?.length || 0} animales)
        </Typography>
      </Typography>
    ),
    Cell: ({ cell }) => {
      const val = cell.getValue<string>();
      return (
        <Chip
          label={val || 'SIN LOTE'}
          size="small"
          variant="outlined"
          sx={{ 
            fontWeight: 700, 
            fontSize: '0.65rem',
            height: 20,
            color: val ? 'primary.main' : 'text.disabled',
            borderColor: val ? 'primary.main' : 'divider',
            bgcolor: val ? (theme) => (theme.palette.mode === 'dark' ? 'rgba(30, 136, 229, 0.08)' : 'rgba(30, 136, 229, 0.04)') : 'transparent'
          }}
        />
      );
    },
  },
  {
    accessorKey: 'identification',
    header: 'Caravana',
    size: 150,
    Cell: ({ cell }) => (
      <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main', fontSize: '0.875rem' }}>
        {cell.getValue<string>()}
      </Typography>
    ),
  },
  {
    accessorKey: 'category',
    header: 'Categoría',
    size: 140,
    Cell: ({ cell }) => (
      <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary', fontSize: '0.875rem' }}>
        {cell.getValue<string>() || '-'}
      </Typography>
    ),
  },
  {
    accessorKey: 'breed',
    header: 'Raza',
    size: 120,
    Cell: ({ cell }) => (
      <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary', fontSize: '0.875rem' }}>
        {cell.getValue<string>() || '-'}
      </Typography>
    ),
  },
  {
    accessorKey: 'sex',
    header: 'Sexo',
    size: 90,
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
    Cell: ({ cell }) => {
      const val = cell.getValue<string>();
      return (
        <Typography variant="caption" sx={{ fontWeight: 700, color: val === 'M' ? 'primary.main' : 'secondary.main' }}>
          {val === 'M' ? 'MACHO' : val === 'H' ? 'HEMBRA' : val || '-'}
        </Typography>
      );
    },
  },
  {
    accessorKey: 'teeth',
    header: 'Dientes',
    size: 90,
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
    Cell: ({ cell }) => (
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {cell.getValue<number>()}
      </Typography>
    ),
  },
  {
    accessorKey: 'entry_weight',
    header: 'Peso Inicial',
    size: 110,
    muiTableHeadCellProps: { align: 'right' },
    muiTableBodyCellProps: { align: 'right' },
    Cell: ({ cell }) => cell.getValue() ? (
      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
        {cell.getValue<number>().toLocaleString()} kg
      </Typography>
    ) : '-',
  },
  {
    accessorKey: 'current_weight',
    header: 'Peso Actual (Kg)',
    size: 110,
    muiTableHeadCellProps: { align: 'right' },
    muiTableBodyCellProps: { align: 'right' },
    Cell: ({ cell }) => cell.getValue() ? (
      <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 700 }}>
        {cell.getValue<number>().toLocaleString()} kg
      </Typography>
    ) : '-',
  },
  {
    accessorKey: 'entry_date',
    header: 'Fecha Ingreso',
    size: 130,
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
    Cell: ({ cell }) => {
      const val = cell.getValue<string>();
      if (!val) return '-';
      return (
        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
          {val}
        </Typography>
      );
    },
  },
];
