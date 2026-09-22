/**
 * Static data for reproductive widgets.
 * Sources: service_orders, service_batch_details, caravan_gestations (start_date, gestation_stage,
 * success, loss_reason_id, estimated_due_date), female_caravan_details.is_empty, caravan_lineages.
 */
export const PREGNANCY = {
	rate: 87.4,
	pregnant: 360,
	checked: 412,
	previousCampaign: '2024/25',
	previousRate: 87.3,
	checkDate: '06/09',
	pendingBatch: 'Lote 03',
	pendingFemales: 88
};

/** Share of pregnancies conceived in the first 21 days (gestation_stage = head). */
export const HEAD_OF_CALVING = { rate: 62.8, head: 226, pregnant: 360, previousRate: 60.1 };

export const EMPTY_AT_CHECK = { total: 52, checked: 412, dry: 38, nursing: 14 };

/** INTA Balcarce reference: 3–7 bulls per 100 females. */
export const BULL_RATIO = { ratio: 4.4, bulls: 22, females: 500, apt: 18, toReview: 4, refMin: 3, refMax: 7 };

export const WEANING = {
	rate: 79.1,
	weaned: 318,
	exposed: 402,
	campaign: '2024/25',
	previousCampaign: '2023/24',
	previousRate: 77.4,
	date: '15/03/2026'
};

export const CALVINGS = { registered: 214, expectedToDate: 228, expectedTotal: 360, lastDueDate: '26/10' };

export const FUNNEL = {
	campaign: '2024/25',
	stages: [
		{ label: 'Vientres expuestos', value: 402, lossNote: '51 vacías al tacto · −12,7 pp' },
		{ label: 'Preñadas (tacto)', value: 351, lossNote: 'merma tacto–parto: 17 pérdidas de gestación · −4,2 pp' },
		{ label: 'Paridas', value: 334, lossNote: 'merma parto–destete: 16 no llegaron al destete · −4,0 pp' },
		{ label: 'Destetados', value: 318 }
	]
};

export const PREGNANCY_BY_CAMPAIGN = [
	{ label: '2021/22', value: 81.6 },
	{ label: '2022/23', value: 78.9 },
	{ label: '2023/24', value: 84.0 },
	{ label: '2024/25', value: 87.3 },
	{ label: '2025/26', value: 87.4, sublabel: 'parcial · 412 de 500', partial: true }
];

export const PREGNANCY_BY_THIRD = [
	{ label: 'Lote 01 · Vaquillonas 15M', pregnant: 81, head: 58, body: 30, tail: 12 },
	{ label: 'Lote 02 · Vacas con cría', pregnant: 279, head: 64, body: 27, tail: 9 }
];
export const PREGNANCY_BY_THIRD_TOTAL = { label: 'Total con tacto', pregnant: 360, head: 62.8, body: 27.7, tail: 9.5 };

export interface ServiceBatchRow {
	id: string;
	name: string;
	description: string;
	service: string;
	serviceDetail: string;
	exposed: number;
	checkDate: string | null;
	scheduledCheck?: string;
	pregnant: number | null;
	rate: number | null;
	headRate: number | null;
	empty: number | null;
}

export const SERVICE_BATCHES: ServiceBatchRow[] = [
	{
		id: 'l01',
		name: 'Lote 01 · Vaquillonas 15M',
		description: 'Vientres de reposición · extensivo',
		service: 'IATF + repaso',
		serviceDetail: '4 toros · 01/11–31/01',
		exposed: 96,
		checkDate: '06/09/2026',
		pregnant: 81,
		rate: 84.4,
		headRate: 58,
		empty: 15
	},
	{
		id: 'l02',
		name: 'Lote 02 · Vacas con cría al pie',
		description: 'Vacas multíparas · extensivo',
		service: 'Natural',
		serviceDetail: '14 toros · 01/11–31/01',
		exposed: 316,
		checkDate: '04/09/2026',
		pregnant: 279,
		rate: 88.3,
		headRate: 64,
		empty: 37
	},
	{
		id: 'l03',
		name: 'Lote 03 · Vacas CUT',
		description: 'Último servicio · extensivo',
		service: 'Natural',
		serviceDetail: '4 toros · 01/11–31/01',
		exposed: 88,
		checkDate: null,
		scheduledCheck: '25/09',
		pregnant: null,
		rate: null,
		headRate: null,
		empty: null
	}
];

/** Bulls per 100 females vs. service_batch_details.target_bull_ratio. */
export const BULL_RATIO_BY_BATCH = [
	{ label: 'Lote 01', actual: 4.2, target: 4.0 },
	{ label: 'Lote 02', actual: 4.4, target: 4.0 },
	{ label: 'Lote 03', actual: 4.5, target: 5.0 }
];

export const GESTATION_LOSSES = {
	campaign: '2024/25',
	total: 17,
	pregnancies: 351,
	rows: [
		{ label: 'Aborto', value: 7 },
		{ label: 'Reabsorción', value: 5 },
		{ label: 'Muerte fetal', value: 3 },
		{ label: 'Sin motivo', value: 2 }
	]
};

export const SERVICE_ORDERS = [
	{ status: 'DRAFT', label: 'Borrador', value: 1 },
	{ status: 'APPROVED', label: 'Aprobada', value: 2 },
	{ status: 'SUCCESS', label: 'Exitosa', value: 3 },
	{ status: 'REJECTED', label: 'Rechazada', value: 1 },
	{ status: 'CANCELLED', label: 'Cancelada', value: 0 }
] as const;

/** PhysiologicalState enum over 512 cows. */
export const PHYSIOLOGICAL_STATE = {
	total: 512,
	rows: [
		{ state: 'PREGNANT_LACTATING', label: 'Preñada lactando', value: 262 },
		{ state: 'PREGNANT_DRY', label: 'Preñada seca', value: 98 },
		{ state: 'IN_SERVICE', label: 'En servicio', value: 88 },
		{ state: 'EMPTY_DRY', label: 'Vacía seca', value: 38 },
		{ state: 'EMPTY_LACTATING', label: 'Vacía lactando', value: 14 },
		{ state: 'UNKNOWN', label: 'Sin dato', value: 12 }
	]
};

export const CALVINGS_BY_WEEK = {
	weeks: ['10/08', '17/08', '24/08', '31/08', '07/09', '14/09', '21/09', '28/09', '05/10', '12/10', '19/10', '26/10'],
	expected: [18, 42, 58, 61, 49, 38, 30, 22, 16, 12, 8, 6],
	registered: [16, 40, 55, 57, 46, 0, 0, 0, 0, 0, 0, 0],
	/** 18/09 falls four days into the week of 14/09. */
	todayPosition: 5.57
};
