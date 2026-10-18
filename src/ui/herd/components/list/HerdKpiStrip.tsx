import { useMemo } from 'react';
import { Box, ButtonBase, Paper, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { Batch } from '@/core/batches/domain/entities/Batch';
import { useCaravansSummary } from '@/features/caravans/hooks/useCaravansSummary';
import { computeHerdKpis, type HerdKpis } from '../../utils/herdKpis';
import { EMPTY_VALUE, formatKg, UNASSIGNED_ANCHOR, UNASSIGNED_BATCH } from '../../utils/herdFormat';

interface HerdKpiStripProps {
	batches: Batch[];
}

interface KpiCellProps {
	label: string;
	value: string;
	detail: string;
	valueColor?: string;
}

const plural = (count: number, one: string, many: string) =>
	`${count.toLocaleString('es-AR')} ${count === 1 ? one : many}`;

/** Weighed over what, and the calves at foot apart: they are left out of the average. */
function averageDetail(kpis: HerdKpis): string {
	if (kpis.averageKg === null) return 'Sin pesajes';

	const adults = kpis.heads - kpis.calves;
	const weighed = `${kpis.weighedHeads.toLocaleString('es-AR')} de ${adults.toLocaleString('es-AR')} cab. pesadas`;

	if (kpis.calves === 0) return weighed;

	return kpis.calfAverageKg !== null
		? `${weighed} · al pie ${formatKg(kpis.calfAverageKg)}`
		: `${weighed} · al pie sin pesar`;
}

function KpiCell({ label, value, detail, valueColor }: KpiCellProps) {
	return (
		<Box sx={{ px: 2.5, py: 2, display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 0 }}>
			<Typography
				variant="caption"
				sx={{ color: 'text.secondary', fontSize: '0.8rem' }}
			>
				{label}
			</Typography>
			<Typography
				sx={{ fontSize: '1.6rem', fontWeight: 700, lineHeight: 1.15, color: valueColor ?? 'text.primary' }}
			>
				{value}
			</Typography>
			<Typography
				variant="caption"
				sx={{ color: 'text.secondary' }}
				noWrap
			>
				{detail}
			</Typography>
		</Box>
	);
}

/**
 * Summary of the visible batches: head, active batches, head in service, weighted average weight,
 * and the caravans in no batch as a shortcut to their row.
 */
export function HerdKpiStrip({ batches }: HerdKpiStripProps) {
	const kpis = useMemo(() => computeHerdKpis(batches), [batches]);
	const { data } = useCaravansSummary({ batchId: UNASSIGNED_BATCH, perPage: 1 });
	const unassigned = data?.meta.total ?? 0;

	const goToUnassigned = () =>
		document.getElementById(UNASSIGNED_ANCHOR)?.scrollIntoView({ behavior: 'smooth', block: 'center' });

	return (
		<Paper
			component="section"
			aria-label="Resumen"
			elevation={0}
			sx={{
				display: 'grid',
				gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
				border: 1,
				borderColor: 'divider',
				borderRadius: '10px',
				overflow: 'hidden',
				'& > *:not(:last-child)': { borderRight: 1, borderColor: 'divider' }
			}}
		>
			<KpiCell
				label="Cabezas"
				value={kpis.heads.toLocaleString('es-AR')}
				detail={
					kpis.calves > 0
						? `${plural(kpis.heads - kpis.calves, 'adulto', 'adultos')} + ${kpis.calves.toLocaleString('es-AR')} al pie · ${plural(kpis.stockedBatches, 'lote', 'lotes')}`
						: `en ${plural(kpis.stockedBatches, 'lote', 'lotes')}`
				}
			/>
			<KpiCell
				label="Lotes activos"
				value={kpis.activeBatches.toLocaleString('es-AR')}
				detail={plural(kpis.emptyBatches, 'vacío', 'vacíos')}
			/>
			<KpiCell
				label="En servicio"
				value={kpis.serviceHeads > 0 ? `${kpis.serviceHeads.toLocaleString('es-AR')} cab.` : EMPTY_VALUE}
				valueColor={kpis.serviceHeads > 0 ? '#9A3412' : undefined}
				detail={
					kpis.serviceCodes.length > 0
						? `${plural(kpis.serviceCodes.length, 'lote', 'lotes')} · ${kpis.serviceCodes.join(', ')}`
						: 'Ningún lote en servicio'
				}
			/>
			<KpiCell
				label={kpis.calves > 0 ? 'Peso promedio adultos' : 'Peso promedio'}
				value={formatKg(kpis.averageKg)}
				detail={averageDetail(kpis)}
			/>
			<ButtonBase
				onClick={goToUnassigned}
				disabled={unassigned === 0}
				sx={{
					display: 'block',
					textAlign: 'left',
					bgcolor: (theme) => (unassigned > 0 ? alpha(theme.palette.warning.main, 0.08) : 'transparent')
				}}
			>
				<Box sx={{ px: 2.5, py: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
					<Typography
						variant="caption"
						sx={{ color: 'warning.dark', fontWeight: 600, fontSize: '0.8rem' }}
					>
						Sin lote asignado
					</Typography>
					<Typography
						sx={{
							fontSize: '1.6rem',
							fontWeight: 700,
							lineHeight: 1.15,
							color: unassigned > 0 ? 'warning.dark' : 'text.primary'
						}}
					>
						{unassigned.toLocaleString('es-AR')}
					</Typography>
					<Typography
						variant="caption"
						sx={{ color: 'warning.dark', textDecoration: unassigned > 0 ? 'underline' : 'none' }}
					>
						{unassigned > 0 ? 'Ver caravanas' : 'Todas en un lote'}
					</Typography>
				</Box>
			</ButtonBase>
		</Paper>
	);
}

export default HerdKpiStrip;
