import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import type { Caravan } from '@/core/caravans/domain/entities/Caravan';
import type { CaravanWeightRecord } from '@/core/weighing/domain/entities/Weighing';
import { useCaravanMovements } from '@/features/caravans/hooks/useCaravanMovements';
import { formatDate } from 'src/ui/herd/utils/herdFormat';
import { timeline, type TimelineEvent } from './caravanDrawerModel';

interface CaravanHistoryTabProps {
	caravan: Caravan;
	weights: CaravanWeightRecord[];
}

const dotColor = (tone: TimelineEvent['tone']) => (theme: Theme) =>
	({
		primary: theme.palette.primary.main,
		success: theme.palette.success.main,
		warning: theme.palette.warning.main,
		error: theme.palette.error.main,
		neutral: theme.palette.text.disabled
	})[tone];

/**
 * Movements, weighings and the current gestation of the caravan, newest first. Movements are
 * fetched only when this tab opens.
 */
export function CaravanHistoryTab({ caravan, weights }: CaravanHistoryTabProps) {
	const { data: movements = [], isLoading } = useCaravanMovements(caravan.id);

	if (isLoading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
				<CircularProgress size={28} />
			</Box>
		);
	}

	const events = timeline(caravan, movements, weights);

	if (events.length === 0) {
		return (
			<Typography
				variant="body2"
				sx={{ color: 'text.secondary', py: 4, textAlign: 'center' }}
			>
				Sin movimientos registrados.
			</Typography>
		);
	}

	return (
		<Box
			component="ol"
			aria-label="Historial de la caravana"
			sx={{ m: 0, p: 0, listStyle: 'none' }}
		>
			{events.map((event, index) => (
				<Box
					component="li"
					key={event.key}
					sx={{ display: 'grid', gridTemplateColumns: '28px 1fr', columnGap: 1.25 }}
				>
					<Box
						aria-hidden="true"
						sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
					>
						<Box
							sx={{
								width: 10,
								height: 10,
								mt: '5px',
								borderRadius: '50%',
								bgcolor: dotColor(event.tone)
							}}
						/>
						{index < events.length - 1 && <Box sx={{ flex: 1, width: 2, mt: 0.5, bgcolor: 'divider' }} />}
					</Box>
					<Stack
						spacing={0.25}
						sx={{ pb: 2.25, minWidth: 0 }}
					>
						<Stack
							direction="row"
							justifyContent="space-between"
							spacing={1}
						>
							<Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{event.title}</Typography>
							<Typography
								variant="caption"
								sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}
							>
								{formatDate(event.date)}
							</Typography>
						</Stack>
						{event.detail && (
							<Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{event.detail}</Typography>
						)}
					</Stack>
				</Box>
			))}
		</Box>
	);
}

export default CaravanHistoryTab;
