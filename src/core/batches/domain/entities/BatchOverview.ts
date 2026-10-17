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
}
