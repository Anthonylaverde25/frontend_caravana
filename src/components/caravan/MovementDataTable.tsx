import { useMemo } from 'react';
import DataTable from 'src/components/data-table/DataTable';
import { CaravanMovement } from '@/core/caravans/domain/entities/CaravanMovement';
import { Box, alpha } from '@mui/material';
import { getMovementColumns } from './columns/MovementColumns';

type MovementDataTableProps = {
  data: CaravanMovement[];
  isLoading?: boolean;
  onCaravanClick?: (id: string) => void;
};

/**
 * MovementDataTable Component
 * Displays caravan movements in a spreadsheet-style table.
 */
function MovementDataTable({ data, isLoading = false, onCaravanClick }: MovementDataTableProps) {
  const columns = useMemo(() => getMovementColumns(onCaravanClick), [onCaravanClick]);

  return (
    <Box className="w-full">
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        enableRowSelection={false}
        enableColumnOrdering={false}
        enableGlobalFilter={true}
        enableRowActions={false}
        initialState={{
          density: 'compact',
          showGlobalFilter: true,
          pagination: { pageSize: 10, pageIndex: 0 }
        }}
        muiTableProps={{
          sx: {
            borderCollapse: 'separate',
            borderSpacing: 0,
            '& .MuiTable-root': {
              border: (theme) => `1px solid ${theme.palette.divider}`,
            },
          },
        }}
        muiTableHeadCellProps={{
          sx: {
            border: (theme) => `1px solid ${theme.palette.divider}`,
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.04),
            fontWeight: 700,
            color: 'primary.main',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            py: 1,
          },
        }}
        muiTableBodyCellProps={{
          sx: {
            border: (theme) => `1px solid ${theme.palette.divider}`,
            fontSize: '0.875rem',
            py: 0.5,
          },
        }}
      />
    </Box>
  );
}

export default MovementDataTable;
