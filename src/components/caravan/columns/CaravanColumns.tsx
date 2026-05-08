import { MRT_ColumnDef } from 'material-react-table';
import { Typography, Chip } from '@mui/material';

export interface Caravan {
  id: number;
  identification: string;
  category: string | null;
  breed: string | null;
  teeth: number;
  entry_weight: number | null;
  sex: string | null;
  entry_date: string | null;
}

/**
 * Column definitions for the Caravan Data Table.
 * Separated to improve maintainability and component cleanliness.
 */
export const getCaravanColumns = (): MRT_ColumnDef<Caravan>[] => [
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
    header: 'Peso (Kg)',
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
