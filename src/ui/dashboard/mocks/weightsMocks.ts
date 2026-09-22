import { WeightCurvePoint } from '../components/charts/WeightCompositionChart';

/**
 * Static data for weight widgets.
 * Sources: caravan_weights, batch_weights (type CONTROL · MOVEMENT_IN · MOVEMENT_OUT, weights_as_of),
 * batches (min_weight, max_weight, current_weight) and animal_subcategories.target_weight_min/max.
 */
export type AdpvGroup = 'FEMALE' | 'MALE';

export const ADPV_BY_GROUP: Record<
	AdpvGroup,
	{
		label: string;
		value: number;
		previous: number;
		heads: number;
		context: string;
		footnote: string;
		staleWarning?: string;
	}
> = {
	FEMALE: {
		label: 'Recría hembra',
		value: 0.51,
		previous: 0.46,
		heads: 146,
		context: '146 cabezas · crecimiento real, sin efecto de composición',
		footnote: 'Pesajes 20/07 → 15/09 (57 días)'
	},
	MALE: {
		label: 'Recría macho',
		value: 0.37,
		previous: 0.42,
		heads: 168,
		context: '168 cabezas en 2 lotes · promedio ponderado por cabezas',
		footnote: 'Pesajes entre 28/07 y 10/09',
		staleWarning: 'Incluye pesos de hace 52 días (Recría Macho 1)'
	}
};

/** INTA reference for traditional weaning: 160–190 kg. */
export const WEANING_WEIGHT = {
	average: 174,
	calves: 318,
	males: 181,
	females: 167,
	refMin: 160,
	refMax: 190,
	date: '15/03/2026'
};

export const BACKGROUNDING_KG = {
	totalKg: 85080,
	heads: 314,
	batches: 3,
	femalesKg: 35040,
	malesKg: 50040,
	from: '28/07',
	to: '15/09'
};

export const WEIGHT_CURVE: { batchName: string; totalDays: number; points: WeightCurvePoint[] } = {
	batchName: 'Recría Hembra 1',
	totalDays: 187,
	points: [
		{ day: 0, dateLabel: '15/03', average: 168, heads: 130, kind: 'CONTROL' },
		{ day: 36, dateLabel: '20/04', average: 182, heads: 130, kind: 'CONTROL' },
		{ day: 71, dateLabel: '25/05', average: 196, heads: 130, kind: 'CONTROL' },
		{ day: 107, dateLabel: '30/06', average: 209, heads: 130, kind: 'CONTROL' },
		{
			day: 119,
			dateLabel: '12/07',
			average: 204,
			heads: 146,
			kind: 'COMPOSITION',
			note: ['12/07 · ingresan 16 terneras', 'promedio −5 kg por composición']
		},
		{ day: 127, dateLabel: '20/07', average: 211, heads: 146, kind: 'CONTROL' },
		{ day: 163, dateLabel: '25/08', average: 229, heads: 146, kind: 'CONTROL' },
		{ day: 184, dateLabel: '15/09', average: 240, heads: 146, kind: 'CONTROL' }
	]
};

export const WEIGHT_CHANGE_BREAKDOWN = {
	batchName: 'Recría Hembra 1',
	from: '30/06',
	to: '15/09',
	fromAverage: 209,
	toAverage: 240,
	net: 31,
	realGrowth: 36,
	composition: -5,
	compositionCaption: 'Entraron 16 terneras de 165 kg: bajan el promedio, no el peso de nadie',
	totalKgFrom: 27170,
	totalKgTo: 35040
};

export const WEIGHT_FRESHNESS = { weighed: 286, heads: 314, fresh: 180, aging: 30, stale: 76, staleDays: 45 };

export const WEIGHT_DISPERSION = [
	{ label: 'Recría Hembra 1', min: 198, avg: 240, max: 281 },
	{ label: 'Recría Macho 1', min: 231, avg: 285, max: 334 },
	{ label: 'Recría Macho 2', min: 288, avg: 315, max: 347 }
];

export const SUBCATEGORY_OPTIONS = [
	{ value: 'REPLACEMENT_HEIFER', label: 'Vaquillona de reposición', helper: 'Objetivo del catálogo: 280–300 kg' },
	{ value: 'GROWING_STEER', label: 'Novillito de recría', helper: 'Objetivo del catálogo: [PESO OBJETIVO]' }
];

export const WEIGHT_VS_TARGET = {
	subcategory: 'Vientres de reposición',
	targetLabel: 'objetivo ≥ 280 kg',
	thresholdIndex: 3,
	reached: 55,
	total: 92,
	bins: [
		{ label: '220–240', count: 4 },
		{ label: '240–260', count: 11 },
		{ label: '260–280', count: 22 },
		{ label: '280–300', count: 27 },
		{ label: '300–320', count: 18 },
		{ label: '320–340', count: 10 }
	]
};

export interface BackgroundingBatchRow {
	name: string;
	/**
	 * Management system: true = penned, false = pasture, null = nobody declared it.
	 * The null exists because the question is now asked of every productive batch and
	 * the ones created before it went unasked.
	 */
	isConfined: boolean | null;
	heads: number;
	totalKg: number;
	averageKg: number;
	adpv: number;
	lastWeighing: string;
	daysSinceWeighing: number;
}

export const BACKGROUNDING_BATCHES: BackgroundingBatchRow[] = [
	{
		name: 'Recría Hembra 1',
		isConfined: false,
		heads: 146,
		totalKg: 35040,
		averageKg: 240,
		adpv: 0.51,
		lastWeighing: '15/09',
		daysSinceWeighing: 3
	},
	{
		name: 'Recría Macho 1',
		isConfined: false,
		heads: 96,
		totalKg: 27360,
		averageKg: 285,
		adpv: 0.31,
		lastWeighing: '28/07',
		daysSinceWeighing: 52
	},
	{
		name: 'Recría Macho 2',
		isConfined: true,
		heads: 72,
		totalKg: 22680,
		averageKg: 315,
		adpv: 0.44,
		lastWeighing: '10/09',
		daysSinceWeighing: 8
	}
];

export const STALE_WEIGHT_DAYS = 45;
