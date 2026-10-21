import { Box } from '@mui/material';
import type { Batch } from '@/core/batches/domain/entities/Batch';
import type { BatchOverview } from '@/core/batches/domain/entities/BatchOverview';
import HerdKpiCard from './HerdKpiCard';
import { EMPTY_VALUE, formatDate, formatKg, formatPercent } from '../../utils/herdFormat';

interface HerdBatchKpiGridProps {
	batch: Batch;
	overview: BatchOverview | undefined;
}

/**
 * The figures of a batch, all from data the system records. An aggregate over an empty set shows
 * "—": zero would invent a fact. No daily gain: across a batch whose composition changes it would
 * mix moving animals with real growth (the weight chart below keeps those apart).
 */
export function HerdBatchKpiGrid({ batch, overview }: HerdBatchKpiGridProps) {
	const caravans = batch.caravans_count ?? 0;
	const weighed = batch.weighed_count ?? 0;
	const sex = overview?.sex_composition;
	const reproductive = overview?.reproductive;
	const hasRange = batch.min_weight != null && batch.max_weight != null;

	return (
		<Box
			sx={{
				display: 'grid',
				gap: 1.5,
				gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', lg: 'repeat(6, 1fr)' }
			}}
		>
			<HerdKpiCard
				label="Cabezas"
				value={batch.head_count}
				hint={
					[
						batch.pending_identification_count > 0 && `${batch.pending_identification_count} por identificar`,
						batch.untagged_calf_count > 0 && `${batch.untagged_calf_count} sin caravana`
					]
						.filter(Boolean)
						.join(' · ') || `${caravans} caravanas`
				}
				tone={batch.pending_identification_count > 0 || batch.untagged_calf_count > 0 ? 'warning' : 'default'}
			/>
			<HerdKpiCard
				label="Machos / Hembras"
				value={sex ? `${sex.M} / ${sex.H}` : EMPTY_VALUE}
				hint={sex ? `${formatPercent(sex.H, sex.M + sex.H)} hembras` : undefined}
			/>
			<HerdKpiCard
				label="Peso promedio"
				value={formatKg(weighed > 0 ? batch.current_weight : null)}
				hint={hasRange ? `${formatKg(batch.min_weight)} – ${formatKg(batch.max_weight)}` : 'Sin rango'}
			/>
			<HerdKpiCard
				label="Kg totales"
				value={formatKg(weighed > 0 ? batch.total_weight : null)}
				hint={`sobre ${weighed} cab. pesadas`}
			/>
			<HerdKpiCard
				label="Cobertura de pesaje"
				value={formatPercent(weighed, caravans)}
				hint={caravans > 0 ? `${weighed} de ${caravans} con peso` : undefined}
				tone={caravans > 0 && weighed < caravans ? 'warning' : 'default'}
			/>
			<HerdKpiCard
				label="Último pesaje"
				value={formatDate(overview?.last_weighing_date)}
			/>

			{reproductive && (
				<>
					<HerdKpiCard
						label="Preñadas"
						value={reproductive.pregnant}
						hint={`${formatPercent(reproductive.pregnant, reproductive.females)} de ${reproductive.females} hembras`}
						tone="success"
					/>
					<HerdKpiCard
						label="Sin preñez registrada"
						value={reproductive.without_gestation}
						hint="Vacías o sin diagnóstico"
					/>
					<HerdKpiCard
						label="Partos vencidos"
						value={reproductive.overdue}
						hint="Riesgo para la hembra"
						tone={reproductive.overdue > 0 ? 'error' : 'default'}
					/>
				</>
			)}
		</Box>
	);
}

export default HerdBatchKpiGrid;
