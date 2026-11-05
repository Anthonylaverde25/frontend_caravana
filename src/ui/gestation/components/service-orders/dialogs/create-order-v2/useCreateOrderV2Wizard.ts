import { useState, useCallback } from 'react';
import { ServiceMethodType, BatchSelectionMode, SelectedBatchState } from './types';

/** The service type and the batches of the sheet, each one complete or with its picked females. */
export function useCreateOrderV2Wizard() {
	const [serviceType, setServiceType] = useState<ServiceMethodType>('TRADITIONAL');
	const [selectedBatches, setSelectedBatches] = useState<Map<number, SelectedBatchState>>(new Map());

	const resetWizard = useCallback(() => {
		setServiceType('TRADITIONAL');
		setSelectedBatches(new Map());
	}, []);

	/** Each type has its own rules for the females, so another type starts the selection again. */
	const selectServiceType = useCallback((type: ServiceMethodType) => {
		setServiceType((current) => {
			if (current !== type) setSelectedBatches(new Map());

			return type;
		});
	}, []);

	const toggleBatch = useCallback(
		(batchId: number, batchName: string, caravanIds: number[], mode: BatchSelectionMode) => {
			setSelectedBatches((prev) => {
				const next = new Map(prev);

				if (next.has(batchId)) {
					next.delete(batchId);
				} else {
					next.set(batchId, { batchId, batchName, mode, selectedCaravanIds: [...caravanIds] });
				}

				return next;
			});
		},
		[]
	);

	const updateBatch = useCallback((batchId: number, change: (current: SelectedBatchState) => SelectedBatchState) => {
		setSelectedBatches((prev) => {
			const current = prev.get(batchId);

			if (!current) return prev;

			return new Map(prev).set(batchId, change(current));
		});
	}, []);

	const setBatchMode = useCallback(
		(batchId: number, mode: BatchSelectionMode) => updateBatch(batchId, (current) => ({ ...current, mode })),
		[updateBatch]
	);

	const toggleCaravanInBatch = useCallback(
		(batchId: number, caravanId: number) =>
			updateBatch(batchId, (current) => ({
				...current,
				selectedCaravanIds: current.selectedCaravanIds.includes(caravanId)
					? current.selectedCaravanIds.filter((id) => id !== caravanId)
					: [...current.selectedCaravanIds, caravanId]
			})),
		[updateBatch]
	);

	const setCaravansInBatch = useCallback(
		(batchId: number, caravanIds: number[]) =>
			updateBatch(batchId, (current) => ({ ...current, selectedCaravanIds: [...caravanIds] })),
		[updateBatch]
	);

	return {
		serviceType,
		selectServiceType,
		selectedBatches,
		toggleBatch,
		setBatchMode,
		toggleCaravanInBatch,
		setCaravansInBatch,
		resetWizard
	};
}

export type OrderSelection = ReturnType<typeof useCreateOrderV2Wizard>;
