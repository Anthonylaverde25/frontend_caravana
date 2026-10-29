import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { Alert, Box, Button, CircularProgress, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import ViewLayout from '@/components/ViewLayout';
import { useExitOrders } from '@/features/exit-orders/hooks/useExitOrders';
import type { ExitOrderSummary } from '@/features/exit-orders/types';
import ExitOrdersStatusFilter, { ExitOrderFilterValue } from '../components/ExitOrdersStatusFilter';
import ExitOrdersTable from '../components/ExitOrdersTable';
import ExitOrderDetailDrawer from '../components/ExitOrderDetailDrawer';
import ExitLoadDialog from '../components/load/ExitLoadDialog';
import type { ExitLoadMode } from '../components/load/exitRows';

const isOpen = (order: ExitOrderSummary): boolean => order.status === 'ISSUED' || order.status === 'PARTIAL';

const matches = (order: ExitOrderSummary, filter: ExitOrderFilterValue): boolean =>
	filter === 'ALL'
		? true
		: filter === 'OPEN'
			? isOpen(order)
			: filter === 'WITHOUT_DTE'
				? order.without_dte
				: order.status === filter;

const normalize = (value: string): string => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

interface ExitOrdersViewProps {
	/** A load route: the full-screen sheet opens over the tray. */
	starting?: ExitLoadMode;
}

/**
 * Every exit order of the company, in every state. The whole list is fetched once so the pills
 * can count; `?orderId=` opens an order in the drawer. The loads (`/new`, `/register`, `/:id/edit`,
 * `/:id/execute`) open over it in a full-screen dialog, like "Nueva orden de destete".
 */
export const ExitOrdersView: React.FC<ExitOrdersViewProps> = ({ starting }) => {
	const navigate = useNavigate();
	const { id: loadOrderId } = useParams();
	const [isStarting, setIsStarting] = useState(Boolean(starting));

	useEffect(() => setIsStarting(Boolean(starting)), [starting]);
	const [searchParams, setSearchParams] = useSearchParams();
	const { data: orders = [], isLoading, isError } = useExitOrders();
	const [filter, setFilter] = useState<ExitOrderFilterValue>('ALL');
	const [search, setSearch] = useState('');

	const openedId = Number(searchParams.get('orderId')) || null;

	const setOpened = (id: number | null) => {
		const next = new URLSearchParams(searchParams);

		if (id == null) next.delete('orderId');
		else next.set('orderId', String(id));

		setSearchParams(next, { replace: true });
	};

	const counts = useMemo(() => {
		const result = {
			ALL: orders.length,
			OPEN: 0,
			ISSUED: 0,
			PARTIAL: 0,
			EXECUTED: 0,
			CLOSED_INCOMPLETE: 0,
			CANCELLED: 0,
			WITHOUT_DTE: 0
		} as Record<ExitOrderFilterValue, number>;

		orders.forEach((order) => {
			result[order.status] += 1;

			if (isOpen(order)) result.OPEN += 1;

			if (order.without_dte) result.WITHOUT_DTE += 1;
		});

		return result;
	}, [orders]);

	const visible = useMemo(() => {
		const term = normalize(search.trim());

		return orders.filter(
			(order) =>
				matches(order, filter) &&
				(term === '' ||
					[order.code, order.buyer?.name ?? '', order.buyer?.cuit ?? ''].some((text) =>
						normalize(text).includes(term)
					))
		);
	}, [orders, filter, search]);

	return (
		<ViewLayout
			title="Órdenes de Egreso"
			subtitle="Ventas de hacienda: órdenes emitidas a la espera de la carga y egresos registrados después de la salida."
			actions={
				<Stack
					direction="row"
					spacing={1}
				>
					<Button
						variant="outlined"
						onClick={() => navigate('/exit-orders/register')}
						startIcon={<FuseSvgIcon size={18}>heroicons-outline:clipboard-document-check</FuseSvgIcon>}
						sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px', px: 2 }}
					>
						Registrar egreso
					</Button>
					<Button
						variant="contained"
						disableElevation
						onClick={() => navigate('/exit-orders/new')}
						startIcon={<FuseSvgIcon size={18}>heroicons-outline:plus</FuseSvgIcon>}
						sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px', px: 2.5 }}
					>
						Nueva orden
					</Button>
				</Stack>
			}
		>
			<Stack spacing={2}>
				<Stack
					direction={{ xs: 'column', md: 'row' }}
					spacing={1.5}
					alignItems={{ xs: 'stretch', md: 'center' }}
					justifyContent="space-between"
				>
					<TextField
						size="small"
						placeholder="Buscar por código o comprador…"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						sx={{ minWidth: { md: 320 } }}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<FuseSvgIcon
										size={18}
										color="action"
									>
										heroicons-outline:magnifying-glass
									</FuseSvgIcon>
								</InputAdornment>
							)
						}}
					/>
					<ExitOrdersStatusFilter
						value={filter}
						onChange={setFilter}
						counts={counts}
					/>
				</Stack>

				{isLoading ? (
					<Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
						<CircularProgress size={28} />
					</Box>
				) : isError ? (
					<Alert
						severity="error"
						sx={{ borderRadius: '6px' }}
					>
						No se pudieron cargar las órdenes de egreso.
					</Alert>
				) : visible.length === 0 ? (
					<Box sx={{ py: 8, textAlign: 'center' }}>
						<FuseSvgIcon
							size={36}
							color="disabled"
						>
							heroicons-outline:arrow-up-tray
						</FuseSvgIcon>
						<Typography
							variant="body1"
							sx={{ fontWeight: 700, mt: 1 }}
						>
							{orders.length === 0 ? 'Todavía no hay egresos' : 'Ninguna orden coincide con el filtro'}
						</Typography>
						<Typography
							variant="body2"
							color="text.secondary"
						>
							{orders.length === 0
								? 'Emití una orden para una carga que viene, registrá una venta que ya salió o usá "Vender" desde la hacienda.'
								: 'Probá con otro estado o con otra búsqueda.'}
						</Typography>
					</Box>
				) : (
					<ExitOrdersTable
						orders={visible}
						onOpen={(order) => setOpened(order.id)}
					/>
				)}
			</Stack>

			{starting && (
				<ExitLoadDialog
					open={isStarting}
					mode={starting}
					onClose={() => setIsStarting(false)}
					// Leaving by the cross goes back where it came from; a saved load already navigated.
					onExited={() => navigate(loadOrderId ? `/exit-orders?orderId=${loadOrderId}` : '/exit-orders')}
				/>
			)}
			<ExitOrderDetailDrawer
				orderId={openedId}
				onClose={() => setOpened(null)}
			/>
		</ViewLayout>
	);
};

export default ExitOrdersView;
