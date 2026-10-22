import React, { useMemo, type ReactNode } from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';
import type { BirthHistoryRecord } from '@/features/gestation/hooks/useBirthHistory';
import { isWeaningCode } from './birthsTypes';

const cardSx = {
	p: 2,
	borderRadius: '8px',
	border: 1,
	borderColor: 'divider',
	bgcolor: 'background.paper',
	display: 'flex',
	flexDirection: 'column',
	justifyContent: 'space-between',
	minHeight: 88
} as const;

interface KpiCardProps {
	title: string;
	value: ReactNode;
	caption: ReactNode;
	color?: string;
}

/** One figure of a KPI strip: what it counts, the value and what qualifies it. */
export function KpiCard({ title, value, caption, color = 'text.secondary' }: KpiCardProps) {
	return (
		<Paper
			elevation={0}
			sx={cardSx}
		>
			<Typography
				variant="caption"
				sx={{ color, fontWeight: 700, textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.04em' }}
			>
				{title}
			</Typography>
			<Stack
				direction="row"
				alignItems="baseline"
				spacing={1}
			>
				<Typography
					variant="h5"
					sx={{ fontWeight: 800, color: 'text.primary', whiteSpace: 'nowrap' }}
				>
					{value}
				</Typography>
				<Typography
					variant="caption"
					sx={{ color: 'text.secondary' }}
				>
					{caption}
				</Typography>
			</Stack>
		</Paper>
	);
}

const share = (part: number, total: number): string => (total > 0 ? `${Math.round((part * 100) / total)}%` : '—');

const averageWeight = (records: BirthHistoryRecord[]): string => {
	const weights = records.map((r) => r.calf_weight).filter((w): w is number => w != null);

	return weights.length > 0 ? `${Math.round(weights.reduce((sum, w) => sum + w, 0) / weights.length)} kg` : '—';
};

interface BirthsKpiStripProps {
	/** The calves at foot in scope: all of them, or those of the batch filtered. */
	records: BirthHistoryRecord[];
}

/**
 * What there is to wean: the calves at foot by sex, how many an open weaning order already holds,
 * and their weight. The weight is the last one taken after birth; calves weighed only at birth are
 * left out of the average and the coverage says how many were.
 */
export const BirthsKpiStrip: React.FC<BirthsKpiStripProps> = ({ records }) => {
	const metrics = useMemo(() => {
		const males = records.filter((r) => r.calf_sex === 'M');
		const females = records.filter((r) => r.calf_sex === 'H');

		return {
			total: records.length,
			untagged: records.filter((r) => !r.calf_is_tagged).length,
			males: males.length,
			females: females.length,
			inWeaning: records.filter((r) => isWeaningCode(r.open_order_code)).length,
			weaningOrders: new Set(records.filter((r) => isWeaningCode(r.open_order_code)).map((r) => r.open_order_code)).size,
			free: records.filter((r) => !r.open_order_code).length,
			weighed: records.filter((r) => r.calf_weight != null).length,
			maleWeight: averageWeight(males),
			femaleWeight: averageWeight(females)
		};
	}, [records]);

	return (
		<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
			<KpiCard
				title="Al pie"
				value={metrics.total}
				caption={metrics.untagged > 0 ? `crías · ${metrics.untagged} sin caravana` : 'crías lactando'}
			/>
			<KpiCard
				title="Volumen a destetar"
				color="info.main"
				value={`♂ ${metrics.males} · ♀ ${metrics.females}`}
				caption={`${share(metrics.males, metrics.total)} machos`}
			/>
			<KpiCard
				title="En orden de destete"
				color="info.main"
				value={metrics.inWeaning}
				caption={`en ${metrics.weaningOrders} ${metrics.weaningOrders === 1 ? 'orden abierta' : 'órdenes abiertas'} · ${metrics.free} sin orden`}
			/>
			<KpiCard
				title="Peso promedio"
				color="success.main"
				value={`♂ ${metrics.maleWeight} · ♀ ${metrics.femaleWeight}`}
				caption={`pesadas ${metrics.weighed} de ${metrics.total}`}
			/>
		</Box>
	);
};

export default BirthsKpiStrip;
