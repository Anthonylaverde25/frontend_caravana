import React, { useEffect, useState } from 'react';
import {
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TablePagination,
	TableRow
} from '@mui/material';
import type { ExitOrderSummary } from '@/features/exit-orders/types';
import { useTransferOrderTableStyles } from '@/ui/transfer-orders/components/transferOrderFormat';
import ExitOrdersTableRow from './ExitOrdersTableRow';

interface ExitOrdersTableProps {
	orders: ExitOrderSummary[];
	onOpen: (order: ExitOrderSummary) => void;
}

/**
 * The orders, read left to right as a sale goes: what it is, who buys and when, where it stands,
 * how many left, and what they weighed and were worth.
 */
export const ExitOrdersTable: React.FC<ExitOrdersTableProps> = ({ orders, onOpen }) => {
	const { headerCell, border, isDark } = useTransferOrderTableStyles();
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(15);

	useEffect(() => setPage(0), [orders.length]);

	const visible = orders.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

	return (
		<Paper
			elevation={0}
			sx={{
				border: 1,
				borderColor: 'divider',
				borderRadius: '4px',
				overflow: 'hidden',
				bgcolor: 'background.paper'
			}}
		>
			<TableContainer sx={{ maxHeight: 'calc(100vh - 330px)' }}>
				<Table
					stickyHeader
					size="small"
					sx={{ minWidth: 1050, borderCollapse: 'collapse' }}
				>
					<TableHead>
						<TableRow>
							<TableCell sx={{ ...headerCell, width: 44, textAlign: 'center' }}>#</TableCell>
							<TableCell sx={{ ...headerCell, minWidth: 180 }}>Orden</TableCell>
							<TableCell sx={{ ...headerCell, minWidth: 200 }}>Comprador</TableCell>
							<TableCell sx={{ ...headerCell, width: 100 }}>Fecha</TableCell>
							<TableCell sx={{ ...headerCell, minWidth: 200 }}>Estado</TableCell>
							<TableCell sx={{ ...headerCell, minWidth: 140 }}>Cabezas</TableCell>
							<TableCell sx={{ ...headerCell, width: 110, textAlign: 'right' }}>Kg</TableCell>
							<TableCell sx={{ ...headerCell, width: 140, textAlign: 'right', borderRight: 0 }}>
								Importe
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{visible.map((order, index) => (
							<ExitOrdersTableRow
								key={order.id}
								order={order}
								position={page * rowsPerPage + index + 1}
								isZebra={index % 2 === 1}
								onOpen={onOpen}
							/>
						))}
					</TableBody>
				</Table>
			</TableContainer>
			<TablePagination
				component="div"
				count={orders.length}
				page={page}
				onPageChange={(_, next) => setPage(next)}
				rowsPerPage={rowsPerPage}
				onRowsPerPageChange={(e) => {
					setRowsPerPage(Number(e.target.value));
					setPage(0);
				}}
				rowsPerPageOptions={[10, 15, 25, 50]}
				labelRowsPerPage="Filas por página:"
				labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
				sx={{ borderTop: 1, borderColor: border, bgcolor: isDark ? 'rgba(255, 255, 255, 0.01)' : '#fafafa' }}
			/>
		</Paper>
	);
};

export default ExitOrdersTable;
