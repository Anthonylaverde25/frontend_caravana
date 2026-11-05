export type OperationalCategoryKey = 'entry_orders' | 'birth_orders' | 'transfer_orders' | 'weaning_orders';

export interface OperationalOrderItem {
	id: number;
	code: string;
	status: string;
	status_label: string;
	planned_heads: number;
	date: string;
	provider_name?: string | null;
	batch_name?: string | null;
	target_batch_name?: string | null;
	period_start?: string | null;
	period_end?: string | null;
	weaning_type?: string | null;
}

export interface OperationalCategoryData {
	key: OperationalCategoryKey;
	template_code: string;
	title: string;
	subtitle: string;
	icon: string;
	color: string;
	total_pending: number;
	total_planned_heads: number;
	breakdown: Record<string, number>;
	items: OperationalOrderItem[];
}

export interface OperationalKpiSummary {
	total_pending_documents: number;
	last_updated_at: string;
}

export interface OperationalKpisResponse {
	summary: OperationalKpiSummary;
	categories: Record<OperationalCategoryKey, OperationalCategoryData>;
}
