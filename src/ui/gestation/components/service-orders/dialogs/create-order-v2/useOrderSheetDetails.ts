import { useCallback, useState } from 'react';
import { BullLocation } from '@/features/gestation/hooks/useServiceOrderIssuance';
import { BullStayRow, OrderSheetErrors } from './types';
import { daysFromTodayLocal, todayLocal } from './orderSheetDates';

/** What the sheet declares besides the batches: dates, bulls or semen, and the trip of each bull. */
export function useOrderSheetDetails() {
	const [startDate, setStart] = useState(todayLocal());
	const [endDate, setEnd] = useState(daysFromTodayLocal(90));
	const [observations, setObservations] = useState('');
	const [bullsByBatch, setBullsByBatch] = useState<Record<number, number[]>>({});
	const [rotationBatches, setRotationBatches] = useState<number[]>([]);
	const [plannedSemen, setPlannedSemen] = useState<Record<number, number | null>>({});
	const [staysByBatch, setStaysByBatch] = useState<Record<number, BullStayRow[]>>({});
	const [errors, setErrors] = useState<OrderSheetErrors>({});

	const mapStays = useCallback((change: (row: BullStayRow) => BullStayRow) => {
		setStaysByBatch((prev) =>
			Object.fromEntries(Object.entries(prev).map(([batchId, rows]) => [batchId, rows.map(change)]))
		);
	}, []);

	/** The days of the trips follow the order until someone corrects one of them. */
	const setStartDate = useCallback(
		(value: string) => {
			setStart(value);
			mapStays((row) => ({ ...row, joinedAt: value }));
		},
		[mapStays]
	);

	const setEndDate = useCallback(
		(value: string) => {
			setEnd(value);
			mapStays((row) => ({ ...row, retiredAt: value }));
		},
		[mapStays]
	);

	/** A registered service cannot end in the future: the sheet starts from today. */
	const prepareFor = useCallback((register: boolean) => {
		setStart(register ? daysFromTodayLocal(-90) : todayLocal());
		setEnd(register ? todayLocal() : daysFromTodayLocal(90));
		setObservations('');
		setBullsByBatch({});
		setRotationBatches([]);
		setPlannedSemen({});
		setStaysByBatch({});
		setErrors({});
	}, []);

	const setBullsOf = useCallback((batchId: number, update: React.SetStateAction<number[]>) => {
		setBullsByBatch((prev) => ({
			...prev,
			[batchId]: typeof update === 'function' ? update(prev[batchId] ?? []) : update
		}));
	}, []);

	const toggleRotation = useCallback((batchId: number, on: boolean) => {
		setRotationBatches((prev) => (on ? [...prev, batchId] : prev.filter((id) => id !== batchId)));
	}, []);

	const planSemen = useCallback((femaleIds: number[], itemId: number | null) => {
		setPlannedSemen((prev) => ({ ...prev, ...Object.fromEntries(femaleIds.map((id) => [id, itemId])) }));
	}, []);

	const addStay = useCallback(
		(batchId: number, maleId: number, tag: string, location: BullLocation | null) => {
			const destination = [location?.current_batch_id, location?.batch_id].find(
				(id) => id != null && id !== batchId
			);
			setStaysByBatch((prev) => ({
				...prev,
				[batchId]: [
					...(prev[batchId] ?? []),
					{
						maleId,
						tag,
						originBatchId: location?.batch_id ?? '',
						joinedAt: startDate,
						retiredAt: endDate,
						destinationBatchId: destination ?? '',
						location
					}
				]
			}));
		},
		[startDate, endDate]
	);

	const updateStay = useCallback((batchId: number, maleId: number, change: Partial<BullStayRow>) => {
		setStaysByBatch((prev) => ({
			...prev,
			[batchId]: (prev[batchId] ?? []).map((row) => (row.maleId === maleId ? { ...row, ...change } : row))
		}));
	}, []);

	const removeStay = useCallback((batchId: number, maleId: number) => {
		setStaysByBatch((prev) => ({
			...prev,
			[batchId]: (prev[batchId] ?? []).filter((row) => row.maleId !== maleId)
		}));
	}, []);

	return {
		startDate,
		setStartDate,
		endDate,
		setEndDate,
		observations,
		setObservations,
		bullsByBatch,
		setBullsOf,
		rotationBatches,
		toggleRotation,
		plannedSemen,
		planSemen,
		staysByBatch,
		addStay,
		updateStay,
		removeStay,
		errors,
		setErrors,
		prepareFor
	};
}

export type OrderSheetDetails = ReturnType<typeof useOrderSheetDetails>;
