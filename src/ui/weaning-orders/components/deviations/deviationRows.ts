import type { WeaningDeviation, WeaningDeviationKind, WeaningOrderStatus } from '@/features/weaning-orders/types';

/** One line of the audit table: a calf, or the calves of an order late or left by the same fact. */
export interface DeviationRow {
  key: string;
  ids: number[];
  caravanIds: number[];
  kind: WeaningDeviationKind;
  kindLabel: string;
  /** The tag, or "4 crías" for a grouped line. */
  title: string;
  caption: string;
  planned: string | null;
  actual: string | null;
  occurredAt: string;
  recordedBy: string | null;
  reviewed: boolean;
  reviewNote: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
}

export interface DeviationOrderGroup {
  orderId: number;
  code: string;
  status: WeaningOrderStatus | null;
  rows: DeviationRow[];
  pending: number;
}

export type ReviewFilter = 'pending' | 'reviewed' | 'all';

export type PeriodFilter = '30' | '90' | '365' | 'all';

/** Late and not weaned are facts of the order, shown once for all the calves they touch. */
const GROUPED: WeaningDeviationKind[] = ['LATE', 'NOT_WEANED'];

const sexLabel = (sex: string | null): string => (sex === 'M' ? 'Macho' : sex === 'H' ? 'Hembra' : '');

const toRow = (items: WeaningDeviation[]): DeviationRow => {
  const first = items[0];
  const grouped = items.length > 1;

  return {
    key: items.map((d) => d.id).join('-'),
    ids: items.map((d) => d.id),
    caravanIds: items.map((d) => d.caravan_id),
    kind: first.kind,
    kindLabel: first.kind_label,
    title: grouped ? `${items.length} crías` : (first.identification ?? `#${first.caravan_id}`),
    caption: grouped
      ? items.map((d) => d.identification ?? `#${d.caravan_id}`).join(' · ')
      : [sexLabel(first.sex), first.source_batch_name].filter(Boolean).join(' · '),
    planned: first.planned,
    actual: first.actual,
    occurredAt: first.occurred_at,
    recordedBy: first.recorded_by?.name ?? null,
    reviewed: first.is_reviewed,
    reviewNote: first.review_note,
    reviewedBy: first.reviewed_by?.name ?? null,
    reviewedAt: first.reviewed_at
  };
};

/** The deviations as the table shows them: by order, newest order first, a row per calf or fact. */
export const groupDeviations = (deviations: WeaningDeviation[]): DeviationOrderGroup[] => {
  const byOrder = new Map<number, DeviationOrderGroup & { items: WeaningDeviation[] }>();

  deviations.forEach((d) => {
    if (!byOrder.has(d.weaning_order_id)) {
      byOrder.set(d.weaning_order_id, { orderId: d.weaning_order_id, code: d.order_code ?? `#${d.weaning_order_id}`, status: d.order_status, rows: [], pending: 0, items: [] });
    }

    byOrder.get(d.weaning_order_id)!.items.push(d);
  });

  return [...byOrder.values()].map(({ items, ...group }) => {
    const buckets = new Map<string, WeaningDeviation[]>();

    items.forEach((d) => {
      const key = GROUPED.includes(d.kind) ? `${d.kind}|${d.actual}|${d.is_reviewed}` : `${d.id}`;
      buckets.set(key, [...(buckets.get(key) ?? []), d]);
    });

    const rows = [...buckets.values()].map(toRow);

    return { ...group, rows, pending: rows.filter((r) => !r.reviewed).length };
  });
};

const DAY = 86400000;

export const withinPeriod = (iso: string, period: PeriodFilter): boolean =>
  period === 'all' || Date.now() - new Date(iso).getTime() <= Number(period) * DAY;

export const daysAgo = (iso: string): number => Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / DAY));

export const formatDay = (iso: string | null): string => (iso ? iso.slice(0, 10).split('-').reverse().join('/') : '—');
