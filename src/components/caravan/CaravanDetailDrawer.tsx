import { useEffect, useState } from 'react';
import { Box, CircularProgress, Drawer, Typography } from '@mui/material';
import { useCaravanDetail } from '@/features/caravans/hooks/useCaravanDetail';
import { useCaravanWeights } from '@/features/caravans/hooks/useCaravanWeights';
import CaravanDrawerHeader, {
	type CaravanDrawerActions,
	type CaravanDrawerTab
} from './detail-drawer/CaravanDrawerHeader';
import CaravanSummaryTab from './detail-drawer/CaravanSummaryTab';
import CaravanWeightsTab from './detail-drawer/CaravanWeightsTab';
import CaravanHistoryTab from './detail-drawer/CaravanHistoryTab';

type CaravanDetailDrawerProps = CaravanDrawerActions & {
	open: boolean;
	onClose: () => void;
	caravanId?: number | null;
	caravanIdentification?: string | null;
};

/**
 * Detail of one caravan in tabs: summary, weights and history. The actions (weigh, move, edit) show
 * only where the host passes them.
 */
export function CaravanDetailDrawer({
	open,
	onClose,
	caravanId,
	caravanIdentification,
	onWeigh,
	onMove,
	onEdit
}: CaravanDetailDrawerProps) {
	const [tab, setTab] = useState<CaravanDrawerTab>('summary');
	const { data: caravan, isLoading } = useCaravanDetail(open ? caravanId : null);
	// Light and shared by every tab: the summary needs it for the daily gain.
	const { data: weights = [] } = useCaravanWeights(open && caravanId ? caravanId : undefined);

	useEffect(() => {
		setTab('summary');
	}, [caravanId]);

	const displayId = caravan?.identification || caravanIdentification || (caravanId ? `${caravanId}` : '—');

	return (
		<Drawer
			anchor="right"
			open={open}
			onClose={onClose}
			PaperProps={{
				sx: {
					width: { xs: '100%', sm: 480 },
					borderRadius: 0,
					border: 'none',
					boxShadow: (theme) => theme.shadows[10],
					bgcolor: 'background.paper'
				}
			}}
		>
			<Box
				role="dialog"
				aria-label={`Ficha de la caravana ${displayId}`}
				sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
			>
				<CaravanDrawerHeader
					displayId={displayId}
					caravan={caravan}
					tab={tab}
					onTabChange={setTab}
					onClose={onClose}
					onWeigh={onWeigh}
					onMove={onMove}
					onEdit={onEdit}
				/>

				<Box sx={{ p: 2.5, flexGrow: 1, overflowY: 'auto' }}>
					{isLoading ? (
						<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10, gap: 2 }}>
							<CircularProgress size={36} />
							<Typography
								variant="body2"
								color="text.secondary"
							>
								Cargando la ficha de la caravana...
							</Typography>
						</Box>
					) : !caravan ? (
						<Typography
							variant="body2"
							color="text.secondary"
							sx={{ py: 6, textAlign: 'center' }}
						>
							No se encontró información para esta caravana.
						</Typography>
					) : tab === 'summary' ? (
						<CaravanSummaryTab
							caravan={caravan}
							weights={weights}
						/>
					) : tab === 'weights' ? (
						<CaravanWeightsTab
							identification={caravan.identification}
							weights={weights}
						/>
					) : (
						<CaravanHistoryTab
							caravan={caravan}
							weights={weights}
						/>
					)}
				</Box>
			</Box>
		</Drawer>
	);
}

export default CaravanDetailDrawer;
