export type BatchAlertSeverity = 'error' | 'warning' | 'info';

export type BatchAlertType =
	| 'OVERDUE_BIRTH'
	| 'SANITARY_EXPOSURE'
	| 'ENTRY_INCIDENT'
	| 'INCOMING_PURCHASE'
	| 'ACTIVE_SERVICE'
	| 'PENDING_ORDER'
	| 'UNWEIGHED';

export type BatchAlertLinkKind =
	| 'entry_order'
	| 'birth_order'
	| 'transfer_order'
	| 'weaning_order'
	| 'service_order'
	| 'sanitary_exposure_alert';

export interface BatchAlert {
	type: BatchAlertType;
	severity: BatchAlertSeverity;
	message: string;
	count: number | null;
	link: { kind: BatchAlertLinkKind; id: number; code: string | null } | null;
}

export interface BatchCategoryCount {
	category_id: number | null;
	name: string | null;
	count: number;
	/** The head of the category with a weight on record, and their average. */
	weighed_count: number;
	average_weight: number | null;
}

/**
 * GET /batches/{id}/weights/by-category: one row per day a category was weighed. The average takes
 * the latest weight of each animal in the batch today, so moves never bend a curve.
 */
export interface BatchCategoryWeightPoint {
	weighing_date: string;
	category_id: number | null;
	category_name: string | null;
	average_weight: number;
	weighed_count: number;
	head_count: number;
}

/** A bull a running service keeps in the batch for now: he goes back when the service ends. */
export interface BatchBullOnService {
	caravan_id: number;
	identification: string | null;
	category_name: string | null;
	weight: number | null;
	order_id: number;
	order_code: string;
	joined_at: string | null;
	origin_batch_id: number | null;
	origin_batch_name: string | null;
}

/** Females of a Cría batch: pregnant ones carry a current gestation; the rest are empty or undiagnosed. */
export interface BatchReproductiveState {
	females: number;
	pregnant: number;
	without_gestation: number;
	overdue: number;
}

/**
 * GET /batches/{id}/overview: what the batch page shows above its caravans. Head, weights and the
 * running service travel with the batch itself.
 */
export interface BatchOverview {
	batch_id: number;
	sex_composition: { M: number; H: number };
	category_composition: BatchCategoryCount[];
	last_weighing_date: string | null;
	/** Null outside Cría. */
	reproductive: BatchReproductiveState | null;
	/** Sorted by severity: error, warning, info. */
	alerts: BatchAlert[];
	/** Uncastrated males eligible for castration in this batch. */
	castration_candidate_count: number;
	/** Physically in the batch, but out of its composition and weights above. */
	bulls_on_service: BatchBullOnService[];
}
