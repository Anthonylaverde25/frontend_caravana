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
	{ value: 'SERVICE', label: 'Servicio / Entore', helper: 'Lotes de entore y vientres en servicio' },
	{ value: 'GROWING_REPLACEMENT_FEMALES', label: 'Vientres de Reposición', helper: 'Vaquillonas y terneras de reposición' },
	{ value: 'GROWING_HEIFERS', label: 'Vaquillonas de Recría', helper: 'Recría de hembras' },
	{ value: 'GROWING_STEERS', label: 'Novillitos de Recría', helper: 'Recría de machos e invernada' },
	{ value: 'WEANING', label: 'Lote de Destete', helper: 'Lotes de destete activo' }
];

const TEMPLATE_SLOTS: Record<Exclude<BoardTemplateType, 'BLANK' | 'PASTURE'>, TemplateSlot[]> = {
	GENERAL: [
		['stock-total', 'S'],
		['stock-by-breed', 'S'],
		['ops-dte-kpi', 'S'],
		['stock-females-matrix', 'M'],
		['stock-males-matrix', 'M'],
		['ops-dte-status', 'M'],
		['genetics-sires-worklist', 'L'],
		['health-lab-worklist', 'L']
	],
	REPRODUCTIVE: [
		['genetics-sires-worklist', 'L']
	],
	WEIGHTS: [],
	HEALTH: [
		['health-lab-worklist', 'L']
	]
};

export function newInstanceId(): string {
	return `w_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function buildTemplateWidgets(template: BoardTemplateType): BoardWidgetInstance[] {
	if (template === 'BLANK' || template === 'PASTURE') return [];

	return (TEMPLATE_SLOTS[template] ?? []).map(([widgetId, size, config], index) => ({
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
		description: `${TEMPLATE_SLOTS.GENERAL.length} widgets reales · existencias, razas, DTe y operaciones`
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
