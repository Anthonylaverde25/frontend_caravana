export type CastrationStatus = 'intact' | 'castrated' | 'exempt' | 'unassigned';

export type CastrationMethod = 'RUBBER_RING' | 'BURDIZZO' | 'SURGICAL' | 'OTHER';

export const CASTRATION_METHOD_LABELS: Record<CastrationMethod, string> = {
	RUBBER_RING: 'Goma / elastrador',
	BURDIZZO: 'Burdizzo / pinza',
	SURGICAL: 'Cuchillo / quirúrgico',
	OTHER: 'Otro'
};

export const CASTRATION_STATUS_LABELS: Record<CastrationStatus, string> = {
	intact: 'Entero',
	castrated: 'Castrado',
	exempt: 'No aplica (hembra)',
	unassigned: 'Sin asignar'
};

export interface CastrationRecord {
	id: number;
	castrated_on: string;
	method: CastrationMethod | null;
	method_label: string | null;
	notes: string | null;
	from_category_id: number;
	from_category_name: string | null;
	voided_at: string | null;
	void_reason: string | null;
	registered_by: { id: number; name: string } | null;
}

export interface CastrationCandidate {
	id: number;
	identification: string;
	visual_tag: string | null;
	category_id: number;
	category_code: string;
	category_name: string;
	birth_date: string | null;
	age_months: number | null;
	preselected: boolean;
	blocked_by: string | null;
	target_category_options: { id: number; code: string; name: string }[];
	default_target_category_id: number | null;
}

export interface CastrationCandidates {
	candidates: CastrationCandidate[];
	steer_age_limit_months: number;
}

export interface RegisterCastrationItemPayload {
	caravan_id: number;
	target_category_id?: number | null;
	target_category_code?: string;
}

export interface RegisterCastrationPayload {
	castrated_on: string;
	method?: CastrationMethod | null;
	notes?: string | null;
	items: RegisterCastrationItemPayload[];
}

export interface CategoryChange {
	id: number;
	caravan_id: number;
	from_category: { id: number; code: string; name: string } | null;
	to_category: { id: number; code: string; name: string };
	cause: string;
	cause_label: string;
	occurred_on: string;
	source: string | null;
	source_id: number | null;
	user: { id: number; name: string } | null;
	created_at: string;
}
