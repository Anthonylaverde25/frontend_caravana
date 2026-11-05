import type { CaravanSummary } from '@/core/caravans/domain/entities/CaravanSummary';

/** Route parameter for the caravans in no batch. */
export const UNASSIGNED_BATCH = 'unassigned';

/** DOM anchor of the unassigned row, the target of its KPI. */
export const UNASSIGNED_ANCHOR = 'sin-lote';

/** Caravans shown when a batch row expands. */
export const RECENT_COUNT = 10;

/** Tone of a batch under service. */
export const SERVICE_COLOR = '#C2410C';

/**
 * The batch page. With a caravan, it opens filtered to its tag and with its row highlighted, so it is
 * found whatever page it would fall on.
 */
export function herdBatchPath(
	batchId: number | typeof UNASSIGNED_BATCH,
	caravan?: Pick<CaravanSummary, 'id' | 'identification'>
): string {
	if (!caravan) return `/herd/batches/${batchId}`;

	// An untagged calf has no tag to filter by: the highlighted row is enough.
	const params = new URLSearchParams({ caravan: String(caravan.id), q: caravan.identification ?? '' });
	return `/herd/batches/${batchId}?${params.toString()}`;
}

/** "—" for an aggregate over nothing: an empty set has no value, and 0 would invent one. */
export const EMPTY_VALUE = '—';

/** Weights are recorded to one decimal: fewer digits would turn 35,5 kg into 36. Whole values print without ",0". */
export function formatKg(value: number | null | undefined, digits = 1): string {
	if (value === null || value === undefined) return EMPTY_VALUE;

	return `${value.toLocaleString('es-AR', { maximumFractionDigits: digits })} kg`;
}

/**
 * Whether the weights of a batch span several categories. Then its average describes no animal (a
 * cow at 450 kg and a calf at 108 kg make 279 kg), so the views show each category and the total mass.
 */
export const hasMixedWeights = (batch: { weighed_category_count?: number | null }) =>
	(batch.weighed_category_count ?? 0) > 1;

/** "2 toros en servicio": bulls passing through, which is what keeps them out of the batch figures. */
export const bullsOnServiceLabel = (count: number) =>
	count === 1 ? '1 toro en servicio' : `${count} toros en servicio`;

/** The head of a batch with bulls on service: stock is one number, its herd and the bulls two parts. */
export const headBreakdownHint = (batch: { head_count: number; bulls_on_service_count: number }) =>
	`${batch.head_count - batch.bulls_on_service_count} del lote + ${bullsOnServiceLabel(batch.bulls_on_service_count)}`;

export function formatDate(value: string | null | undefined): string {
	if (!value) return EMPTY_VALUE;

	const [year, month, day] = value.slice(0, 10).split('-');
	return day && month && year ? `${day}/${month}/${year}` : value;
}

export function formatPercent(part: number, total: number): string {
	if (total <= 0) return EMPTY_VALUE;

	return `${Math.round((part / total) * 100)}%`;
}

export const sexLabel = (sex: CaravanSummary['sex']): string => (sex === 'M' ? 'Macho' : 'Hembra');

export function gestationLabel(status: CaravanSummary['gestation_status']): string | null {
	if (status === 'PREGNANT') return 'Preñada';

	if (status === 'NONE') return 'Sin preñez';

	return null;
}

/** Deep link to the document an alert points at: every order list opens one by ?orderId=. */
const ORDER_ROUTES: Record<string, string> = {
	entry_order: '/entry-orders',
	birth_order: '/birth-orders',
	transfer_order: '/transfer-orders',
	weaning_order: '/weaning-orders',
	service_order: '/gestation/service-orders'
};

export function orderLink(kind: string, id: number): string | null {
	const base = ORDER_ROUTES[kind];
	return base ? `${base}?orderId=${id}` : null;
}
