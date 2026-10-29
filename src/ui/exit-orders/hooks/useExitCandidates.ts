import { useMemo } from 'react';
import { useCompany } from '@/contexts/CompanyContext';
import { useActivities } from '@/features/activities/hooks/useActivities';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import type { Caravan } from '@/core/caravans/domain/entities/Caravan';
import { isTerminalBatchType } from '@/core/batch-types/domain/terminalBatchTypes';
import type { ExitRow } from '../components/load/exitRows';

export interface ExitCandidate {
	caravan: Caravan;
	row: ExitRow;
	batchId: number | null;
}

/**
 * The animals of the own herd that can still leave: alive, not sold, outside the terminal batches.
 * Each one already shaped as a row of the load, with the batch and activity it would leave from.
 * The rest of the rules (orders holding it, bulls in service) the server answers on confirm.
 */
export function useExitCandidates() {
	const { activeCompanyId } = useCompany();
	const { data: caravans = [], isLoading } = useCaravans(activeCompanyId, 'own');
	const { data: activities = [] } = useActivities(activeCompanyId);

	return useMemo(() => {
		const batchInfo = new Map(
			activities.flatMap((activity) =>
				(activity.batches ?? []).map(
					(batch) =>
						[
							Number(batch.id),
							{ activity: activity.name, typeCode: batch.batchTypeCode ?? null, name: batch.name }
						] as const
				)
			)
		);

		const candidates: ExitCandidate[] = caravans
			.filter((caravan) => !caravan.isDead() && !caravan.hasLeft())
			.filter((caravan) => !isTerminalBatchType(batchInfo.get(Number(caravan.batch_id))?.typeCode))
			.map((caravan) => {
				const info = batchInfo.get(Number(caravan.batch_id));

				return {
					caravan,
					batchId: caravan.batch_id,
					row: {
						caravanId: caravan.id,
						label: caravan.identification ?? caravan.label,
						categoryName: caravan.category_name ?? caravan.category,
						batchId: caravan.batch_id != null ? Number(caravan.batch_id) : null,
						batchName: caravan.batch_name ?? info?.name ?? null,
						activityName: info?.activity ?? null,
						isPregnant: caravan.active_gestation != null,
						// The scale of the exit day says the weight: the last one weighed is only a hint.
						lastWeight: caravan.current_weight,
						weight: '',
						leaves: true
					}
				};
			});

		const batches = [
			...new Map(
				candidates
					.filter((c) => c.batchId != null)
					.map((c) => [c.batchId as number, c.row.batchName ?? `Lote ${c.batchId}`])
			).entries()
		]
			.map(([id, name]) => ({ id, name, count: candidates.filter((c) => c.batchId === id).length }))
			.sort((a, b) => a.name.localeCompare(b.name));

		return { candidates, byId: new Map(candidates.map((c) => [c.caravan.id, c])), batches, isLoading };
	}, [caravans, activities, isLoading]);
}
