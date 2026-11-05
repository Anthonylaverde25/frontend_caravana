import { Box } from '@mui/material';
import type { Batch } from '@/core/batches/domain/entities/Batch';
import type { BatchOverview } from '@/core/batches/domain/entities/BatchOverview';
import HerdKpiCard from './HerdKpiCard';
import {
	EMPTY_VALUE,
	formatDate,
	formatKg,
	formatPercent,
	hasMixedWeights,
	headBreakdownHint
} from '../../utils/herdFormat';

interface HerdBatchKpiGridProps {
	batch: Batch;
	overview: BatchOverview | undefined;
}

/**
 * The figures of a batch, all from data the system records. An aggregate over an empty set shows
 * "—": zero would invent a fact. No daily gain: across a batch whose composition changes it would
 * mix moving animals with real growth (the weight chart below keeps those apart). Bulls on service
 * count as head and nowhere else: sex, weights and coverage describe the herd.
 */
export function HerdBatchKpiGrid({ batch, overview }: HerdBatchKpiGridProps) {
	const caravans = batch.caravans_count ?? 0;
	const herdCaravans = batch.herd_caravans_count;
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
						batch.pending_identification_count > 0 &&
							`${batch.pending_identification_count} por identificar`,
						batch.untagged_calf_count > 0 && `${batch.untagged_calf_count} sin caravana`,
						batch.bulls_on_service_count > 0 && headBreakdownHint(batch)
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
			{hasMixedWeights(batch) ? (
				<HerdKpiCard
					label="Peso por categoría"
					value={`${batch.weighed_category_count} categorías`}
					hint={(overview?.category_composition ?? [])
						.filter((category) => category.average_weight !== null)
						.map((category) => `${category.name ?? 'Sin categoría'} ${formatKg(category.average_weight)}`)
						.join(' · ')}
				/>
			) : (
				<HerdKpiCard
					label="Peso promedio"
					value={formatKg(weighed > 0 ? batch.current_weight : null)}
					hint={hasRange ? `${formatKg(batch.min_weight)} – ${formatKg(batch.max_weight)}` : 'Sin rango'}
				/>
			)}
			<HerdKpiCard
				label="Kg totales"
				value={formatKg(weighed > 0 ? batch.total_weight : null)}
				hint={`sobre ${weighed} cab. pesadas`}
			/>
			<HerdKpiCard
				label="Cobertura de pesaje"
				value={formatPercent(weighed, herdCaravans)}
				hint={herdCaravans > 0 ? `${weighed} de ${herdCaravans} con peso` : undefined}
				tone={herdCaravans > 0 && weighed < herdCaravans ? 'warning' : 'default'}
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
