import {
	BatchTypeCode,
	BoardScope,
	BoardTemplateType,
	BoardWidgetInstance,
	DashboardBoard,
	WidgetSize
} from '../types/dashboard.types';

type TemplateSlot = [widgetId: string, size: WidgetSize, config?: Record<string, string>];

export const CURRENT_CAMPAIGN = '2025/26';
export const CAMPAIGN_OPTIONS = ['2025/26', '2024/25', '2023/24'];

/** Batch types from the tenant catalog that make sense as a board scope. */
export const BATCH_TYPE_SCOPE_OPTIONS: { value: BatchTypeCode; label: string; helper: string }[] = [
	{ value: 'SERVICE', label: 'Servicio / Entore', helper: '3 lotes activos · 500 vientres' },
	{ value: 'GROWING_REPLACEMENT_FEMALES', label: 'Vientres de Reposición', helper: '2 lotes activos · 92 animales' },
	{ value: 'GROWING_HEIFERS', label: 'Vaquillonas de Recría', helper: '1 lote activo · 146 animales' },
	{ value: 'GROWING_STEERS', label: 'Novillitos de Recría', helper: '2 lotes activos · 168 animales' },
	{ value: 'WEANING', label: 'Lote de Destete', helper: 'Sin lotes activos' }
];

const TEMPLATE_SLOTS: Record<Exclude<BoardTemplateType, 'BLANK' | 'PASTURE'>, TemplateSlot[]> = {
	GENERAL: [
		['stock-total', 'S'],
		['repro-pregnancy-rate', 'S'],
		['repro-weaning-rate', 'S'],
		['repro-calvings-progress', 'S'],
		['repro-funnel', 'M'],
		['stock-by-category', 'M'],
		['ops-attention', 'M'],
		['stock-trend', 'M']
	],
	REPRODUCTIVE: [
		['repro-pregnancy-rate', 'S'],
		['repro-head-of-calving', 'S'],
		['repro-empty-at-check', 'S'],
		['repro-bull-ratio', 'S'],
		['repro-pregnancy-by-campaign', 'M'],
		['repro-pregnancy-by-third', 'M'],
		['repro-service-batches', 'L'],
		['genetics-sires-worklist', 'L']
	],
	WEIGHTS: [
		['weights-adpv', 'S', { group: 'FEMALE' }],
		['weights-adpv', 'S', { group: 'MALE' }],
		['weights-weaning-weight', 'S'],
		['weights-backgrounding-kg', 'S'],
		['weights-batch-curve', 'L'],
		['weights-change-breakdown', 'M'],
		['weights-adpv-by-batch', 'M'],
		['weights-backgrounding-batches', 'L']
	],
	HEALTH: [
		['health-lab-pending', 'S'],
		['health-bull-aptitude', 'S'],
		['health-active-diagnoses', 'S'],
		['health-mortality', 'S'],
		['health-pending-protocols', 'L'],
		['health-bulls-action', 'M'],
		['health-diagnoses-by-pathogen', 'M'],
		['health-lab-worklist', 'L']
	]
};

export function newInstanceId(): string {
	return `w_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function buildTemplateWidgets(template: BoardTemplateType): BoardWidgetInstance[] {
	if (template === 'BLANK' || template === 'PASTURE') return [];

	return TEMPLATE_SLOTS[template].map(([widgetId, size, config], index) => ({
		instanceId: `${template.toLowerCase()}_${index}_${widgetId}`,
		widgetId,
		size,
		config
	}));
}

const DEFAULT_SCOPE: BoardScope = { campaign: CURRENT_CAMPAIGN, batchTypeCode: null };

export const SYSTEM_BOARDS: DashboardBoard[] = [
	{
		id: 'sys_general',
		name: 'General',
		icon: 'heroicons-outline:squares-2x2',
		isSystem: true,
		scope: DEFAULT_SCOPE,
		widgets: buildTemplateWidgets('GENERAL')
	},
	{
		id: 'sys_reproductive',
		name: 'Reproductivo',
		icon: 'heroicons-outline:heart',
		isSystem: true,
		scope: DEFAULT_SCOPE,
		widgets: buildTemplateWidgets('REPRODUCTIVE')
	},
	{
		id: 'sys_weights',
		name: 'Recría y pesos',
		icon: 'heroicons-outline:scale',
		isSystem: true,
		scope: DEFAULT_SCOPE,
		widgets: buildTemplateWidgets('WEIGHTS')
	},
	{
		id: 'sys_health',
		name: 'Sanidad',
		icon: 'heroicons-outline:shield-check',
		isSystem: true,
		scope: DEFAULT_SCOPE,
		widgets: buildTemplateWidgets('HEALTH')
	}
];

export interface BoardStartOption {
	value: BoardTemplateType;
	label: string;
	description: string;
	disabledReason?: string;
}

export const BOARD_START_OPTIONS: BoardStartOption[] = [
	{ value: 'BLANK', label: 'En blanco', description: 'Empezás vacío y agregás los widgets que quieras.' },
	{
		value: 'GENERAL',
		label: 'Copia de “General”',
		description: `${TEMPLATE_SLOTS.GENERAL.length} widgets · existencias, preñez, pariciones`
	},
	{
		value: 'REPRODUCTIVE',
		label: 'Copia de “Reproductivo”',
		description: `${TEMPLATE_SLOTS.REPRODUCTIVE.length} widgets · tacto, tercios, lotes de servicio`
	},
	{
		value: 'WEIGHTS',
		label: 'Copia de “Recría y pesos”',
		description: `${TEMPLATE_SLOTS.WEIGHTS.length} widgets · ADPV, curva, vigencia`
	},
	{
		value: 'HEALTH',
		label: 'Copia de “Sanidad”',
		description: `${TEMPLATE_SLOTS.HEALTH.length} widgets · laboratorio, toros, mortandad`
	},
	{
		value: 'PASTURE',
		label: 'Pasturas',
		description: 'Carga animal y rotación de potreros.',
		disabledReason: 'Requiere superficie de potreros en el sistema'
	}
];

export const BOARD_NAME_MAX = 40;

export const BOARD_ICON_OPTIONS = [
	'heroicons-outline:chart-bar',
	'heroicons-outline:chart-pie',
	'heroicons-outline:presentation-chart-line',
	'heroicons-outline:heart',
	'heroicons-outline:scale',
	'heroicons-outline:beaker',
	'heroicons-outline:user-group',
	'heroicons-outline:rectangle-group'
];
