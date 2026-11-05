import { Box, Button, Stack, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { Batch } from '@/core/batches/domain/entities/Batch';
import type { BatchOverview } from '@/core/batches/domain/entities/BatchOverview';
import HerdBatchCompositionTable from './HerdBatchCompositionTable';
import HerdBatchBullsOnService from './HerdBatchBullsOnService';
import { EMPTY_VALUE, formatPercent } from '../../../utils/herdFormat';

interface HerdBatchCompositionProps {
	batch: Batch;
	overview: BatchOverview | undefined;
	onTagCalves: () => void;
	onCastrate?: () => void;
}

// Neutral on purpose: colour on this page means a category, and sex is not one.
const FEMALE_COLOR = 'text.secondary';
const MALE_COLOR = 'action.disabled';

const actionSx = { alignSelf: 'flex-start', p: 0, minWidth: 0, fontWeight: 600, textTransform: 'none' } as const;

/** Who is in the batch: the sex split, each category with its head and its weight, and the bulls passing through. */
export function HerdBatchComposition({ batch, overview, onTagCalves, onCastrate }: HerdBatchCompositionProps) {
	const sex = overview?.sex_composition;
	const sexTotal = sex ? sex.M + sex.H : 0;
	const categories = overview?.category_composition ?? [];
	const pending = batch.pending_identification_count ?? 0;
	const untagged = batch.untagged_calf_count ?? 0;
	const nursing = batch.nursing_count ?? 0;
	const castrable = overview?.castration_candidate_count ?? 0;
	const range =
		batch.min_weight != null && batch.max_weight != null
			? `${batch.min_weight.toLocaleString('es-AR', { maximumFractionDigits: 1 })} – ${batch.max_weight.toLocaleString('es-AR', { maximumFractionDigits: 1 })} kg`
			: EMPTY_VALUE;
	const hasNotes = pending > 0 || untagged > 0 || nursing > 0 || castrable > 0;

	return (
		<Box component="section">
			<Stack
				spacing={1}
				sx={{ px: 3, pt: 0.5, pb: 1.5 }}
			>
				<Typography
					component="h2"
					sx={{ fontSize: '0.95rem', fontWeight: 600 }}
				>
					Composición
				</Typography>
				{sex && sexTotal > 0 && (
					<>
						<Box
							role="img"
							aria-label={`${sex.H} hembras, ${sex.M} machos`}
							sx={{ display: 'flex', gap: '2px', height: 6 }}
						>
							<Box sx={{ flex: sex.H, bgcolor: FEMALE_COLOR, borderRadius: '3px 0 0 3px' }} />
							<Box sx={{ flex: sex.M, bgcolor: MALE_COLOR, borderRadius: '0 3px 3px 0' }} />
						</Box>
						<Stack
							direction="row"
							justifyContent="space-between"
							spacing={1.5}
						>
							<SexLabel
								color={FEMALE_COLOR}
								label={`${sex.H} hembras · ${formatPercent(sex.H, sexTotal)}`}
							/>
							<SexLabel
								color={MALE_COLOR}
								label={`${sex.M} machos`}
							/>
						</Stack>
					</>
				)}
			</Stack>

			{categories.length === 0 ? (
				<Typography sx={{ px: 3, fontSize: '0.8rem', color: 'text.secondary' }}>
					Sin caravanas en el lote.
				</Typography>
			) : (
				<HerdBatchCompositionTable
					categories={categories}
					range={range}
				/>
			)}

			<HerdBatchBullsOnService bulls={overview?.bulls_on_service ?? []} />

			{hasNotes && (
				<Stack
					spacing={1}
					sx={{ px: 3, pt: 2 }}
				>
					{nursing > 0 && (
						<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
							{`${nursing} crías al pie · ${batch.nursing_weighed_count ?? 0} pesadas`}
						</Typography>
					)}
					{pending > 0 && (
						<Typography sx={{ fontSize: '0.75rem', color: 'warning.dark', fontWeight: 600 }}>
							{`${pending} cabezas por identificar`}
						</Typography>
					)}
					{untagged > 0 && (
						<Button
							variant="text"
							size="small"
							onClick={onTagCalves}
							startIcon={<FuseSvgIcon size={16}>heroicons-outline:tag</FuseSvgIcon>}
							sx={{ ...actionSx, color: 'warning.dark' }}
						>
							{`Caravanear crías (${untagged})`}
						</Button>
					)}
					{castrable > 0 && (
						<Button
							variant="text"
							size="small"
							onClick={onCastrate}
							startIcon={<FuseSvgIcon size={16}>heroicons-outline:scissors</FuseSvgIcon>}
							sx={{ ...actionSx, color: 'primary.main' }}
						>
							{`Castrar machos (${castrable})`}
						</Button>
					)}
				</Stack>
			)}
		</Box>
	);
}

function SexLabel({ color, label }: { color: string; label: string }) {
	return (
		<Stack
			direction="row"
			alignItems="center"
			spacing={0.75}
		>
			<Box sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: color }} />
			<Typography sx={{ fontSize: '0.75rem' }}>{label}</Typography>
		</Stack>
	);
}

export default HerdBatchComposition;
