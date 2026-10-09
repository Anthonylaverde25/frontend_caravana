import { WidgetCategory, WidgetDefinition } from '../types/dashboard.types';
import { StockByBreedWidget, StockTotalWidget } from '../widgets/stock/StockKpiWidgets';
import { StockFemalesMatrixWidget } from '../widgets/stock/StockFemalesMatrixWidget';
import { StockMalesMatrixWidget } from '../widgets/stock/StockMalesMatrixWidget';
import { LabWorklistWidget, SiresWorklistWidget } from '../widgets/genetics/LiveWorklistWidgets';
import { DteStatusWidget } from '../widgets/dte/DteStatusWidget';
import { DteKpiWidget } from '../widgets/dte/DteKpiWidget';

export const WIDGET_CATEGORY_LABELS: Record<WidgetCategory, string> = {
	STOCK: 'Existencias',
	REPRODUCTIVE: 'Reproductivo',
	WEIGHTS: 'Pesos y recría',
	HEALTH: 'Sanidad y laboratorio',
	GENETICS_OPERATIONS: 'Operaciones y DTe'
};

const KPI_SIZES = { sizes: ['S' as const], defaultSize: 'S' as const };
const WIDE_SIZES = {
	sizes: ['M' as const, 'L' as const],
	defaultSize: 'M' as const,
	sizeHint: 'Necesita al menos 2 columnas.'
};
const TABLE_SIZES = {
	sizes: ['L' as const],
	defaultSize: 'L' as const,
	sizeHint: 'Las tablas ocupan el ancho completo.'
};

/**
 * Verified LIVE Widget Definitions.
 * Only widgets backed by real API endpoints (Laravel REST API) are registered here.
 */
export const WIDGET_DEFINITIONS: WidgetDefinition[] = [
	// ── Existencias (Live API · /caravans) ────────────────
	{
		id: 'stock-total',
		name: 'Existencias',
		description: 'Cabezas activas en la hacienda.',
		category: 'STOCK',
		...KPI_SIZES,
		source: 'API · /caravans',
		dataStatus: 'LIVE',
		component: StockTotalWidget
	},
	{
		id: 'stock-by-breed',
		name: 'Composición por raza',
		description: 'Cabezas por raza sobre el total del rodeo.',
		category: 'STOCK',
		...KPI_SIZES,
		source: 'API · /caravans',
		dataStatus: 'LIVE',
		component: StockByBreedWidget
	},
	{
		id: 'stock-females-matrix',
		name: 'Existencias · Hembras',
		description: 'Vacas, vaquillonas y terneras con barras de volumen y porcentaje sobre vientres.',
		category: 'STOCK',
		sizes: ['M' as const, 'L' as const],
		defaultSize: 'M' as const,
		minCols: 1,
		maxCols: 4,
		source: 'API · /caravans · caravans.sex = H',
		dataStatus: 'LIVE',
		component: StockFemalesMatrixWidget
	},
	{
		id: 'stock-males-matrix',
		name: 'Existencias · Machos',
		description: 'Novillos, novillitos, terneros y toros con barras de volumen y porcentaje sobre machos.',
		category: 'STOCK',
		sizes: ['M' as const, 'L' as const],
		defaultSize: 'M' as const,
		minCols: 1,
		maxCols: 4,
		source: 'API · /caravans · caravans.sex = M',
		dataStatus: 'LIVE',
		component: StockMalesMatrixWidget
	},

	// ── Operaciones & DTe (Live API · /entry-orders) ──────
	{
		id: 'ops-dte-kpi',
		name: 'Hacienda en tránsito (DTe)',
		description: 'Cabezas y documentos oficiales en viaje hacia el establecimiento.',
		category: 'GENETICS_OPERATIONS',
		...KPI_SIZES,
		source: 'API · /entry-orders',
		dataStatus: 'LIVE',
		component: DteKpiWidget
	},
	{
		id: 'ops-dte-status',
		name: 'Control y Estado de DTe',
		description: 'Contabilización de DTe, cabezas en tránsito y conciliación de caravanas.',
		category: 'GENETICS_OPERATIONS',
		...WIDE_SIZES,
		source: 'API · /entry-orders',
		dataStatus: 'LIVE',
		component: DteStatusWidget
	},

	// ── Genética & Asignación (Live API · /caravans/pending-sires)
	{
		id: 'genetics-sires-worklist',
		name: 'Asignación de padres',
		description: 'Terneros nacidos con padre pendiente y selector directo de toro.',
		category: 'GENETICS_OPERATIONS',
		...TABLE_SIZES,
		source: 'API · /caravans/pending-sires',
		dataStatus: 'LIVE',
		component: SiresWorklistWidget
	},

	// ── Sanidad & Laboratorio (Live API · /diagnostic-protocols)
	{
		id: 'health-lab-worklist',
		name: 'Bandeja de laboratorio',
		description: 'Protocolos de extracción y diagnóstico veterinario pendientes de resultados.',
		category: 'HEALTH',
		...TABLE_SIZES,
		source: 'API · /diagnostic-protocols',
		dataStatus: 'LIVE',
		component: LabWorklistWidget
	}
];

const BY_ID = new Map(WIDGET_DEFINITIONS.map((w) => [w.id, w]));

export function getWidgetDefinition(id: string): WidgetDefinition | undefined {
	return BY_ID.get(id);
}
