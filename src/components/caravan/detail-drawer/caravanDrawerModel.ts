import type { Caravan } from '@/core/caravans/domain/entities/Caravan';
import { isBreedingCandidate } from '@/core/caravans/domain/rules/isBreedingCandidate';
import type { CaravanMovement } from '@/core/caravans/domain/entities/CaravanMovement';
import type { CaravanWeightRecord, WeighingMethod } from '@/core/weighing/domain/entities/Weighing';

export const GESTATION_MONTHS = 9;

export type ChipTone = 'success' | 'warning' | 'error' | 'neutral';

export interface StatusChip {
	label: string;
	tone: ChipTone;
}

export interface ReproductiveState {
	pregnant: boolean;
	months: number | null;
	/** Share of a full gestation, 0–100. */
	progressPct: number;
	startDate: string | null;
	dueDate: string | null;
	overdueDays: number | null;
}

export interface WeightGain {
	/** kg gained since entry; null when either weight is missing. */
	sinceEntryKg: number | null;
	/** Daily gain from the first and last weighings that count for ADPV; null with fewer than two. */
	dailyKg: number | null;
	days: number | null;
}

export interface TimelineEvent {
	key: string;
	date: string;
	title: string;
	detail: string;
	tone: ChipTone | 'primary';
}

const DAY_MS = 86_400_000;

const toTime = (date: string) => new Date(date.slice(0, 10)).getTime();

const byDateAsc = (a: CaravanWeightRecord, b: CaravanWeightRecord) =>
	toTime(a.weighing_date) - toTime(b.weighing_date) || a.id - b.id;

export function reproductiveState(caravan: Caravan): ReproductiveState {
	const gestation = caravan.active_gestation;
	const pregnant =
		caravan.physiological_state?.is_pregnant ??
		(caravan.female_details ? !caravan.female_details.is_empty : (gestation?.is_current ?? false));
	const months = gestation?.gestation_months ?? caravan.physiological_state?.gestation_months ?? null;

	return {
		pregnant: !!pregnant,
		months,
		progressPct: months ? Math.min(100, Math.round((months / GESTATION_MONTHS) * 100)) : 0,
		startDate: gestation?.start_date ?? null,
		dueDate: gestation?.estimated_due_date ?? null,
		overdueDays: gestation?.calving_overdue_reported_at ? (gestation.calving_overdue_days ?? 0) : null
	};
}

/** The few states worth a glance in the header. */
export function statusChips(caravan: Caravan): StatusChip[] {
	const chips: StatusChip[] = [];

	// A calf has no reproductive state yet: neither "Vacía" nor an eligibility to show.
	if (caravan.sex === 'H' && isBreedingCandidate(caravan)) {
		const repro = reproductiveState(caravan);

		if (repro.overdueDays !== null) chips.push({ label: `Parto vencido · ${repro.overdueDays} d`, tone: 'error' });

		if (repro.pregnant)
			chips.push({ label: repro.months ? `Preñada · ${repro.months} meses` : 'Preñada', tone: 'success' });
		else chips.push({ label: 'Vacía', tone: 'neutral' });

		chips.push(
			caravan.is_breeding_eligible
				? { label: 'Apta para servicio', tone: 'success' }
				: { label: caravan.breeding_exclusion_reason_label ?? 'No apta para servicio', tone: 'warning' }
		);
	}

	if (!caravan.current_weight) chips.push({ label: 'Sin pesar', tone: 'warning' });

	if (!caravan.is_operational) chips.push({ label: 'No operativa', tone: 'neutral' });

	return chips;
}

export function weightGain(caravan: Caravan, weights: CaravanWeightRecord[]): WeightGain {
	// Without any weighing the current weight is the entry weight itself: no gain was measured.
	const sinceEntryKg =
		weights.length > 0 && caravan.current_weight != null && caravan.entry_weight != null
			? caravan.current_weight - caravan.entry_weight
			: null;
	const adpv = weights.filter((w) => w.affects_adpv).sort(byDateAsc);

	if (adpv.length < 2) return { sinceEntryKg, dailyKg: null, days: null };

	const first = adpv[0];
	const last = adpv[adpv.length - 1];
	const days = Math.round((toTime(last.weighing_date) - toTime(first.weighing_date)) / DAY_MS);

	return {
		sinceEntryKg,
		dailyKg: days > 0 ? (last.weight - first.weight) / days : null,
		days: days > 0 ? days : null
	};
}

const METHOD_LABELS: Record<WeighingMethod, string> = {
	INDIVIDUAL: 'Pesada individual',
	AVERAGE: 'Promedio del lote',
	PORTABLE_FIELD: 'Balanza portátil',
	ESTIMATED: 'Estimado'
};

/** Where a weight came from: a batch average is not a measure of this animal. */
export const weighingSourceLabel = (method: WeighingMethod): string => METHOD_LABELS[method] ?? method;

export interface WeighingRow {
	id: number;
	date: string;
	weight: number;
	diff: number | null;
	source: string;
	typeName: string;
}

/** Newest first, each with its difference from the previous weighing. */
export function weighingRows(weights: CaravanWeightRecord[]): WeighingRow[] {
	const ordered = [...weights].sort(byDateAsc);

	return ordered
		.map((w, index) => ({
			id: w.id,
			date: w.weighing_date,
			weight: w.weight,
			diff: index > 0 ? w.weight - ordered[index - 1].weight : null,
			source: weighingSourceLabel(w.method),
			typeName: w.weighing_type_name
		}))
		.reverse();
}

export interface ChartPoint {
	x: number;
	y: number;
	weight: number;
	date: string;
}

/** Points of the weight chart in a width × height box, oldest on the left. */
export function chartPoints(weights: CaravanWeightRecord[], width: number, height: number, pad = 28): ChartPoint[] {
	const ordered = [...weights].sort(byDateAsc);

	if (ordered.length === 0) return [];

	const values = ordered.map((w) => w.weight);
	const low = Math.min(...values) - 10;
	const high = Math.max(...values) + 10;
	const step = ordered.length > 1 ? (width - pad * 2) / (ordered.length - 1) : 0;

	return ordered.map((w, index) => ({
		x: Math.round(ordered.length > 1 ? pad + index * step : width / 2),
		y: Math.round(height - pad / 2 - ((w.weight - low) / (high - low)) * (height - pad * 1.5)),
		weight: w.weight,
		date: w.weighing_date
	}));
}

const MOVEMENT_LABELS: Record<CaravanMovement['type'], string> = {
	ORIGIN: 'Origen',
	ENTRY: 'Ingreso',
	EXIT: 'Egreso',
	TRANSFER: 'Traslado'
};

/** Movements, weighings and the current gestation, newest first. */
export function timeline(
	caravan: Caravan,
	movements: CaravanMovement[],
	weights: CaravanWeightRecord[]
): TimelineEvent[] {
	const events: TimelineEvent[] = [
		...movements.map((m) => ({
			key: `m-${m.id}`,
			date: m.movementDate,
			title: MOVEMENT_LABELS[m.type] ?? m.type,
			detail: m.observations || (m.renspa ? `RENSPA ${m.renspa}` : ''),
			tone: 'neutral' as const
		})),
		...weights.map((w) => ({
			key: `w-${w.id}`,
			date: w.weighing_date,
			title: 'Pesaje',
			detail: `${w.weight.toLocaleString('es-AR')} kg · ${weighingSourceLabel(w.method)}`,
			tone: 'primary' as const
		}))
	];

	const gestation = caravan.active_gestation;

	if (gestation?.start_date) {
		const sires = (gestation.sires ?? []).map((s) => s.identification).join(', ');
		events.push({
			key: 'g-start',
			date: gestation.start_date,
			title: 'Inicio de gestación',
			detail: sires ? `Toros: ${sires}` : 'Sin toro asignado',
			tone: 'success'
		});
	}

	if (gestation?.calving_overdue_reported_at) {
		events.push({
			key: 'g-overdue',
			date: gestation.calving_overdue_reported_at,
			title: 'No parió',
			detail: `Parto vencido hace ${gestation.calving_overdue_days ?? 0} días`,
			tone: 'error'
		});
	}

	return events.sort((a, b) => toTime(b.date) - toTime(a.date));
}
