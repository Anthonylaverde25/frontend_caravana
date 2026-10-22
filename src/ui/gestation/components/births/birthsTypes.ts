import { BirthHistoryRecord } from '@/features/gestation/hooks/useBirthHistory';
import type { WeaningOrderSummary } from '@/features/weaning-orders/types';

/** Weaning order codes (DS-…): a transfer order (TR-…) also holds calves, but is not weaned here. */
export const WEANING_CODE_PREFIX = 'DS';

export const isWeaningCode = (code: string | null | undefined): boolean => Boolean(code?.startsWith(WEANING_CODE_PREFIX));

export type CommitmentFilter = 'all' | 'free' | 'weaning';

export type SexFilter = 'ALL' | 'M' | 'H';

/** The calves of one batch that one open order holds. */
export interface AtFootOrderSection {
	code: string;
	/** The weaning order, when the code is one and the list has it; null for a transfer order. */
	order: WeaningOrderSummary | null;
	records: BirthHistoryRecord[];
}

export interface AtFootBatchGroup {
	key: string;
	batchId: number | null;
	batchName: string;
	/** Every calf at foot of the batch, before search and filters: the header counts these. */
	all: BirthHistoryRecord[];
	/** No open order: the ones a new order or a registered weaning can take (if tagged). */
	free: BirthHistoryRecord[];
	orders: AtFootOrderSection[];
}
