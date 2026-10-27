import { useState, useMemo, useEffect } from 'react';
import { Batch } from '@/core/batches/domain/entities/Batch';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';
import { useSearchParams } from 'react-router';
import { Box, Paper, TablePagination, Typography } from '@mui/material';
import type { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';

import ServiceOrdersToolbar, {
	type ServiceOrderStatusFilter
} from '../service-orders/ServiceOrdersToolbar';
import ServiceOrdersTable from '../service-orders/ServiceOrdersTable';
import ServiceOrdersTableSkeleton from '../service-orders/ServiceOrdersTableSkeleton';
import ServiceOrderDetailDrawer from '../service-order-drawer/ServiceOrderDetailDrawer';
import { getServiceOrderPhase } from '../../utils/serviceOrderPhase';
import { isQueueOrder } from '../../utils/servicesQueue';
import ServicesHistoryKpis from './history/ServicesHistoryKpis';
import ServiceOrderPrintSheetDialog from '../dialogs/ServiceOrderPrintSheetDialog';

interface ServicesHubHistoryTabProps {
	orders: ServiceOrder[];
	batches: Batch[];
	caravans: Caravan[];
	isLoading?: boolean;
}

const HISTORY_PHASES = ['DIAGNOSED', 'REJECTED', 'CANCELLED'] as const;

/**
 * "Historial" of /gestation/services: the orders with no work left (diagnosed, rejected or
 * cancelled) with their final result. An order shows up here only once it leaves "En curso".
 */
export default function ServicesHubHistoryTab({
	orders: allOrders,
	batches,
	caravans,
	isLoading = false
}: ServicesHubHistoryTabProps) {
	const orders = useMemo(() => allOrders.filter((order) => !isQueueOrder(order)), [allOrders]);
	const [searchParams, setSearchParams] = useSearchParams();
	const urlBatchId = Number(searchParams.get('batchId')) || null;
	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState<ServiceOrderStatusFilter>('ALL');
	const [batchFilter, setBatchFilter] = useState<number | 'ALL'>('ALL');
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(15);

	useEffect(() => {
		setPage(0);
	}, [search, statusFilter, batchFilter, urlBatchId]);

	const batchMap = useMemo(() => new Map(batches.map((b) => [b.id, b.name])), [batches]);
	const batchOptions = useMemo(() => batches.map((b) => ({ id: b.id, name: b.name })), [batches]);
	const lockedBatchName = urlBatchId ? batchMap.get(urlBatchId) ?? `#${urlBatchId}` : null;

	const [selectedOrderId, setSelectedOrderId] = useState<number | null>(
		Number(searchParams.get('orderId')) || null
	);
	const selectedOrder = useMemo(
		() => orders.find((o) => o.id === selectedOrderId) ?? null,
		[orders, selectedOrderId]
	);

	const closeDetail = () => {
		setSelectedOrderId(null);
		if (searchParams.has('orderId')) {
			searchParams.delete('orderId');
			setSearchParams(searchParams, { replace: true });
		}
	};

	const [printOrder, setPrintOrder] = useState<ServiceOrder | null>(null);
	const [autoShareWhatsApp, setAutoShareWhatsApp] = useState(false);

	const filteredOrders = useMemo(() => {
		return orders.filter((order) => {
			if (urlBatchId && order.batch_id !== urlBatchId) return false;
			if (!urlBatchId && batchFilter !== 'ALL' && order.batch_id !== batchFilter) return false;
			if (statusFilter !== 'ALL' && getServiceOrderPhase(order).phase !== statusFilter) return false;

			if (search.trim()) {
				const q = search.toLowerCase().trim();
				const codeMatch = order.code.toLowerCase().includes(q);
				const obsMatch = (order.observations || '').toLowerCase().includes(q);
				const batchName = (order.batch_name || batchMap.get(order.batch_id) || '').toLowerCase();
				const batchMatch = batchName.includes(q);
				if (!codeMatch && !obsMatch && !batchMatch) return false;
			}
			return true;
		});
	}, [orders, urlBatchId, batchFilter, statusFilter, search, batchMap]);

	const paginatedOrders = useMemo(() => {
		return filteredOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
	}, [filteredOrders, page, rowsPerPage]);


	return (
		<Box sx={{ width: '100%' }}>
			<ServicesHistoryKpis orders={orders} />

			{/* Canonical Paper Container matching /herd */}
			<Paper
				elevation={0}
				sx={{
					borderRadius: '8px',
					border: 1,
					borderColor: 'divider',
					overflow: 'hidden',
					bgcolor: 'background.paper'
				}}
			>
				{/* Dedicated Toolbar */}
				<ServiceOrdersToolbar
					search={search}
					onSearchChange={setSearch}
					status={statusFilter}
					onStatusChange={setStatusFilter}
					batchId={batchFilter}
					onBatchChange={setBatchFilter}
					batchOptions={batchOptions}
					batchFilterLockedName={lockedBatchName}
					onClearLockedBatch={() => {
						searchParams.delete('batchId');
						setSearchParams(searchParams, { replace: true });
					}}
					total={filteredOrders.length}
					title="Historial"
					phaseOptions={[...HISTORY_PHASES]}
				/>

				{/* Loading Skeleton / Clean Table */}
				{isLoading ? (
					<ServiceOrdersTableSkeleton rowCount={Math.min(rowsPerPage, 6)} />
				) : (
					<ServiceOrdersTable
						orders={paginatedOrders}
						batchMap={batchMap}
						onView={(order) => setSelectedOrderId(order.id)}
						onPrint={(order) => {
							setPrintOrder(order);
							setAutoShareWhatsApp(false);
						}}
						onShareWhatsApp={(order) => {
							setPrintOrder(order);
							setAutoShareWhatsApp(true);
						}}
						onApprove={() => undefined}
						onReject={() => undefined}
						onOpenInTray={() => undefined}
						isTransitioning={false}
					/>
				)}

				{/* Pagination footer bar */}
				<Box
					sx={{
						display: 'flex',
						flexDirection: { xs: 'column', sm: 'row' },
						justifyContent: 'space-between',
						alignItems: { xs: 'flex-start', sm: 'center' },
						pl: 2,
						pr: 1,
						py: 0.5,
						borderTop: 1,
						borderColor: 'divider'
					}}
				>
					<Typography
						variant="caption"
						sx={{ color: 'text.secondary', fontWeight: 500 }}
					>
						{filteredOrders.length === 1
							? '1 orden de servicio'
							: `${filteredOrders.length} órdenes de servicio`}
					</Typography>

					<TablePagination
						component="div"
						count={filteredOrders.length}
						page={filteredOrders.length > 0 && page * rowsPerPage < filteredOrders.length ? page : 0}
						rowsPerPage={rowsPerPage}
						rowsPerPageOptions={[10, 15, 25, 50]}
						onPageChange={(_, next) => setPage(next)}
						onRowsPerPageChange={(event) => setRowsPerPage(Number(event.target.value))}
						labelRowsPerPage="Por página"
						labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
						sx={{ border: 0 }}
					/>
				</Box>
			</Paper>

			{/* Service Order Detail Drawer */}
			<ServiceOrderDetailDrawer
				open={selectedOrder !== null}
				onClose={closeDetail}
				order={selectedOrder}
				caravans={caravans}
				batches={batches}
				onPrintSheet={(order) => {
					setPrintOrder(order);
					closeDetail();
				}}
			/>


			{/* Print Sheet & WhatsApp Dialog */}
			<ServiceOrderPrintSheetDialog
				open={printOrder !== null}
				onClose={() => {
					setPrintOrder(null);
					setAutoShareWhatsApp(false);
				}}
				order={printOrder}
				caravans={caravans}
				autoShare={autoShareWhatsApp}
			/>
		</Box>
	);
}
