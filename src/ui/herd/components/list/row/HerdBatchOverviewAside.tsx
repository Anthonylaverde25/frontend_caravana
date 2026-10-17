import { Box, Skeleton, Stack, Typography } from '@mui/material';
import type { Batch } from '@/core/batches/domain/entities/Batch';
import { useBatchOverview } from '@/features/batches/hooks/useBatchOverview';
import { useCaravansSummary } from '@/features/caravans/hooks/useCaravansSummary';
import BatchHeadCount from 'src/ui/batches/components/BatchHeadCount';
import { formatDate, formatKg, RECENT_COUNT } from '../../../utils/herdFormat';
import NotApplicable from '../../shared/NotApplicable';

interface HerdBatchOverviewAsideProps {
	batch: Batch;
}

const MALE_COLOR = '#93B4E6';

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<>
			<Typography
				component="dt"
				sx={{ fontSize: '0.8rem', color: 'text.secondary' }}
			>
				{label}
			</Typography>
			<Typography
				component="dd"
				sx={{ m: 0, fontSize: '0.8rem', fontWeight: 600, textAlign: 'right' }}
			>
				{children}
			</Typography>
		</>
	);
}

/**
 * What the expanded batch adds to its header: sex composition, last weighing and last arrival.
 * Mounted only while expanded, so a closed batch costs no overview request.
 */
export function HerdBatchOverviewAside({ batch }: HerdBatchOverviewAsideProps) {
	const { data: overview, isLoading } = useBatchOverview(batch.id);
	// Same query as the recent caravans table next to it: served from its cache.
	const { data: recent } = useCaravansSummary({ batchId: batch.id, sort: 'recent', perPage: RECENT_COUNT });

	const females = overview?.sex_composition.H ?? 0;
	const males = overview?.sex_composition.M ?? 0;
	const total = females + males;
	const femalePct = total > 0 ? (females / total) * 100 : 0;
	const lastArrival = recent?.data[0]?.batch_assigned_at ?? null;

	return (
		<Stack
			spacing={2}
			// Full border values per breakpoint: a responsive shorthand alone resets the color to currentColor.
			sx={(theme) => ({
				p: 2.5,
				bgcolor: 'background.default',
				borderBottom: `1px solid ${theme.palette.divider}`,
				[theme.breakpoints.up('md')]: {
					borderBottom: 'none',
					borderRight: `1px solid ${theme.palette.divider}`
				}
			})}
		>
			<Stack spacing={1}>
				<Typography
					variant="caption"
					sx={{ color: 'text.secondary' }}
				>
					Composición
				</Typography>
				{isLoading ? (
					<Skeleton
						variant="rounded"
						height={8}
					/>
				) : (
					<Box
						role="img"
						aria-label={`${females} hembras, ${males} machos`}
						sx={{ display: 'flex', height: 8, borderRadius: '4px', overflow: 'hidden', bgcolor: 'divider' }}
					>
						<Box sx={{ width: `${femalePct}%`, bgcolor: 'primary.main' }} />
						<Box sx={{ width: `${total > 0 ? 100 - femalePct : 0}%`, bgcolor: MALE_COLOR }} />
					</Box>
				)}
				<Stack
					direction="row"
					justifyContent="space-between"
					sx={{ fontSize: '0.8rem' }}
				>
					<Stack
						direction="row"
						spacing={0.75}
						alignItems="center"
					>
						<Box
							aria-hidden="true"
							sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: 'primary.main' }}
						/>
						<span>{`${females.toLocaleString('es-AR')} hembras`}</span>
					</Stack>
					<Stack
						direction="row"
						spacing={0.75}
						alignItems="center"
					>
						<Box
							aria-hidden="true"
							sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: MALE_COLOR }}
						/>
						<span>{`${males.toLocaleString('es-AR')} machos`}</span>
					</Stack>
				</Stack>
			</Stack>

			<Box
				component="dl"
				sx={{
					m: 0,
					pt: 1.75,
					display: 'grid',
					gridTemplateColumns: '1fr auto',
					rowGap: 1.25,
					columnGap: 2,
					borderTop: 1,
					borderColor: 'divider'
				}}
			>
				<Fact label="Cabezas">
					<BatchHeadCount batch={batch} />
				</Fact>
				<Fact label="Peso promedio">{formatKg(batch.current_weight)}</Fact>
				<Fact label="Último pesaje">{formatDate(overview?.last_weighing_date)}</Fact>
				<Fact label="Último ingreso">{lastArrival ? formatDate(lastArrival) : <NotApplicable />}</Fact>
			</Box>
		</Stack>
	);
}

export default HerdBatchOverviewAside;
