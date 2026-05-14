export interface TemplateType {
	id: number;
	name: string;
	code: string;
	icon: string | null;
	color: string | null;
	description: string | null;
	is_active: boolean;
}

export interface WorkTemplate {
	id: number;
	title: string;
	description: string | null;
	type_id: number;
	type_name: string;
	type_color: string;
	type_icon: string;
	status: 'active' | 'draft' | 'archived';
	schema_definition: any;
	created_at: string;
}
