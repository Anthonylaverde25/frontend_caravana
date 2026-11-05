import type {
	IssueServiceOrdersPayload,
	RegisterServiceOrdersPayload
} from '@/features/gestation/hooks/useServiceOrderIssuance';
import { LotFemales, EMPTY_LOT } from './lotFemales';
import { OrderSheetDetails } from './useOrderSheetDetails';
import { SelectedBatchState, ServiceMethodType } from './types';

const serviceMethod = (type: ServiceMethodType) => (type === 'AI' ? 'AI' : 'NATURAL') as 'AI' | 'NATURAL';

/** How many females a batch brings to the order, the way the backend will count them. */
export function lotFemaleCount(lot: SelectedBatchState, females: LotFemales | undefined): number {
	return lot.mode === 'complete' ? (females ?? EMPTY_LOT).serviceable.length : lot.selectedCaravanIds.length;
}

export function buildIssuePayload(
	type: ServiceMethodType,
	lots: SelectedBatchState[],
	details: OrderSheetDetails
): IssueServiceOrdersPayload {
	const isAi = type === 'AI';

	return {
		service_method: serviceMethod(type),
		start_date: details.startDate,
		end_date: isAi ? null : details.endDate || null,
		observations: details.observations.trim() || null,
		lots: lots.map((lot) => {
			const bulls = isAi ? [] : (details.bullsByBatch[lot.batchId] ?? []);
			const picks = isAi || lot.mode === 'partial';

			return {
				batch_id: lot.batchId,
				service_type:
					bulls.length === 1
						? 'single'
						: details.rotationBatches.includes(lot.batchId)
							? 'rotation'
							: 'multi',
				is_controlled_service: !isAi && lot.mode === 'partial',
				male_caravan_ids: bulls,
				...(picks ? { selected_female_caravan_ids: lot.selectedCaravanIds } : {}),
				...(isAi
					? {
							planned_semen: lot.selectedCaravanIds.flatMap((id) => {
								const itemId = details.plannedSemen[id];
								return itemId ? [{ female_caravan_id: id, item_id: itemId }] : [];
							})
						}
					: {})
			};
		})
	};
}

export function buildRegisterPayload(
	type: ServiceMethodType,
	lots: SelectedBatchState[],
	details: OrderSheetDetails
): RegisterServiceOrdersPayload {
	return {
		service_method: serviceMethod(type),
		start_date: details.startDate,
		end_date: details.endDate,
		observations: details.observations.trim() || null,
		lots: lots.map((lot) => ({
			batch_id: lot.batchId,
			female_caravan_ids: lot.selectedCaravanIds,
			bulls:
				type === 'AI'
					? []
					: (details.staysByBatch[lot.batchId] ?? []).map((row) => ({
							male_caravan_id: row.maleId,
							origin_batch_id: row.originBatchId,
							joined_at: row.joinedAt,
							retired_at: row.retiredAt,
							destination_batch_id: row.destinationBatchId
						}))
		}))
	};
}
