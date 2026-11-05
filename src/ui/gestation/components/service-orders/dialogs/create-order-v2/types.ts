import type { BullLocation } from '@/features/gestation/hooks/useServiceOrderIssuance';

export type ServiceMethodType = 'TRADITIONAL' | 'AI';

/** What the sheet does: start or plan an order, or register one that already ended. */
export type OrderSheetMode = 'issue' | 'register';

export type BatchSelectionMode = 'complete' | 'partial';

export interface SelectedBatchState {
	batchId: number;
	batchName: string;
	mode: BatchSelectionMode;
	/**
	 * Specific caravan IDs selected when mode === 'partial'.
	 * When mode === 'complete', all eligible breeding females are automatically included.
	 */
	selectedCaravanIds: number[];
}

/** The trip of a bull through a registered service: where it came from and where it went. */
export interface BullStayRow {
	maleId: number;
	tag: string;
	originBatchId: number | '';
	joinedAt: string;
	retiredAt: string;
	destinationBatchId: number | '';
	/** What its movements say, to warn when the operator declares something else. */
	location: BullLocation | null;
}

/** Errors of the server by field ("lots.0.bulls.1.origin_batch_id"). */
export type OrderSheetErrors = Record<string, string[]>;
