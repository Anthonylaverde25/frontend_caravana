import type { ReactNode } from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';
import type { Caravan } from '@/core/caravans/domain/entities/Caravan';
import type { CaravanWeightRecord } from '@/core/weighing/domain/entities/Weighing';
import { EMPTY_VALUE, formatDate, formatKg } from 'src/ui/herd/utils/herdFormat';
import { weightGain } from './caravanDrawerModel';
import { isBreedingCandidate } from '@/core/caravans/domain/rules/isBreedingCandidate';
import CaravanReproductionCard from './CaravanReproductionCard';

interface CaravanSummaryTabProps {
	caravan: Caravan;
	weights: CaravanWeightRecord[];
}

function Kpi({ label, value, detail, color }: { label: string; value: string; detail: string; color?: string }) {
	return (
		<Box sx={{ px: 1.75, py: 1.5, display: 'flex', flexDirection: 'column', gap: 0.25, minWidth: 0 }}>
			<Typography
				variant="caption"
				sx={{ color: 'text.secondary' }}
			>
				{label}
			</Typography>
			<Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color }}>{value}</Typography>
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

function Field({
	label,
	children,
	wide = false,
	mono = false
}: {
	label: string;
	children: ReactNode;
	wide?: boolean;
	mono?: boolean;
}) {
	return (
		<Box sx={{ gridColumn: wide ? '1 / -1' : undefined, minWidth: 0 }}>
			<Typography
				component="dt"
				variant="caption"
				sx={{ color: 'text.secondary' }}
			>
				{label}
			</Typography>
			<Typography
				component="dd"
				sx={{ m: 0, fontSize: '0.82rem', fontWeight: 600, fontFamily: mono ? 'monospace' : undefined }}
			>
				{children}
			</Typography>
		</Box>
	);
}

const SectionTitle = ({ children }: { children: ReactNode }) => (
	<Typography
		component="h3"
		sx={{ fontSize: '0.82rem', fontWeight: 600, mb: 1.25 }}
	>
		{children}
	</Typography>
);

/** Weight KPIs, reproduction (females), the caravan's data and its lineage. */
export function CaravanSummaryTab({ caravan, weights }: CaravanSummaryTabProps) {
	const gain = weightGain(caravan, weights);
	const lastWeighing = weights.find((w) => w.current) ?? null;
	const renspa = caravan.renspa && caravan.renspa !== 'NO_DEFINIDO' ? caravan.renspa : null;
	const lineage = caravan.lineage;

	return (
		<Stack spacing={2.75}>
			<Paper
				variant="outlined"
				sx={{
					display: 'grid',
					gridTemplateColumns: 'repeat(3, 1fr)',
					borderRadius: '8px',
					'& > *:not(:last-child)': { borderRight: 1, borderColor: 'divider' }
				}}
			>
				<Kpi
					label="Peso actual"
					value={formatKg(caravan.current_weight)}
					detail={
						lastWeighing
							? `Pesado ${formatDate(lastWeighing.weighing_date)}`
							: caravan.current_weight != null
								? 'Peso de ingreso'
								: 'Sin pesaje'
					}
				/>
				<Kpi
					label="Ganancia"
					value={
						gain.sinceEntryKg === null
							? EMPTY_VALUE
							: `${gain.sinceEntryKg >= 0 ? '+' : ''}${formatKg(gain.sinceEntryKg)}`
					}
					color={gain.sinceEntryKg !== null && gain.sinceEntryKg > 0 ? 'success.dark' : undefined}
					detail="desde el ingreso"
				/>
				<Kpi
					label="Ganancia diaria"
					value={gain.dailyKg === null ? EMPTY_VALUE : `${formatKg(gain.dailyKg, 2)}/día`}
					detail={gain.days ? `ADPV en ${gain.days} días` : 'Faltan pesajes'}
				/>
			</Paper>

			{caravan.sex === 'H' && isBreedingCandidate(caravan) && <CaravanReproductionCard caravan={caravan} />}

			<Box
				component="section"
				aria-label="Datos"
			>
				<SectionTitle>Datos</SectionTitle>
				<Box
					component="dl"
					sx={{ m: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 16px' }}
				>
					<Field label="Categoría">
						{caravan.category_name || caravan.category || EMPTY_VALUE}
						{caravan.subcategory_name && (
							<Typography
								component="span"
								variant="caption"
								sx={{ display: 'block', color: 'text.secondary' }}
							>
								{caravan.subcategory_name}
							</Typography>
						)}
					</Field>
					<Field label="Raza">{caravan.breed || EMPTY_VALUE}</Field>
					<Field label="Dentición">{caravan.teeth != null ? `${caravan.teeth} dientes` : EMPTY_VALUE}</Field>
					<Field label="Ingreso">
						{formatDate(caravan.entry_date)}
						{caravan.entry_weight != null && ` · ${formatKg(caravan.entry_weight)}`}
					</Field>
					<Field label="Origen">{caravan.provider_name || EMPTY_VALUE}</Field>
					<Field label="Establecimiento">{caravan.farm_name || EMPTY_VALUE}</Field>
					{renspa && (
						<Field
							label="RENSPA"
							wide
							mono
						>
							{renspa}
						</Field>
					)}
				</Box>
			</Box>

			{lineage && (lineage.mother_identification || lineage.father_identification) && (
				<Box
					component="section"
					aria-label="Genealogía"
				>
					<SectionTitle>Genealogía</SectionTitle>
					<Box
						component="dl"
						sx={{ m: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 16px' }}
					>
						<Field
							label="Madre"
							mono
						>
							{lineage.mother_identification || 'No registrada'}
						</Field>
						<Field
							label="Padre"
							mono
						>
							{lineage.father_identification || 'No registrado'}
						</Field>
						{lineage.birth_date && <Field label="Nacimiento">{formatDate(lineage.birth_date)}</Field>}
					</Box>
				</Box>
			)}
		</Stack>
	);
}

export default CaravanSummaryTab;
