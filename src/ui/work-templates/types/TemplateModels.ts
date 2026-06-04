export interface WorkTemplate {
	id: number;
	title: string;
	description: string | null;
	code: string;
	category: string;
	status: 'active' | 'draft' | 'archived';
	schema_definition: any;
	created_at: string;
}
