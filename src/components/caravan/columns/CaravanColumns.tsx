import { MRT_ColumnDef } from 'material-react-table';
import { Typography, Chip, Box } from '@mui/material';

export interface Caravan {
  id: number;
  identification: string;
  category: string | null;
  category_id?: number | null;
  category_code?: string | null;
  category_name?: string | null;
  subcategory_id?: number | null;
  subcategory_code?: string | null;
  subcategory_name?: string | null;
  breed: string | null;
  teeth: number;
  entry_weight: number | null;
  current_weight: number | null;
  sex: string | null;
  entry_date: string | null;
  batch_name: string | null;
  female_details?: {
    is_empty: boolean;
    arrival_category: string;
  } | null;
  physiological_state?: {
    code: string;
    label: string;
    is_pregnant: boolean | null;
    is_nursing: boolean | null;
    gestation_stage?: string | null;
    gestation_months?: number | null;
  } | null;
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
    size: 150,
    Cell: ({ row }) => {
      const catName = row.original.category_name || row.original.category || '-';
      const subName = row.original.subcategory_name;
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.85rem' }}>
            {catName}
          </Typography>
          {subName && (
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
              {subName}
            </Typography>
          )}
        </Box>
      );
    },
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
    accessorKey: 'female_details',
    header: 'Est. Fisiológico',
    size: 160,
    muiTableHeadCellProps: { align: 'center' },
    muiTableBodyCellProps: { align: 'center' },
    Cell: ({ row }) => {
      const sex = row.original.sex;
      if (sex !== 'H') {
        return (
          <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600 }}>
            N/A
          </Typography>
        );
      }
      
      const phys = row.original.physiological_state;
      if (!phys) {
        const details = row.original.female_details;
        if (!details) return <Typography variant="caption">VACÍA</Typography>;
        return (
          <Chip 
            label={details.is_empty ? 'VACÍA' : 'PREÑADA'} 
            size="small" 
            color={details.is_empty ? 'default' : 'secondary'}
            sx={{ fontWeight: 700, fontSize: '0.65rem', height: 20 }}
          />
        );
      }

      let chipColor: 'primary' | 'secondary' | 'success' | 'warning' | 'default' = 'default';
      switch (phys.code) {
        case 'PREGNANT_LACTATING':
          chipColor = 'secondary';
          break;
        case 'PREGNANT_DRY':
          chipColor = 'success';
          break;
        case 'EMPTY_LACTATING':
          chipColor = 'warning';
          break;
        case 'EMPTY_DRY':
          chipColor = 'default';
          break;
        case 'IN_SERVICE':
          chipColor = 'primary';
          break;
        default:
          chipColor = 'default';
      }

      return (
        <Chip 
          label={phys.label} 
          size="small" 
          color={chipColor}
          variant={phys.code === 'EMPTY_DRY' ? 'outlined' : 'filled'}
          sx={{ fontWeight: 700, fontSize: '0.65rem', height: 20 }}
        />
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
