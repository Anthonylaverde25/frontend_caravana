import { WidgetCategory, WidgetDefinition } from '../types/dashboard.types';
import { StockByBreedWidget, StockTotalWidget } from '../widgets/stock/StockKpiWidgets';
import { StockBalanceWidget } from '../widgets/stock/StockBalanceWidget';
import { DentitionWidget, StockByCategoryWidget, StockTrendWidget } from '../widgets/stock/StockChartWidgets';
import { ActiveBatchesWidget } from '../widgets/stock/ActiveBatchesWidget';
import {
	BullRatioWidget,
	EmptyAtCheckWidget,
	HeadOfCalvingWidget,
	PregnancyRateWidget
} from '../widgets/reproductive/ReproductiveKpiWidgets';
import { CalvingsProgressWidget, WeaningRateWidget } from '../widgets/reproductive/ReproductiveOutcomeWidgets';
import {
	BullRatioByBatchWidget,
	GestationLossesWidget,
	ServiceOrdersWidget
} from '../widgets/reproductive/ReproductiveSmallWidgets';
import {
	CalvingsByWeekWidget,
	PregnancyByCampaignWidget,
	ReproductiveFunnelWidget
} from '../widgets/reproductive/ReproductiveChartWidgets';
import {
	PhysiologicalStateWidget,
	PregnancyByThirdWidget
} from '../widgets/reproductive/ReproductiveCompositionWidgets';
import { ServiceBatchesWidget } from '../widgets/reproductive/ServiceBatchesWidget';
import {
	AdpvWidget,
	BackgroundingKgWidget,
	WeaningWeightWidget,
	WeightFreshnessWidget
} from '../widgets/weights/WeightsKpiWidgets';
import {
	WeightChangeBreakdownWidget,
	WeightCurveWidget,
	WeightDispersionWidget,
	WeightVsTargetWidget
} from '../widgets/weights/WeightsAnalysisWidgets';
import { AdpvByBatchWidget, BackgroundingBatchesWidget } from '../widgets/weights/BackgroundingBatchesWidgets';
import {
	ActiveDiagnosesWidget,
	BullAptitudeWidget,
	LabPendingWidget,
	MortalityWidget,
	TurnaroundWidget
} from '../widgets/health/HealthKpiWidgets';
import { ColdChainWidget, ProtocolSourcesWidget, SamplesByTypeWidget } from '../widgets/health/HealthTraceWidgets';
import {
	AndrologicalWidget,
	BullsRequiringActionWidget,
	DiagnosesByPathogenWidget,
	PendingProtocolsWidget
} from '../widgets/health/HealthTableWidgets';
import {
	AttentionWidget,
	FieldRecordsWidget,
	PendingSiresKpiWidget,
	ProgenyBySireWidget,
	SireMethodWidget
} from '../widgets/genetics/GeneticsWidgets';
import { LabWorklistWidget, SiresWorklistWidget } from '../widgets/genetics/LiveWorklistWidgets';
import { SUBCATEGORY_OPTIONS } from '../mocks/weightsMocks';

export const WIDGET_CATEGORY_LABELS: Record<WidgetCategory, string> = {
	STOCK: 'Existencias',
	REPRODUCTIVE: 'Reproductivo',
	WEIGHTS: 'Pesos y recría',
	HEALTH: 'Sanidad y laboratorio',
	GENETICS_OPERATIONS: 'Genética y operación'
};

const MOCK = 'STATIC_MOCK' as const;
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

export const WIDGET_DEFINITIONS: WidgetDefinition[] = [
	// ── Existencias
	{
		id: 'stock-total',
		name: 'Existencias',
		description: 'Cabezas activas y variación a 30 días.',
		category: 'STOCK',
		...KPI_SIZES,
		source: 'caravans · caravan_movements',
		dataStatus: MOCK,
		component: StockTotalWidget
	},
	{
		id: 'stock-balance',
		name: 'Balance de existencias',
		description: 'Nacimientos, ingresos, egresos, bajas y consumo.',
		category: 'STOCK',
		...WIDE_SIZES,
		source: 'caravan_movements · caravan_lineages · batches (INTERNAL_DEATH, INTERNAL_CONSUMPTION)',
		dataStatus: MOCK,
		component: StockBalanceWidget
	},
	{
		id: 'stock-by-category',
		name: 'Existencias por categoría',
		description: 'Por categoría o por lote, de mayor a menor.',
		category: 'STOCK',
		...WIDE_SIZES,
		source: 'caravans.category_id · batch_id',
		dataStatus: MOCK,
		component: StockByCategoryWidget
	},
	{
		id: 'stock-trend',
		name: 'Evolución de existencias',
		description: 'Cabezas a fin de mes, con los eventos rotulados.',
		category: 'STOCK',
		...WIDE_SIZES,
		source: 'caravan_movements',
		dataStatus: MOCK,
		component: StockTrendWidget
	},
	{
		id: 'stock-by-breed',
		name: 'Composición por raza',
		description: 'Cabezas por raza sobre el total.',
		category: 'STOCK',
		...KPI_SIZES,
		source: 'caravans.breed_id · breeds',
		dataStatus: MOCK,
		component: StockByBreedWidget
	},
	{
		id: 'stock-dentition',
		name: 'Dentición de los vientres',
		description: 'Vientres por dentición para planificar la reposición.',
		category: 'STOCK',
		...WIDE_SIZES,
		source: 'caravans.teeth',
		dataStatus: MOCK,
		component: DentitionWidget
	},
	{
		id: 'stock-active-batches',
		name: 'Lotes activos',
		description: 'Tipo, manejo, cabezas y cobertura de pesaje.',
		category: 'STOCK',
		...TABLE_SIZES,
		source: 'batches · batch_types',
		dataStatus: MOCK,
		component: ActiveBatchesWidget
	},
	{
		id: 'stock-carrying-capacity',
		name: 'Carga animal (EV/ha)',
		description: 'Equivalentes vaca por hectárea contra la receptividad.',
		category: 'STOCK',
		...KPI_SIZES,
		source: '—',
		dataStatus: 'REQUIRES_NEW_DATA',
		missingData: 'Superficie por potrero y asignación de lotes a potreros.'
	},
	{
		id: 'stock-kg-per-ha',
		name: 'Kilos producidos por hectárea',
		description: 'Kilos de carne por hectárea y por año.',
		category: 'STOCK',
		...WIDE_SIZES,
		source: '—',
		dataStatus: 'REQUIRES_NEW_DATA',
		missingData: 'Superficie por potrero.'
	},

	// ── Reproductivo
	{
		id: 'repro-pregnancy-rate',
		name: 'Preñez por tacto',
		description: 'Preñadas sobre vientres con tacto.',
		category: 'REPRODUCTIVE',
		...KPI_SIZES,
		source: 'caravan_gestations · service_orders',
		dataStatus: MOCK,
		component: PregnancyRateWidget
	},
	{
		id: 'repro-head-of-calving',
		name: 'Cabeza de parición',
		description: 'Preñeces de los primeros 21 días.',
		category: 'REPRODUCTIVE',
		...KPI_SIZES,
		source: 'caravan_gestations.gestation_stage',
		dataStatus: MOCK,
		component: HeadOfCalvingWidget
	},
	{
		id: 'repro-empty-at-check',
		name: 'Vacías al tacto',
		description: 'Vacías secas y con cría al pie.',
		category: 'REPRODUCTIVE',
		...KPI_SIZES,
		source: 'female_caravan_details.is_empty · caravan_lineages.is_nursing',
		dataStatus: MOCK,
		component: EmptyAtCheckWidget
	},
	{
		id: 'repro-bull-ratio',
		name: 'Relación toro:vientre',
		description: 'Contra el rango de referencia INTA 3–7 %.',
		category: 'REPRODUCTIVE',
		...KPI_SIZES,
		source: 'caravans (toros y vientres en servicio)',
		dataStatus: MOCK,
		component: BullRatioWidget
	},
	{
		id: 'repro-bull-ratio-by-batch',
		name: 'Toros por cada 100 vientres',
		description: 'Real contra el objetivo de cada lote de servicio.',
		category: 'REPRODUCTIVE',
		...KPI_SIZES,
		source: 'service_batch_details.target_bull_ratio',
		dataStatus: MOCK,
		component: BullRatioByBatchWidget
	},
	{
		id: 'repro-weaning-rate',
		name: 'Destete',
		description: 'Destetados sobre vientres expuestos.',
		category: 'REPRODUCTIVE',
		...KPI_SIZES,
		source: 'caravan_movements (WEANING) · service_orders',
		dataStatus: MOCK,
		component: WeaningRateWidget
	},
	{
		id: 'repro-calvings-progress',
		name: 'Pariciones de la campaña',
		description: 'Nacidos contra esperados a la fecha.',
		category: 'REPRODUCTIVE',
		...KPI_SIZES,
		source: 'caravan_gestations.estimated_due_date · caravan_lineages.birth_date',
		dataStatus: MOCK,
		component: CalvingsProgressWidget
	},
	{
		id: 'repro-gestation-losses',
		name: 'Pérdidas de gestación',
		description: 'Gestaciones perdidas por motivo.',
		category: 'REPRODUCTIVE',
		...KPI_SIZES,
		source: 'caravan_gestations.loss_reason_id',
		dataStatus: MOCK,
		component: GestationLossesWidget
	},
	{
		id: 'repro-service-orders',
		name: 'Órdenes de servicio',
		description: 'Órdenes por estado.',
		category: 'REPRODUCTIVE',
		...KPI_SIZES,
		source: 'service_orders.status',
		dataStatus: MOCK,
		component: ServiceOrdersWidget
	},
	{
		id: 'repro-funnel',
		name: 'Embudo reproductivo',
		description: 'Expuestas → preñadas → paridas → destetadas.',
		category: 'REPRODUCTIVE',
		...WIDE_SIZES,
		source: 'service_orders · caravan_gestations · caravan_lineages · caravan_movements',
		dataStatus: MOCK,
		component: ReproductiveFunnelWidget
	},
	{
		id: 'repro-pregnancy-by-campaign',
		name: 'Preñez por campaña',
		description: 'Serie histórica, con la campaña en curso parcial.',
		category: 'REPRODUCTIVE',
		...WIDE_SIZES,
		source: 'caravan_gestations · service_orders',
		dataStatus: MOCK,
		component: PregnancyByCampaignWidget
	},
	{
		id: 'repro-pregnancy-by-third',
		name: 'Preñez por tercio',
		description: 'Cabeza, cuerpo y cola por lote.',
		category: 'REPRODUCTIVE',
		...WIDE_SIZES,
		source: 'caravan_gestations.gestation_stage',
		dataStatus: MOCK,
		component: PregnancyByThirdWidget
	},
	{
		id: 'repro-physiological-state',
		name: 'Estado fisiológico de los vientres',
		description: 'Preñez y lactancia combinadas.',
		category: 'REPRODUCTIVE',
		...WIDE_SIZES,
		source: 'female_caravan_details · caravan_gestations · caravan_lineages',
		dataStatus: MOCK,
		component: PhysiologicalStateWidget
	},
	{
		id: 'repro-calvings-by-week',
		name: 'Pariciones esperadas vs. registradas',
		description: 'Por semana de fecha probable de parto.',
		category: 'REPRODUCTIVE',
		...WIDE_SIZES,
		source: 'caravan_gestations.estimated_due_date · caravan_lineages.birth_date',
		dataStatus: MOCK,
		component: CalvingsByWeekWidget
	},
	{
		id: 'repro-service-batches',
		name: 'Lotes de servicio',
		description: 'Preñez, cabeza y vacías por lote.',
		category: 'REPRODUCTIVE',
		...TABLE_SIZES,
		source: 'service_batch_details · caravan_gestations',
		dataStatus: MOCK,
		component: ServiceBatchesWidget
	},

	// ── Pesos y recría
	{
		id: 'weights-adpv',
		name: 'ADPV',
		description: 'Ganancia diaria contra el período anterior.',
		category: 'WEIGHTS',
		...KPI_SIZES,
		source: 'caravan_weights',
		dataStatus: MOCK,
		component: AdpvWidget,
		configFields: [
			{
				key: 'group',
				label: 'Grupo',
				required: true,
				helper: 'Se promedia sólo entre animales pesados en ambas fechas.',
				options: [
					{ value: 'FEMALE', label: 'Recría hembra' },
					{ value: 'MALE', label: 'Recría macho' }
				]
			}
		]
	},
	{
		id: 'weights-weaning-weight',
		name: 'Peso al destete',
		description: 'Contra la referencia INTA 160–190 kg.',
		category: 'WEIGHTS',
		...KPI_SIZES,
		source: 'caravan_weights · caravan_movements (WEANING)',
		dataStatus: MOCK,
		component: WeaningWeightWidget
	},
	{
		id: 'weights-backgrounding-kg',
		name: 'Kilos en recría',
		description: 'Kilos totales por sexo.',
		category: 'WEIGHTS',
		...KPI_SIZES,
		source: 'batches.total_weight',
		dataStatus: MOCK,
		component: BackgroundingKgWidget
	},
	{
		id: 'weights-freshness',
		name: 'Vigencia de los pesos',
		description: 'Cobertura de pesaje y antigüedad del dato.',
		category: 'WEIGHTS',
		...KPI_SIZES,
		source: 'batches.weighed_count · batch_weights.weights_as_of',
		dataStatus: MOCK,
		component: WeightFreshnessWidget
	},
	{
		id: 'weights-change-breakdown',
		name: '¿Por qué cambió el promedio?',
		description: 'Crecimiento real vs. efecto de composición.',
		category: 'WEIGHTS',
		sizes: ['S', 'M'],
		defaultSize: 'M',
		source: 'batch_weights (CONTROL · MOVEMENT_IN · MOVEMENT_OUT)',
		dataStatus: MOCK,
		component: WeightChangeBreakdownWidget
	},
	{
		id: 'weights-dispersion',
		name: 'Dispersión dentro del lote',
		description: 'Mínimo, promedio y máximo por lote.',
		category: 'WEIGHTS',
		sizes: ['S', 'M'],
		defaultSize: 'S',
		source: 'batches.min_weight · current_weight · max_weight',
		dataStatus: MOCK,
		component: WeightDispersionWidget
	},
	{
		id: 'weights-batch-curve',
		name: 'Curva de peso del lote',
		description: 'Promedio por pesaje con saltos de composición.',
		category: 'WEIGHTS',
		...WIDE_SIZES,
		source: 'batch_weights',
		dataStatus: MOCK,
		component: WeightCurveWidget
	},
	{
		id: 'weights-vs-target',
		name: 'Peso vs. objetivo de subcategoría',
		description: 'Cuántos animales alcanzan el peso objetivo.',
		category: 'WEIGHTS',
		...WIDE_SIZES,
		sizeHint: 'El histograma necesita al menos 2 columnas.',
		source: 'caravan_weights · animal_subcategories.target_weight_min / max',
		dataStatus: MOCK,
		component: WeightVsTargetWidget,
		configFields: [
			{
				key: 'subcategory',
				label: 'Subcategoría',
				required: true,
				helper: 'El tablero no la define, por eso se pide.',
				options: SUBCATEGORY_OPTIONS
			}
		]
	},
	{
		id: 'weights-adpv-by-batch',
		name: 'ADPV por lote',
		description: 'Ranking de lotes en una escala común.',
		category: 'WEIGHTS',
		...WIDE_SIZES,
		source: 'caravan_weights · batches',
		dataStatus: MOCK,
		component: AdpvByBatchWidget
	},
	{
		id: 'weights-backgrounding-batches',
		name: 'Lotes de recría',
		description: 'Kilos, ADPV y vigencia por lote.',
		category: 'WEIGHTS',
		...TABLE_SIZES,
		source: 'batches · batch_weights · caravan_weights',
		dataStatus: MOCK,
		component: BackgroundingBatchesWidget
	},

	// ── Sanidad y laboratorio
	{
		id: 'health-lab-pending',
		name: 'Laboratorio en espera',
		description: 'Protocolos con muestras sin resultado.',
		category: 'HEALTH',
		...KPI_SIZES,
		source: 'diagnostic_protocols · bull_lab_samples',
		dataStatus: MOCK,
		component: LabPendingWidget
	},
	{
		id: 'health-bull-aptitude',
		name: 'Toros aptos',
		description: 'Aptitud reproductiva por estado.',
		category: 'HEALTH',
		...KPI_SIZES,
		source: 'bull_health_evaluations.status',
		dataStatus: MOCK,
		component: BullAptitudeWidget
	},
	{
		id: 'health-active-diagnoses',
		name: 'Diagnósticos activos',
		description: 'Casos abiertos y descalificantes.',
		category: 'HEALTH',
		...KPI_SIZES,
		source: 'veterinary_diagnoses · pathogens',
		dataStatus: MOCK,
		component: ActiveDiagnosesWidget
	},
	{
		id: 'health-mortality',
		name: 'Mortandad',
		description: 'Bajas sobre la existencia media de 12 meses.',
		category: 'HEALTH',
		...KPI_SIZES,
		source: 'caravan_movements (TRANSFER a lotes INTERNAL_DEATH)',
		dataStatus: MOCK,
		component: MortalityWidget
	},
	{
		id: 'health-turnaround',
		name: 'Tiempo hasta el resultado',
		description: 'Mediana de días de laboratorio.',
		category: 'HEALTH',
		...KPI_SIZES,
		source: 'bull_lab_samples (sample_date, result_date)',
		dataStatus: MOCK,
		component: TurnaroundWidget
	},
	{
		id: 'health-cold-chain',
		name: 'Cadena de frío',
		description: 'Envíos de muestras con incidencias.',
		category: 'HEALTH',
		...KPI_SIZES,
		source: 'sample_shipments.cold_chain_ok',
		dataStatus: MOCK,
		component: ColdChainWidget
	},
	{
		id: 'health-protocol-sources',
		name: 'Origen de los protocolos',
		description: 'Portal veterinario o digitalizado.',
		category: 'HEALTH',
		...KPI_SIZES,
		source: 'diagnostic_protocols (source_channel, verification_status)',
		dataStatus: MOCK,
		component: ProtocolSourcesWidget
	},
	{
		id: 'health-samples-by-type',
		name: 'Muestras por tipo y resultado',
		description: 'Negativas, positivas y pendientes.',
		category: 'HEALTH',
		...WIDE_SIZES,
		source: 'bull_lab_samples (sample_type, status)',
		dataStatus: MOCK,
		component: SamplesByTypeWidget
	},
	{
		id: 'health-diagnoses-by-pathogen',
		name: 'Diagnósticos por patógeno',
		description: 'Casos abiertos y si descalifican.',
		category: 'HEALTH',
		...WIDE_SIZES,
		source: 'veterinary_diagnoses · pathogens.is_disqualifying',
		dataStatus: MOCK,
		component: DiagnosesByPathogenWidget
	},
	{
		id: 'health-bulls-action',
		name: 'Toros que requieren acción',
		description: 'No aptos o sin evaluación vigente.',
		category: 'HEALTH',
		...WIDE_SIZES,
		source: 'bull_health_evaluations',
		dataStatus: MOCK,
		component: BullsRequiringActionWidget
	},
	{
		id: 'health-andrological',
		name: 'Evaluación andrológica',
		description: 'CE, condición corporal, libido y estado.',
		category: 'HEALTH',
		...WIDE_SIZES,
		source: 'bull_health_evaluations',
		dataStatus: MOCK,
		component: AndrologicalWidget
	},
	{
		id: 'health-pending-protocols',
		name: 'Protocolos pendientes',
		description: 'Ordenados por días de espera.',
		category: 'HEALTH',
		...TABLE_SIZES,
		source: 'diagnostic_protocols · bull_lab_samples · lab_report_details',
		dataStatus: MOCK,
		component: PendingProtocolsWidget
	},
	{
		id: 'health-lab-worklist',
		name: 'Bandeja de laboratorio',
		description: 'Protocolos pendientes con acciones (datos reales).',
		category: 'HEALTH',
		...TABLE_SIZES,
		source: 'API · diagnostic protocols',
		dataStatus: 'LIVE',
		component: LabWorklistWidget
	},
	{
		id: 'health-sanitary-calendar',
		name: 'Calendario sanitario',
		description: 'Intervenciones del plan y su cumplimiento.',
		category: 'HEALTH',
		...WIDE_SIZES,
		source: '—',
		dataStatus: 'REQUIRES_NEW_DATA',
		missingData: 'Plan sanitario con intervenciones por categoría y registro de aplicaciones.'
	},

	// ── Genética y operación
	{
		id: 'genetics-pending-sires',
		name: 'Padres sin asignar',
		description: 'Terneros sin padre y antigüedad.',
		category: 'GENETICS_OPERATIONS',
		...KPI_SIZES,
		source: 'caravan_lineages.father_id',
		dataStatus: MOCK,
		component: PendingSiresKpiWidget
	},
	{
		id: 'genetics-sire-method',
		name: 'Método de identificación del padre',
		description: 'Confianza del pedigree.',
		category: 'GENETICS_OPERATIONS',
		...KPI_SIZES,
		source: 'caravan_lineages.sire_identification_method',
		dataStatus: MOCK,
		component: SireMethodWidget
	},
	{
		id: 'genetics-progeny-by-sire',
		name: 'Terneros por padre',
		description: 'Detecta toros que sirvieron poco.',
		category: 'GENETICS_OPERATIONS',
		...WIDE_SIZES,
		source: 'caravan_lineages.father_id',
		dataStatus: MOCK,
		component: ProgenyBySireWidget
	},
	{
		id: 'genetics-sires-worklist',
		name: 'Asignación de padres',
		description: 'Terneros pendientes con asignación (datos reales).',
		category: 'GENETICS_OPERATIONS',
		...TABLE_SIZES,
		source: 'API · caravans pending sires',
		dataStatus: 'LIVE',
		component: SiresWorklistWidget
	},
	{
		id: 'ops-field-records',
		name: 'Registros de campo por semana',
		description: 'Planillas procesadas por tipo.',
		category: 'GENETICS_OPERATIONS',
		...WIDE_SIZES,
		source: 'workdays.type',
		dataStatus: MOCK,
		component: FieldRecordsWidget
	},
	{
		id: 'ops-attention',
		name: 'Requiere atención',
		description: 'Alertas de todos los tableros.',
		category: 'GENETICS_OPERATIONS',
		...WIDE_SIZES,
		source: 'Reglas sobre los demás widgets',
		dataStatus: MOCK,
		component: AttentionWidget
	}
];

const BY_ID = new Map(WIDGET_DEFINITIONS.map((w) => [w.id, w]));

export function getWidgetDefinition(id: string): WidgetDefinition | undefined {
	return BY_ID.get(id);
}
