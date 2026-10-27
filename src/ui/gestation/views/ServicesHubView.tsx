import { useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import ViewLayout from 'src/components/ViewLayout';
import { useCompany } from '@/contexts/CompanyContext';
import { useServiceOrders } from '@/features/gestation/hooks/useServiceOrders';
import { useBatches } from '@/features/batches/hooks/useBatches';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import { isQueueOrder } from '../utils/servicesQueue';
import ServicesHubSubheader, { type ServicesHubTabKey } from '../components/services-hub/ServicesHubSubheader';
import ServicesHubQueueTab from '../components/services-hub/ServicesHubQueueTab';
import ServicesHubHistoryTab from '../components/services-hub/ServicesHubHistoryTab';

/** Earlier tab names of this view: gracefully map to the new layout. */
const LEGACY_TABS: Record<string, ServicesHubTabKey> = { tacto: 'conventional', orders: 'history', active: 'conventional' };

/**
 * Reproductive services: conventional natural mount, artificial insemination, and history.
 * Each open order shows its next step; once closed it moves by itself to "Historial" with its result.
 */
export default function ServicesHubView() {
	const navigate = useNavigate();
	const { tab: urlTab } = useParams<{ tab?: string }>();
	const [searchParams] = useSearchParams();
	const { activeCompanyId } = useCompany();

	// Shared TanStack Query data
	const { data: orders = [], isLoading: isLoadingOrders } = useServiceOrders();
	const { data: batches = [], isLoading: isLoadingBatches } = useBatches();
	const { data: caravans = [], isLoading: isLoadingCaravans } = useCaravans(activeCompanyId);

	const activeTab: ServicesHubTabKey = useMemo(() => {
		const requested = urlTab ?? searchParams.get('tab') ?? 'conventional';
		if (requested === 'conventional' || requested === 'insemination' || requested === 'history') return requested;
		return LEGACY_TABS[requested] ?? 'conventional';
	}, [urlTab, searchParams]);

	const handleTabChange = (nextTab: ServicesHubTabKey) => {
		// Preserve query params (e.g. batchId, orderId) when switching tabs
		const query = searchParams.toString();
		navigate(`/gestation/services/${nextTab}${query ? `?${query}` : ''}`);
	};

	const conventionalOrders = useMemo(() => orders.filter((o) => o.service_method !== 'AI'), [orders]);
	const inseminationOrders = useMemo(() => orders.filter((o) => o.service_method === 'AI'), [orders]);

	const conventionalCount = useMemo(() => conventionalOrders.filter(isQueueOrder).length, [conventionalOrders]);
	const inseminationCount = useMemo(() => inseminationOrders.filter(isQueueOrder).length, [inseminationOrders]);
	const historyCount = useMemo(() => orders.filter((o) => !isQueueOrder(o)).length, [orders]);

	const subtitle = useMemo(() => {
		if (activeTab === 'conventional') {
			return 'Órdenes de monta natural con toros. Cada orden abierta muestra su próximo paso.';
		}
		if (activeTab === 'insemination') {
			return 'Órdenes de inseminación artificial (IATF y repaso). Seguimiento de dosis, celo y preñez.';
		}
		return 'Órdenes cerradas o rechazadas, con el resultado del tacto final.';
	}, [activeTab]);

	const isLoading = isLoadingOrders || isLoadingBatches || isLoadingCaravans;

	if (isLoading) {
		return (
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					height: '100vh',
					gap: 2
				}}
			>
				<CircularProgress />
				<Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
					Cargando servicios y diagnósticos...
				</Typography>
			</Box>
		);
	}

	return (
		<ViewLayout
			title="Servicios"
			subtitle={subtitle}
			subHeader={
				<ServicesHubSubheader
					activeTab={activeTab}
					onTabChange={handleTabChange}
					conventionalCount={conventionalCount}
					inseminationCount={inseminationCount}
					historyCount={historyCount}
				/>
			}
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
			{activeTab === 'conventional' ? (
				<ServicesHubQueueTab
					orders={conventionalOrders}
					batches={batches}
					caravans={caravans}
					onSwitchToHistory={() => handleTabChange('history')}
					serviceType="conventional"
				/>
			) : activeTab === 'insemination' ? (
				<ServicesHubQueueTab
					orders={inseminationOrders}
					batches={batches}
					caravans={caravans}
					onSwitchToHistory={() => handleTabChange('history')}
					serviceType="insemination"
				/>
			) : (
				<ServicesHubHistoryTab
					orders={orders}
					batches={batches}
					caravans={caravans}
					isLoading={isLoadingOrders}
				/>
			)}
		</ViewLayout>
	);
}
