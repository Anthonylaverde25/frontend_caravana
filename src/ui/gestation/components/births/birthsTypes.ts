import { BirthHistoryRecord } from '@/features/gestation/hooks/useBirthHistory';

export type BirthsViewMode = 'hierarchy' | 'flat';

export type NursingStatusFilter = 'all' | 'nursing' | 'weaned';

export interface BirthBatchGroup {
	batchId: number;
	batchName: string;
	records: BirthHistoryRecord[];
	totalBirths: number;
	nursingCount: number;
	weanedCount: number;
	eligibleCalfIds: number[];
}
