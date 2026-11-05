import { Box, Typography } from '@mui/material';
import type { Batch } from '@/core/batches/domain/entities/Batch';
import {
	EMPTY_VALUE,
	formatDate,
	formatKg,
	formatPercent,
	hasMixedWeights,
	headBreakdownHint
} from '../../../utils/herdFormat';

interface HerdBatchKpiRowProps {
	batch: Batch;
	lastWeighingDate: string | null | undefined;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function daysAgo(date: string | null | undefined): string {
	if (!date) return 'Sin pesajes';

	const days = Math.floor((Date.now() - new Date(date).getTime()) / DAY_MS);

	return days <= 0 ? 'hoy' : `hace ${days} ${days === 1 ? 'día' : 'días'}`;
}

/**
 * The figures a batch is read by, in a row split by hairlines. A mixed batch has no average: it
 * describes no animal, so each category shows its own in the composition. Bulls on service count
 * as head and nowhere else: every weight below describes the herd.
 */
export function HerdBatchKpiRow({ batch, lastWeighingDate }: HerdBatchKpiRowProps) {
	const caravans = batch.caravans_count ?? 0;
	const herdCaravans = batch.herd_caravans_count;
	const weighed = batch.weighed_count ?? 0;

	const figures = [
		{
			label: 'Cabezas',
			value: String(batch.head_count ?? 0),
			hint: batch.bulls_on_service_count > 0 ? headBreakdownHint(batch) : `${caravans} caravanas`
		},
		...(hasMixedWeights(batch)
			? []
			: [
					{
						label: 'Peso promedio',
						value: formatKg(weighed > 0 ? batch.current_weight : null),
						hint: 'por cabeza pesada'
					}
				]),
		{
			label: 'Kilos totales',
			value: formatKg(weighed > 0 ? batch.total_weight : null, 0),
			hint: `sobre ${weighed} ${weighed === 1 ? 'cabeza pesada' : 'cabezas pesadas'}`
		},
		{
			label: 'Pesadas',
			value: formatPercent(weighed, herdCaravans),
			hint: herdCaravans > 0 ? `${weighed} de ${herdCaravans}` : EMPTY_VALUE
		},
		{ label: 'Último pesaje', value: formatDate(lastWeighingDate), hint: daysAgo(lastWeighingDate) }
	];

	return (
		<Box sx={{ px: { xs: 2.5, md: 3.5 }, py: 3 }}>
			{/* The clip hides the rule of whichever figure starts a line. */}
			<Box sx={{ overflow: 'hidden' }}>
				<Box
					component="dl"
					sx={{
						m: 0,
						ml: '-25px',
						display: 'grid',
						gridTemplateColumns: 'repeat(auto-fit, minmax(min(170px, 100%), 1fr))',
						rowGap: 2.5
					}}
				>
					{figures.map((figure) => (
						<Box
							key={figure.label}
							sx={{ pl: 3, borderLeft: 1, borderColor: 'divider', minWidth: 0 }}
						>
							<Typography
								component="dt"
								sx={{ fontSize: '0.75rem', color: 'text.secondary' }}
							>
								{figure.label}
							</Typography>
							<Typography
								component="dd"
								sx={{
									m: 0,
									mt: 0.25,
									fontSize: '1.75rem',
									lineHeight: 1.2,
									fontWeight: 600,
									letterSpacing: '-0.02em'
								}}
							>
								{figure.value}
							</Typography>
							<Typography
								component="dd"
								sx={{ m: 0, mt: 0.25, fontSize: '0.75rem', color: 'text.secondary' }}
							>
								{figure.hint}
							</Typography>
						</Box>
					))}
				</Box>
			</Box>
		</Box>
	);
}

export default HerdBatchKpiRow;
