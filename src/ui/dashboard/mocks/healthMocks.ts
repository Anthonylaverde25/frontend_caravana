/**
 * Static data for health widgets.
 * Sources: diagnostic_protocols, bull_lab_samples (sample_type, status, sample_date, result_date),
 * lab_report_details.is_derived, sample_shipments.cold_chain_ok, veterinary_diagnoses, pathogens,
 * bull_health_evaluations and transfers into INTERNAL_DEATH batches (mortality).
 */
export const LAB_EXPECTED_DAYS = 30;

export const LAB_PENDING = { protocols: 9, samples: 31, overdue: 3, onTime: 6 };

export const BULL_APTITUDE = {
	total: 22,
	rows: [
		{ status: 'APT', label: 'Apto', value: 18 },
		{ status: 'UNFIT', label: 'No apto', value: 1 },
		{ status: 'IN_TREATMENT', label: 'En tratamiento', value: 1 },
		{ status: 'PENDING_EVALUATION', label: 'Pendiente de evaluación', value: 2 }
	],
	nextServiceStart: '01/11'
};

export const ACTIVE_DIAGNOSES = { total: 7, confirmedPositive: 2, inTreatment: 2, suspected: 3, disqualifying: 2 };

export const TURNAROUND = { medianDays: 24, samples: 38, derivedDays: 27, inSituDays: 9 };

/** Deaths = transfers into INTERNAL_DEATH batches over the average stock of the period. */
export const MORTALITY = {
	rate: 1.5,
	deaths: 18,
	averageStock: 1203,
	previousRate: 1.9,
	period: 'Oct 2025 – sep 2026'
};

export const COLD_CHAIN = {
	ok: 11,
	total: 12,
	incident: 'Envío del 22/08 a [laboratorio]: "caja recibida sin refrigerante"'
};

export const PROTOCOL_SOURCES = { total: 23, portal: 14, digitizedVerified: 6, digitizedUnverified: 3 };

export const SAMPLES_BY_TYPE = [
	{ type: 'PREPUCE_SCRAPE', label: 'Raspaje prepucial', negative: 34, positive: 2, pending: 8 },
	{ type: 'BLOOD_SEROLOGY', label: 'Serología (sangre)', negative: 7, positive: 0, pending: 9 },
	{ type: 'SEMEN_CULTURE', label: 'Cultivo de semen', negative: 4, positive: 0, pending: 2 },
	{ type: 'TUBERCULIN_TEST', label: 'Tuberculina', negative: 10, positive: 0, pending: 12 }
];

export interface PathogenRow {
	name: string;
	category: string;
	isDisqualifying: boolean;
	confirmed: number;
	inTreatment: number;
	suspected: number;
}

export const DIAGNOSES_BY_PATHOGEN: PathogenRow[] = [
	{
		name: '[Patógeno venéreo]',
		category: 'Venéreo',
		isDisqualifying: true,
		confirmed: 2,
		inTreatment: 1,
		suspected: 0
	},
	{
		name: '[Patógeno locomotor]',
		category: 'Locomotor',
		isDisqualifying: false,
		confirmed: 0,
		inTreatment: 1,
		suspected: 0
	},
	{
		name: '[Patógeno ocular]',
		category: 'Ocular',
		isDisqualifying: false,
		confirmed: 0,
		inTreatment: 0,
		suspected: 3
	}
];

export interface PendingProtocolRow {
	id: string;
	protocolNumber: string;
	analysis: string;
	destination: string;
	pendingSamples: number;
	totalSamples: number;
	veterinarian: string;
	daysWaiting: number;
}

export const PENDING_PROTOCOLS: PendingProtocolRow[] = [
	{
		id: 'p1',
		protocolNumber: '[N° protocolo]',
		analysis: 'Acta de extracción · sangre',
		destination: 'Laboratorio externo',
		pendingSamples: 6,
		totalSamples: 6,
		veterinarian: 'MP [matrícula]',
		daysWaiting: 41
	},
	{
		id: 'p2',
		protocolNumber: '[N° protocolo]',
		analysis: 'Raspaje prepucial · toros',
		destination: 'Laboratorio externo',
		pendingSamples: 8,
		totalSamples: 8,
		veterinarian: 'MP [matrícula]',
		daysWaiting: 36
	},
	{
		id: 'p3',
		protocolNumber: '[N° protocolo]',
		analysis: 'Serología brucelosis',
		destination: 'Laboratorio externo',
		pendingSamples: 3,
		totalSamples: 10,
		veterinarian: 'MP [matrícula]',
		daysWaiting: 33
	},
	{
		id: 'p4',
		protocolNumber: '[N° protocolo]',
		analysis: 'Coproparasitológico',
		destination: 'In situ',
		pendingSamples: 4,
		totalSamples: 4,
		veterinarian: 'MP [matrícula]',
		daysWaiting: 19
	},
	{
		id: 'p5',
		protocolNumber: '[N° protocolo]',
		analysis: 'Raspaje prepucial · repaso',
		destination: 'Laboratorio externo',
		pendingSamples: 2,
		totalSamples: 2,
		veterinarian: 'MP [matrícula]',
		daysWaiting: 12
	}
];
export const PENDING_PROTOCOLS_REST = { protocols: 4, samples: 8 };

export interface BullActionRow {
	id: string;
	tag: string;
	reason: string;
	status: 'UNFIT' | 'IN_TREATMENT' | 'PENDING_EVALUATION';
}

export const BULLS_REQUIRING_ACTION: BullActionRow[] = [
	{ id: 'b1', tag: '[Caravana]', reason: 'Andrológico: motilidad espermática insuficiente', status: 'UNFIT' },
	{ id: 'b2', tag: '[Caravana]', reason: 'Lesión podal en tratamiento, reevaluar', status: 'IN_TREATMENT' },
	{ id: 'b3', tag: '[Caravana]', reason: 'Evaluación vence el 30/09', status: 'PENDING_EVALUATION' },
	{ id: 'b4', tag: '[Caravana]', reason: 'Ingresó el 02/09, nunca evaluado', status: 'PENDING_EVALUATION' }
];

export interface AndrologicalRow {
	id: string;
	tag: string;
	scrotalCm: number | null;
	bodyCondition: number | null;
	libido: 'BAJA' | 'MEDIA' | 'ALTA' | 'MUY_ALTA' | null;
	status: 'APT' | 'UNFIT' | 'IN_TREATMENT' | 'PENDING_EVALUATION';
}

export const ANDROLOGICAL: AndrologicalRow[] = [
	{ id: 'a1', tag: '[Caravana]', scrotalCm: 36.5, bodyCondition: 3.5, libido: 'ALTA', status: 'APT' },
	{ id: 'a2', tag: '[Caravana]', scrotalCm: 33.0, bodyCondition: 3.0, libido: 'MEDIA', status: 'APT' },
	{ id: 'a3', tag: '[Caravana]', scrotalCm: 29.5, bodyCondition: 2.5, libido: 'BAJA', status: 'UNFIT' },
	{ id: 'a4', tag: '[Caravana]', scrotalCm: null, bodyCondition: null, libido: null, status: 'PENDING_EVALUATION' }
];
