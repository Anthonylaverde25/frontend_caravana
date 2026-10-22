import { useMemo } from 'react';
import type { BirthHistoryRecord } from '@/features/gestation/hooks/useBirthHistory';
import type { WeaningOrderSummary } from '@/features/weaning-orders/types';
import { AtFootBatchGroup, CommitmentFilter, SexFilter, isWeaningCode } from './birthsTypes';

export const batchKeyOf = (record: BirthHistoryRecord): string => `b${record.calf_batch_id ?? record.mother_batch_id ?? 0}`;

const byTag = (a: BirthHistoryRecord, b: BirthHistoryRecord) => (a.calf_label ?? '').localeCompare(b.calf_label ?? '');

interface AtFootFilters {
	search: string;
	batchKey: string | 'all';
	commitment: CommitmentFilter;
	sex: SexFilter;
}

/**
 * The calves at foot by batch and, inside each batch, by commitment: the free ones first, then one
 * section per open order holding some of them. The header of a batch counts all its calves; the
 * sections show what the search and the filters leave.
 */
export function useAtFootGroups(
	atFoot: BirthHistoryRecord[],
	orders: WeaningOrderSummary[],
	{ search, batchKey, commitment, sex }: AtFootFilters
): AtFootBatchGroup[] {
	return useMemo(() => {
		const term = search.trim().toLowerCase();
		const orderByCode = new Map(orders.map((order) => [order.code, order]));
		const groups = new Map<string, AtFootBatchGroup>();

		atFoot.forEach((record) => {
			const key = batchKeyOf(record);

			if (batchKey !== 'all' && key !== batchKey) return;

			if (!groups.has(key)) {
				groups.set(key, {
					key,
					batchId: record.calf_batch_id ?? record.mother_batch_id,
					batchName: record.calf_batch_name ?? record.mother_batch_name ?? 'Sin lote asignado',
					all: [],
					free: [],
					orders: []
				});
			}

			const group = groups.get(key)!;
			group.all.push(record);

			const matches =
				(term === '' ||
					(record.calf_label ?? '').toLowerCase().includes(term) ||
					record.mother_identification.toLowerCase().includes(term)) &&
				(sex === 'ALL' || record.calf_sex === sex) &&
				(commitment === 'all' ||
					(commitment === 'free' && !record.open_order_code) ||
					(commitment === 'weaning' && isWeaningCode(record.open_order_code)));

			if (!matches) return;

			if (!record.open_order_code) {
				group.free.push(record);
				return;
			}

			let section = group.orders.find((s) => s.code === record.open_order_code);

			if (!section) {
				section = { code: record.open_order_code, order: orderByCode.get(record.open_order_code) ?? null, records: [] };
				group.orders.push(section);
			}

			section.records.push(record);
		});

		return [...groups.values()]
			.map((group) => ({
				...group,
				free: [...group.free].sort(byTag),
				orders: group.orders
					.map((section) => ({ ...section, records: [...section.records].sort(byTag) }))
					.sort((a, b) => a.code.localeCompare(b.code))
			}))
			.sort((a, b) => b.all.length - a.all.length || a.batchName.localeCompare(b.batchName));
	}, [atFoot, orders, search, batchKey, commitment, sex]);
}
