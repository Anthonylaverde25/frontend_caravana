import { useMemo } from 'react';
import { Box, Typography, CircularProgress, Paper, Stack } from '@mui/material';
import DataTable from '@/components/data-table/DataTable';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useBatches } from '@/features/batches/hooks/useBatches';
import { getInternalBatchColumns } from './InternalBatchColumns';

interface InternalBatchesTableProps {
	batchType: string;
	emptyTitle: string;
	emptyDescription: string;
	emptyIcon: string;
}

/**
 * InternalBatchesTable Component
 * Renders a list of filtered batches by batchType in a DataTable.
 * Integrates beautiful Loading and Empty State layouts.
 */
export function InternalBatchesTable({
	batchType,
	emptyTitle,
	emptyDescription,
	emptyIcon,
}: InternalBatchesTableProps) {
	const { data: batches = [], isLoading, isError } = useBatches(undefined, batchType);

	const columns = useMemo(() => getInternalBatchColumns(), []);

	if (isLoading) {
		return (
			<Box className="flex items-center justify-center p-32">
				<CircularProgress />
			</Box>
		);
	}

	if (isError) {
		return (
			<Box className="p-32 text-center text-error border border-error rounded-8 bg-error-50 overflow-hidden">
				<Typography variant="h6">Error loading batches</Typography>
				<Typography variant="body2">Please try again later.</Typography>
			</Box>
		);
	}

	if (batches.length === 0) {
		return (
			<Paper
				elevation={0}
				sx={{
					p: 8,
					borderRadius: '16px',
					border: '1px solid',
					borderColor: 'divider',
					textAlign: 'center',
					bgcolor: 'background.paper',
					mt: 2,
				}}
			>
				<Stack
					spacing={3}
					alignItems="center"
					justifyContent="center"
				>
					<Box
						sx={{
							p: 2.5,
							bgcolor: 'action.selected',
							color: 'text.secondary',
							borderRadius: '50%',
							display: 'flex',
						}}
					>
						<FuseSvgIcon size={48}>{emptyIcon}</FuseSvgIcon>
					</Box>
					<Stack spacing={1}>
						<Typography
							variant="h5"
							sx={{ fontWeight: 800 }}
						>
							{emptyTitle}
						</Typography>
						<Typography
							variant="body1"
							sx={{ color: 'text.secondary', maxWidth: 600 }}
						>
							{emptyDescription}
						</Typography>
					</Stack>
				</Stack>
			</Paper>
		);
	}

	return (
		<Box className="w-full">
			<Paper
				elevation={0}
				sx={{
					borderRadius: '8px',
					border: 1,
					borderColor: 'divider',
					overflow: 'hidden',
				}}
			>
				<DataTable
					columns={columns}
					data={batches}
					enableRowSelection={true}
					enableColumnOrdering={true}
					enableGlobalFilter={true}
					enableRowActions={false} // Disabled for static listing placeholder
					initialState={{
						density: 'compact',
						showGlobalFilter: true,
						pagination: { pageSize: 15, pageIndex: 0 },
					}}
					muiTableProps={{
						sx: {
							border: '1px solid',
							borderColor: 'divider',
						},
					}}
					muiTableHeadCellProps={{
						sx: {
							borderRight: '1px solid',
							borderBottom: '2px solid',
							borderColor: 'divider',
							bgcolor: 'action.hover',
							fontWeight: 800,
						},
					}}
					muiTableBodyCellProps={{
						sx: {
							borderRight: '1px solid',
							borderBottom: '1px solid',
							borderColor: 'divider',
						},
					}}
				/>
			</Paper>
		</Box>
	);
}
