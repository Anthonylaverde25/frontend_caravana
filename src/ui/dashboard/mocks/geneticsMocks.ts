import { AlertItem } from '../components/primitives/AlertList';

/**
 * Static data for genetics and operations widgets.
 * Sources: caravan_lineages (father_id, sire_identification_method, birth_date), workdays.type.
 */
export const PENDING_SIRES = { total: 14, older30d: 4, recent: 10, oldestDays: 38, births: 214 };

export const SIRE_METHODS = {
	assigned: 200,
	rows: [
		{ method: 'operational', label: 'Servicio controlado', value: 142 },
		{ method: 'phenotype', label: 'Rasgos fenotípicos', value: 44 },
		{ method: 'lab_genetic', label: 'Laboratorio genético', value: 14 }
	]
};

export const PROGENY_BY_SIRE = [
	{ label: '[Toro A]', value: 38 },
	{ label: '[Toro B]', value: 34 },
	{ label: '[Toro C]', value: 29 },
	{ label: '[Toro D]', value: 24 },
	{ label: '[Toro E]', value: 21 },
	{ label: 'Otros 9 toros', value: 54, isRest: true }
];

/** WorkType: entry · update · exit, per week. */
export const FIELD_RECORDS = {
	weeks: ['27/07', '03/08', '10/08', '17/08', '24/08', '31/08', '07/09', '14/09'],
	entry: [12, 8, 0, 3, 0, 15, 6, 2],
	update: [30, 52, 41, 66, 48, 74, 58, 61],
	exit: [4, 2, 6, 1, 3, 5, 2, 4]
};

/** Cross-board summary. Each alert is derived from the state of another widget. */
export const ATTENTION_ITEMS: AlertItem[] = [
	{
		id: 'lab',
		tone: 'bad',
		title: '3 protocolos de laboratorio demorados',
		detail: 'Más de 30 días sin resultado · 17 muestras',
		sourceLabel: 'Sanidad',
		href: '/gestation/diagnostic-protocols'
	},
	{
		id: 'bulls',
		tone: 'bad',
		title: '2 toros con patógeno descalificante',
		detail: 'Fuera de servicio hasta el alta del diagnóstico',
		sourceLabel: 'Sanidad'
	},
	{
		id: 'weights',
		tone: 'warn',
		title: 'Pesos desactualizados en Recría Macho 1',
		detail: 'Último pesaje hace 52 días (28/07)',
		sourceLabel: 'Recría'
	},
	{
		id: 'sires',
		tone: 'warn',
		title: '14 terneros sin padre asignado',
		detail: 'El más antiguo espera hace 38 días',
		sourceLabel: 'Genética'
	},
	{
		id: 'check',
		tone: 'info',
		title: 'Tacto del Lote 03 programado',
		detail: '25/09 · 88 vientres · completa la preñez 2025/26',
		sourceLabel: 'Reproductivo'
	}
];
