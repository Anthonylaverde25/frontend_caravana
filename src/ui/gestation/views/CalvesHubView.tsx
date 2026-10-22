import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { Box, Button, Chip, CircularProgress, Stack, Tab, Tabs } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import ViewLayout from 'src/components/ViewLayout';
import { useBirthHistory } from '@/features/gestation/hooks/useBirthHistory';
import { useWeaningOrders } from '@/features/weaning-orders/hooks/useWeaningOrders';
import { useWeaningOrder } from '@/features/weaning-orders/hooks/useWeaningOrder';
import WeaningOrdersPanel from '@/ui/weaning-orders/components/WeaningOrdersPanel';
import DeviationsPanel from '@/ui/weaning-orders/components/deviations/DeviationsPanel';
import { groupDeviations } from '@/ui/weaning-orders/components/deviations/deviationRows';
import { useWeaningDeviations } from '@/features/weaning-orders/hooks/useWeaningDeviations';
import WeaningOrderDetailDrawer from '@/ui/weaning-orders/components/WeaningOrderDetailDrawer';
import WeaningOrderStartDialog from '@/ui/weaning-orders/components/start/WeaningOrderStartDialog';
import { startFromOrder, type WeaningFormMode, type WeaningOrderStart } from '@/ui/weaning-orders/hooks/useWeaningOrderForm';
import BirthsKpiStrip from '../components/births/BirthsKpiStrip';
import AtFootPanel from '../components/births/AtFootPanel';
import { batchKeyOf } from '../components/births/useAtFootGroups';

export type CalvesHubTab = 'at-foot' | 'orders' | 'deviations';

const TAB_PATHS: Record<CalvesHubTab, string> = {
	'at-foot': '/gestation/births',
	orders: '/gestation/births?tab=orders',
	deviations: '/gestation/births?tab=deviations'
};

const TAB_TITLES: Record<CalvesHubTab, string | null> = { 'at-foot': null, orders: 'Órdenes de destete', deviations: 'Desvíos' };

interface CalvesHubViewProps {
	tab: CalvesHubTab;
	/** `/weaning-orders/new` and `/register`: the full-screen dialog that starts one, over the hub. */
	starting?: WeaningFormMode;
}


/**
 * "Crías al pie y destete": the calves still nursing and the weaning orders, in one place. The
 * calves are worked in the first tab — free ones start an order or a registered weaning, the ones an
 * open order holds are weaned with it, some or all, in the same full-screen registration that starts
 * from what the order planned; the second tab is the register of every order, and the third what
 * the weanings did differently from their orders, to review (`?tab=deviations`, `&orderCode=` one).
 * `?tab=orders` opens the second tab (`/weaning-orders` lands there); `?orderId=` opens an order's
 * drawer on either tab.
 */
export default function CalvesHubView({ tab: tabProp, starting }: CalvesHubViewProps) {
	const navigate = useNavigate();
	const location = useLocation();
	const [searchParams, setSearchParams] = useSearchParams();
	const { data: births = [], isLoading } = useBirthHistory();
	const { data: orders = [] } = useWeaningOrders();
	const [batchKey, setBatchKey] = useState<string | 'all'>('all');
	const [isStarting, setIsStarting] = useState(Boolean(starting));
	// "Registrar destetadas" / "Ejecutar orden": the order is read, then its registration opens.
	const [weaning, setWeaning] = useState<{ orderId: number; calfIds: number[] | null } | null>(null);
	const { data: weaningOrder } = useWeaningOrder(weaning?.orderId ?? null);

	useEffect(() => {
		if (starting) setIsStarting(true);
	}, [starting]);

	const tabParam = searchParams.get('tab');
	const routeTab: CalvesHubTab = tabParam === 'orders' || tabParam === 'deviations' ? tabParam : tabProp;
	const orderCode = searchParams.get('orderCode');
	const { data: deviations = [] } = useWeaningDeviations();
	const pendingDeviations = useMemo(() => groupDeviations(deviations).flatMap((g) => g.rows).filter((r) => !r.reviewed).length, [deviations]);
	const startState = location.state as WeaningOrderStart | null;
	// Under a start dialog, the tab it was opened from.
	const tab: CalvesHubTab = starting && startState?.returnTo === TAB_PATHS['at-foot'] ? 'at-foot' : routeTab;

	const atFoot = useMemo(() => births.filter((record) => record.is_nursing), [births]);
	// The KPIs follow the batch filter, not the search
	const inBatch = useMemo(() => (batchKey === 'all' ? atFoot : atFoot.filter((r) => batchKeyOf(r) === batchKey)), [atFoot, batchKey]);
	const openOrders = orders.filter((order) => order.is_open).length;

	const openedId = Number(searchParams.get('orderId')) || null;

	const setOpened = (id: number | null) => {
		const next = new URLSearchParams(searchParams);

		if (id == null) next.delete('orderId');
		else next.set('orderId', String(id));

		setSearchParams(next, { replace: true });
	};

	useEffect(() => {
		if (!weaning || weaningOrder?.id !== weaning.orderId) return;

		const pending = weaningOrder.animals.filter((a) => a.status === 'PENDING').map((a) => a.caravan_id);
		setWeaning(null);
		navigate('/weaning-orders/register', { state: startFromOrder(weaningOrder, weaning.calfIds ?? pending, TAB_PATHS[tab]) });
	}, [weaning, weaningOrder]);

	const start = (target: WeaningFormMode | 'new', calfIds: number[] = []) =>
		navigate(`/weaning-orders/${target === 'order' ? 'new' : target}`, { state: { calfIds, returnTo: TAB_PATHS[tab] } });

	return (
		<ViewLayout
			breadcrumbs={[
				{ title: 'Seguimiento', url: '/gestation' },
				{ title: 'Crías al pie y destete', url: TAB_PATHS['at-foot'] },
				...(TAB_TITLES[tab] ? [{ title: TAB_TITLES[tab] as string, url: TAB_PATHS[tab] }] : [])
			]}
			title="Crías al pie y destete"
			subtitle="Todo lo que sigue lactando y las órdenes que ya lo tienen tomado. Desde acá se ordena el destete o se registra el que ya pasó."
			actions={
				<Stack direction="row" spacing={1}>
					<Button
						variant="outlined"
						onClick={() => start('register')}
						startIcon={<FuseSvgIcon size={18}>heroicons-outline:clipboard-document-check</FuseSvgIcon>}
						sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px', px: 2 }}
					>
						Registrar destete
					</Button>
					<Button
						variant="contained"
						disableElevation
						onClick={() => start('new')}
						startIcon={<FuseSvgIcon size={18}>heroicons-outline:plus</FuseSvgIcon>}
						sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px', px: 2.5 }}
					>
						Nueva orden de destete
					</Button>
				</Stack>
			}
		>
			<Stack spacing={2.5}>
				<Tabs
					value={tab}
					onChange={(_, next: CalvesHubTab) => navigate(TAB_PATHS[next])}
					sx={{ borderBottom: 1, borderColor: 'divider', minHeight: 44, '& .MuiTab-root': { minHeight: 44, textTransform: 'none', fontWeight: 700 } }}
				>
					<Tab
						value="at-foot"
						iconPosition="end"
						icon={<Chip size="small" label={atFoot.length} sx={{ height: 20, fontWeight: 700 }} />}
						label="Crías al pie"
					/>
					<Tab
						value="orders"
						iconPosition="end"
						icon={<Chip size="small" label={`${openOrders} abiertas`} sx={{ height: 20, fontWeight: 700 }} />}
						label="Órdenes de destete"
					/>
					<Tab
						value="deviations"
						iconPosition="end"
						icon={
							<Chip
								size="small"
								color={pendingDeviations > 0 ? 'warning' : 'default'}
								label={pendingDeviations > 0 ? `${pendingDeviations} sin revisar` : 'al día'}
								sx={{ height: 20, fontWeight: 700 }}
							/>
						}
						label="Desvíos"
					/>
				</Tabs>

				{isLoading ? (
					<Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
						<CircularProgress size={32} />
					</Box>
				) : (
					<>
						{tab !== 'deviations' && <BirthsKpiStrip records={tab === 'at-foot' ? inBatch : atFoot} />}

						{tab === 'deviations' ? (
							<DeviationsPanel
								orderCode={orderCode}
								onClearOrder={() => {
									const next = new URLSearchParams(searchParams);
									next.delete('orderCode');
									setSearchParams(next, { replace: true });
								}}
								onOpenOrder={setOpened}
							/>
						) : tab === 'at-foot' ? (
							<AtFootPanel
								atFoot={atFoot}
								orders={orders}
								batchKey={batchKey}
								onBatchChange={setBatchKey}
								onWean={(target, calfIds) => start(target === 'new' ? 'new' : 'register', calfIds)}
								onOpenOrder={setOpened}
								onRegisterWeaned={(orderId, calfIds) => setWeaning({ orderId, calfIds })}
								onExecute={(orderId) => setWeaning({ orderId, calfIds: null })}
							/>
						) : (
							<WeaningOrdersPanel onOpen={(order) => setOpened(order.id)} />
						)}
					</>
				)}
			</Stack>

			<WeaningOrderDetailDrawer orderId={openedId} onClose={() => setOpened(null)} />
			<WeaningOrderStartDialog
				open={Boolean(starting) && isStarting}
				mode={starting ?? 'order'}
				initial={startState}
				onClose={() => setIsStarting(false)}
				onExited={() => navigate(startState?.returnTo ?? TAB_PATHS[tab])}
			/>
		</ViewLayout>
	);
}
