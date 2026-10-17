import type { ReproductiveStatus } from '../rules/isBreedingCandidate';
import type { BreedingExclusionReasonCode } from './BreedingExclusionReason';

/**
 * Light caravan row returned by GET /caravans/summary, for paginated inventory tables.
 * Kept in the API shape (snake_case): it is a read model, not a rich entity.
 */
export interface CaravanSummary {
	id: number;
	identification: string;
	category: string | null;
	category_id: number | null;
	category_name: string | null;
	subcategory_id: number | null;
	subcategory_name: string | null;
	teeth: number | null;
	entry_weight: number | null;
	current_weight: number | null;
	breed: string | null;
	breed_id: number | null;
	sex: 'M' | 'H';
	entry_date: string | null;
	batch_id: number | null;
	batch_name: string | null;
	farm_name: string | null;
	/** When the caravan joined its current batch (Y-m-d). */
	batch_assigned_at: string | null;
	/** PREGNANT: carries a current gestation. NONE: does not (empty or never diagnosed). Null for males and calves. */
	gestation_status: 'PREGNANT' | 'NONE' | null;
	/** The owner's breeding decision; independent from the veterinary verdict. */
	is_breeding_eligible: boolean;
	breeding_exclusion_reason: BreedingExclusionReasonCode | null;
	breeding_exclusion_reason_label: string | null;
	/** Whether the category breeds (animal_categories.is_reproductive); null without category. */
	is_reproductive_category: boolean | null;
	/** The category and the owner's decision together: NOT_APPLICABLE for a calf or a steer. */
	reproductive_status: ReproductiveStatus;
}

export interface CaravanSummaryMeta {
	current_page: number;
	last_page: number;
	per_page: number;
	total: number;
	from?: number | null;
	to?: number | null;
}

export interface CaravanSummaryPage {
	data: CaravanSummary[];
	meta: CaravanSummaryMeta;
}

export type CaravanSummarySort = 'identification' | 'recent';

export interface CaravanSummaryQuery {
	companyId?: number;
	scope?: 'own' | 'external' | 'all';
	/** A batch id, 'unassigned' (caravans in no batch), or undefined (any batch). */
	batchId?: number | string;
	search?: string;
	sex?: 'M' | 'H' | 'ALL';
	sort?: CaravanSummarySort;
	page?: number;
	perPage?: number;
}
