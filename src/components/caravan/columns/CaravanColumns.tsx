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
    size: 160,
    Cell: ({ cell }) => (
      <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
        {cell.getValue<string>()}
      </Typography>
    ),
  },
  {
    accessorKey: 'category',
    header: 'Categoría',
    size: 140,
    Cell: ({ cell }) => cell.getValue() ? (
      <Chip
        label={cell.getValue<string>()}
        size="small"
        sx={{ fontSize: '0.8125rem', fontWeight: 500 }}
      />
    ) : '-',
  },
  {
    accessorKey: 'breed',
    header: 'Raza',
    size: 120,
  },
  {
    accessorKey: 'sex',
    header: 'Sexo',
    size: 90,
    Cell: ({ cell }) => {
      const val = cell.getValue<string>();
      return (
        <Chip
          label={val === 'M' ? 'Macho' : val === 'H' ? 'Hembra' : val || '-'}
          size="small"
          sx={{ fontSize: '0.8125rem', fontWeight: 500 }}
        />
      );
    },
  },
  {
    accessorKey: 'teeth',
    header: 'Dientes',
    size: 90,
    Cell: ({ cell }) => (
      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
        {cell.getValue<number>()}
      </Typography>
    ),
  },
  {
    accessorKey: 'entry_weight',
    header: 'Peso (Kg)',
    size: 100,
    Cell: ({ cell }) => cell.getValue() ? (
      <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>
        {cell.getValue<number>()}
      </Typography>
    ) : '-',
  },
  {
    accessorKey: 'entry_date',
    header: 'Fecha Ingreso',
    size: 130,
    Cell: ({ cell }) => {
      const val = cell.getValue<string>();
      if (!val) return '-';
      const [year, month] = val.split('-');
      return `${month}/${year}`;
    },
  },
];
