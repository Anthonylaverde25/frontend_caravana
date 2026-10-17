/**
 * A bull found positive to a contagious pathogen and the females that served with him inside
 * the risk window. Non-blocking: they are followed at the pregnancy check.
 * Shape of GET /sanitary-exposure-alerts/{id} (snake_case read model).
 */
export interface ExposedFemale {
	female_id: number;
	identification: string;
	current_batch: { id: number; name: string | null } | null;
	is_pregnant: boolean;
	service_order: { id: number; code: string };
	overlap_from: string;
	/** Null: still with the bull when the alert was raised. */
	overlap_until: string | null;
	reviewed_at: string | null;
	review_note: string | null;
}

export interface SanitaryExposureAlert {
	id: number;
	bull: { id: number; identification: string };
	/** The order the bull is still working in: he must be taken out. */
	bull_active_order: { service_order_id: number; code: string; batch_id: number } | null;
	pathogen_code: string;
	pathogen_name: string;
	detected_on: string;
	risk_window_from: string;
	detail: string;
	status: 'OPEN' | 'RESOLVED';
	resolution: string | null;
	resolved_at: string | null;
	resolved_by: string | null;
	females_count: number;
	reviewed_count: number;
	females: ExposedFemale[];
}

/** Open exposures of one female, for the pregnancy check grid. */
export interface FemaleOpenExposure {
	alert_id: number;
	bull_tag: string;
	pathogen: string;
	reviewed: boolean;
}

export type OpenExposuresByFemale = Record<string, FemaleOpenExposure[]>;
