/**
 * Static data for stock widgets. Shapes mirror what the future read models will return.
 * Sources: caravans, caravan_movements (ORIGIN · ENTRY · EXIT · TRANSFER · WEANING),
 * caravan_lineages.birth_date and batches of type INTERNAL_DEATH / INTERNAL_CONSUMPTION.
 */
export const STOCK_TOTAL = {
	heads: 1284,
	deltaHeads30d: 36,
	deltaPct30d: 2.9,
	asOf: '18/09',
	last12Months: [1196, 1231, 1254, 1262, 1259, 1148, 1142, 1138, 1135, 1140, 1248, 1284]
};

export const STOCK_BALANCE_30D = {
	from: '19/08',
	to: '18/09',
	opening: 1248,
	births: 52,
	entries: 0,
	exits: 11,
	deaths: 4,
	internalConsumption: 1,
	closing: 1284,
	internalMovements: 214
};

export const STOCK_TREND = {
	months: ['oct', 'nov', 'dic', 'ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep'],
	yearMarks: { 0: '2025', 3: '2026' } as Record<number, string>,
	values: STOCK_TOTAL.last12Months,
	annotations: [
		{ index: 5, text: 'Venta de destete −118' },
		{ index: 10, text: 'Parición +108' }
	]
};

/** Grouped by the AnimalCategory enum of the domain. */
export const STOCK_BY_CATEGORY = [
	{ label: 'Vaca', value: 472 },
	{ label: 'Vaquillona', value: 322 },
	{ label: 'Novillito', value: 168 },
	{ label: 'Ternero', value: 108 },
	{ label: 'Ternera', value: 106 },
	{ label: 'Novillo', value: 46 },
	{ label: 'Vaca vacía', value: 40 },
	{ label: 'Toro', value: 22 }
];

export const STOCK_BY_BATCH = [
	{ label: 'Lote 02 · Vacas con cría', value: 316 },
	{ label: 'Recría Hembra 1', value: 146 },
	{ label: 'Lote 01 · Vaquillonas 15M', value: 96 },
	{ label: 'Recría Macho 1', value: 96 },
	{ label: 'Lote 03 · Vacas CUT', value: 88 },
	{ label: 'Recría Macho 2', value: 72 }
];

export const STOCK_BY_BREED = [
	{ label: '[Raza 1]', value: 745, pct: 58 },
	{ label: '[Raza 2]', value: 282, pct: 22 },
	{ label: '[Raza 3]', value: 154, pct: 12 },
	{ label: 'Otras / sin dato', value: 103, pct: 8 }
];

/** caravans.teeth for cows and heifers (0 · 2 · 4 · 6 · 8). */
export const DENTITION = {
	total: 688,
	rows: [
		{ label: 'Diente de leche', value: 60 },
		{ label: '2 dientes', value: 116 },
		{ label: '4 dientes', value: 138 },
		{ label: '6 dientes', value: 152 },
		{ label: 'Boca llena (8)', value: 222 }
	]
};

export interface ActiveBatchRow {
	name: string;
	batchType: string;
	/**
	 * Management system: true = penned, false = pasture, null = nobody declared it.
	 * The null exists because the question is now asked of every productive batch and
	 * the ones created before it went unasked.
	 */
	isConfined: boolean | null;
	heads: number;
	weighed: number;
	averageKg: number | null;
	minKg: number | null;
	maxKg: number | null;
}

export const ACTIVE_BATCHES: ActiveBatchRow[] = [
	{
		name: 'Recría Hembra 1',
		batchType: 'Vaquillonas de Recría',
		isConfined: false,
		heads: 146,
		weighed: 146,
		averageKg: 240,
		minKg: 198,
		maxKg: 281
	},
	{
		name: 'Recría Macho 1',
		batchType: 'Novillitos de Recría',
		isConfined: false,
		heads: 96,
		weighed: 82,
		averageKg: 285,
		minKg: 231,
		maxKg: 334
	},
	{
		name: 'Recría Macho 2',
		batchType: 'Novillitos de Recría',
		isConfined: true,
		heads: 72,
		weighed: 72,
		averageKg: 315,
		minKg: 288,
		maxKg: 347
	},
	{
		name: 'Lote 01 · Vaquillonas 15M',
		batchType: 'Vientres de Reposición',
		isConfined: false,
		heads: 96,
		weighed: 90,
		averageKg: 301,
		minKg: 254,
		maxKg: 352
	},
	{
		name: 'Lote 02 · Vacas con cría',
		batchType: 'Servicio / Entore',
		isConfined: false,
		heads: 316,
		weighed: 0,
		averageKg: null,
		minKg: null,
		maxKg: null
	}
];
