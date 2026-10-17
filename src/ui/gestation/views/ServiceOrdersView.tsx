import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Box, Button, Paper, TablePagination, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import ViewLayout from 'src/components/ViewLayout';
import { useCompany } from '@/contexts/CompanyContext';
import { useBatches } from '@/features/batches/hooks/useBatches';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import {
	useServiceOrders,
	useApproveServiceOrder,
	type ServiceOrder
} from '@/features/gestation/hooks/useServiceOrders';
import { toast } from 'sonner';

import ServiceOrdersToolbar, {
	type ServiceOrderStatusFilter
} from '../components/service-orders/ServiceOrdersToolbar';
import ServiceOrdersTable from '../components/service-orders/ServiceOrdersTable';
import ServiceOrdersTableSkeleton from '../components/service-orders/ServiceOrdersTableSkeleton';
import ServiceOrdersRejectDialog from '../components/service-orders/ServiceOrdersRejectDialog';
import ServiceOrderDetailDrawer from '../components/service-order-drawer/ServiceOrderDetailDrawer';
import { getServiceOrderPhase } from '../utils/serviceOrderPhase';
import ServiceOrdersKpiStrip from '../components/service-orders/ServiceOrdersKpiStrip';
import { DIAGNOSIS_TRAY_PATH, diagnosisTrayPath } from '../components/tacto-start/tactoStart';
import ServiceOrderPrintSheetDialog from '../components/dialogs/ServiceOrderPrintSheetDialog';

export function ServiceOrdersView() {
	const navigate = useNavigate();
	const { activeCompanyId } = useCompany();

	// 1. Data queries
	const { data: orders = [], isLoading: isLoadingOrders } = useServiceOrders();
	const { data: dbBatches = [], isLoading: isLoadingBatches } = useBatches();
	const { data: caravans = [], isLoading: isLoadingCaravans } = useCaravans(activeCompanyId);

	// 2. Lifecycle mutations
	const approveMutation = useApproveServiceOrder();

	// 3. Search & Filter local state
	const [searchParams, setSearchParams] = useSearchParams();
	const urlBatchId = Number(searchParams.get('batchId')) || null;
	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState<ServiceOrderStatusFilter>('ALL');
	const [batchFilter, setBatchFilter] = useState<number | 'ALL'>('ALL');
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(15);

	// Reset page on filter change
	useEffect(() => {
		setPage(0);
	}, [search, statusFilter, batchFilter, urlBatchId]);

	// 4. Batch lookup mapping
	const batchMap = useMemo(() => new Map(dbBatches.map((b) => [b.id, b.name])), [dbBatches]);
	const batchOptions = useMemo(() => dbBatches.map((b) => ({ id: b.id, name: b.name })), [dbBatches]);
	const lockedBatchName = urlBatchId ? batchMap.get(urlBatchId) ?? `#${urlBatchId}` : null;

	// 5. Drawer & Dialog states
	const [selectedOrderId, setSelectedOrderId] = useState<number | null>(Number(searchParams.get('orderId')) || null);
	const selectedOrder = useMemo(() => orders.find((o) => o.id === selectedOrderId) ?? null, [orders, selectedOrderId]);

	const closeDetail = () => {
		setSelectedOrderId(null);
		if (searchParams.has('orderId')) {
			searchParams.delete('orderId');
			setSearchParams(searchParams, { replace: true });
		}
	};

	const [printOrder, setPrintOrder] = useState<ServiceOrder | null>(null);
	const [autoShareWhatsApp, setAutoShareWhatsApp] = useState(false);
	const [rejectTargetId, setRejectTargetId] = useState<number | null>(null);

	// 6. Filter calculation
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

	// 7. Handlers
	const handleApprove = async (id: number) => {
		try {
			await approveMutation.mutateAsync({ id, approve: true });
			toast.success('Orden aprobada con éxito');
		} catch (e: any) {
			toast.error(`Error al aprobar la orden: ${e.response?.data?.message || e.message}`);
		}
	};

	const handleRejectSubmit = async (reason: string) => {
		if (rejectTargetId === null) return;
		try {
			await approveMutation.mutateAsync({ id: rejectTargetId, approve: false, reason });
			toast.success('Orden rechazada exitosamente');
			setRejectTargetId(null);
		} catch (e: any) {
			toast.error(`Error al rechazar la orden: ${e.response?.data?.message || e.message}`);
		}
	};

	const isLoading = isLoadingOrders || isLoadingBatches || isLoadingCaravans;

	return (
		<ViewLayout
			title="Órdenes de servicio"
			subtitle="Registro de los servicios de cada lote de Cría: emití, aprobá y consultá cómo terminó cada orden. Las órdenes abiertas se trabajan en la bandeja de tacto."
			actions={
				<Button
					variant="contained"
					color="primary"
					startIcon={<FuseSvgIcon size={20}>heroicons-outline:plus-circle</FuseSvgIcon>}
					onClick={() => navigate('/gestation/bull-rotation?action=create')}
					sx={{
						bgcolor: 'primary.main',
						borderRadius: '6px',
						px: 3,
						fontWeight: 700,
						textTransform: 'none',
						color: '#fff'
					}}
				>
					Nueva Orden de Servicio
				</Button>
			}
		>
			<Box
				component="main"
				sx={{ width: '100%' }}
			>
				<ServiceOrdersKpiStrip
					orders={orders}
					onOpenTray={() => navigate(DIAGNOSIS_TRAY_PATH)}
				/>

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
							onApprove={handleApprove}
							onReject={(id) => setRejectTargetId(id)}
							onOpenInTray={(order) => navigate(diagnosisTrayPath(order.id))}
							isTransitioning={approveMutation.isPending}
						/>
					)}

					{/* Pagination footer bar matching HerdBatchRecentCaravans */}
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
			</Box>

			{/* Service Order Detail Drawer */}
			<ServiceOrderDetailDrawer
				open={selectedOrder !== null}
				onClose={closeDetail}
				order={selectedOrder}
				caravans={caravans}
				batches={dbBatches}
				onPrintSheet={(order) => {
					setPrintOrder(order);
					closeDetail();
				}}
			/>

			{/* Reject Dialog */}
			<ServiceOrdersRejectDialog
				open={rejectTargetId !== null}
				onClose={() => setRejectTargetId(null)}
				onSubmit={handleRejectSubmit}
				isSubmitting={approveMutation.isPending}
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
		</ViewLayout>
	);
}

export default ServiceOrdersView;
