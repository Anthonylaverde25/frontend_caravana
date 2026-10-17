import { Box, Stack, Typography } from '@mui/material';
import { formatDate, formatKg } from '@/ui/herd/utils/herdFormat';
import NotApplicable from '@/ui/herd/components/shared/NotApplicable';
import type { GestationBatchStats } from '../gestationListUtils';

interface GestationBatchOverviewAsideProps {
	stats: GestationBatchStats;
}

const HEAD_COLOR = '#10b981';
const BODY_COLOR = '#f59e0b';
const TAIL_COLOR = '#ef4444';

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
 * Left aside panel inside an expanded gestational batch row: stage distribution bar
 * (Cabeza / Cuerpo / Cola) and key calving facts. Mirrors HerdBatchOverviewAside.
 */
export function GestationBatchOverviewAside({ stats }: GestationBatchOverviewAsideProps) {
	const total = stats.total || 1;
	const headPct = (stats.headCount / total) * 100;
	const bodyPct = (stats.bodyCount / total) * 100;
	const tailPct = (stats.tailCount / total) * 100;

	return (
		<Stack
			spacing={2}
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
					Distribución por estadio
				</Typography>
				<Box
					role="img"
					aria-label={`${stats.headCount} cabeza, ${stats.bodyCount} cuerpo, ${stats.tailCount} cola`}
					sx={{ display: 'flex', height: 8, borderRadius: '4px', overflow: 'hidden', bgcolor: 'divider' }}
				>
					<Box sx={{ width: `${headPct}%`, bgcolor: HEAD_COLOR }} />
					<Box sx={{ width: `${bodyPct}%`, bgcolor: BODY_COLOR }} />
					<Box sx={{ width: `${tailPct}%`, bgcolor: TAIL_COLOR }} />
				</Box>
				<Stack
					direction="row"
					justifyContent="space-between"
					flexWrap="wrap"
					useFlexGap
					spacing={1}
					sx={{ fontSize: '0.76rem' }}
				>
					<Stack
						direction="row"
						spacing={0.5}
						alignItems="center"
					>
						<Box
							aria-hidden="true"
							sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: HEAD_COLOR }}
						/>
						<span>{`${stats.headCount} cab.`}</span>
					</Stack>
					<Stack
						direction="row"
						spacing={0.5}
						alignItems="center"
					>
						<Box
							aria-hidden="true"
							sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: BODY_COLOR }}
						/>
						<span>{`${stats.bodyCount} cpo.`}</span>
					</Stack>
					<Stack
						direction="row"
						spacing={0.5}
						alignItems="center"
					>
						<Box
							aria-hidden="true"
							sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: TAIL_COLOR }}
						/>
						<span>{`${stats.tailCount} cola`}</span>
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
				<Fact label="Vientres gestantes">{`${stats.total.toLocaleString('es-AR')} cab.`}</Fact>
				<Fact label="Próxima FPP">
					{stats.earliestDueDate ? formatDate(stats.earliestDueDate) : <NotApplicable />}
				</Fact>
				<Fact label="Partos ≤ 45 días">{`${stats.imminentCount.toLocaleString('es-AR')} cab.`}</Fact>
				<Fact label="Partos vencidos">
					{stats.overdueCount > 0 ? (
						<Typography
							component="span"
							sx={{ fontSize: '0.8rem', fontWeight: 700, color: 'warning.dark' }}
						>
							{`${stats.overdueCount} cab.`}
						</Typography>
					) : (
						<NotApplicable />
					)}
				</Fact>
				<Fact label="Peso promedio">{formatKg(stats.averageWeight)}</Fact>
			</Box>
		</Stack>
	);
}

export default GestationBatchOverviewAside;
