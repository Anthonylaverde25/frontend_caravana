export interface CaravanItem {
	id: number;
	identification: string;
	category: string | null;
	category_id?: number | null;
	category_code?: string | null;
	category_name?: string | null;
	subcategory_id?: number | null;
	subcategory_code?: string | null;
	subcategory_name?: string | null;
	breed: string | null;
	teeth: number;
	entry_weight: number | null;
	current_weight: number | null;
	sex: string | null;
	entry_date: string | null;
	batch_id?: number | null;
	batch_name: string | null;
	farm_id?: number | null;
	farm_name?: string | null;
	renspa?: string;
	female_details?: {
		is_empty: boolean;
		arrival_category: string;
	} | null;
	physiological_state?: {
		code: string;
		label: string;
		is_pregnant: boolean | null;
		is_nursing: boolean | null;
		gestation_stage?: string | null;
		gestation_months?: number | null;
	} | null;
}

export interface BatchGroup {
	batchId: number;
	batchName: string;
	farmName: string | null;
	caravans: CaravanItem[];
	totalHeads: number;
	averageWeight: number;
	rawBatch: any;
}
