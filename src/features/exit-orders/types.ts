/**
 * Exit orders of livestock (egreso plan v5, 06): an order issued for a load still to come, or a
 * sale registered after it happened. Mirrors App\Http\Resources\ExitOrderResource.
 */

export type ExitOrderKind = 'PLANNED' | 'REGISTERED';

export type ExitOrderStatus = 'ISSUED' | 'PARTIAL' | 'EXECUTED' | 'CLOSED_INCOMPLETE' | 'CANCELLED';

export type ExitLineStatus = 'PENDING' | 'EXITED' | 'SKIPPED';

/** What happens to the calf at foot of a cow that leaves (P1). */
export type CalfAtFootDecision = 'WITH_MOTHER' | 'STAYS';

export const EXIT_ORDER_STATUS_LABELS: Record<ExitOrderStatus, string> = {
	ISSUED: 'Emitida',
	PARTIAL: 'Parcial',
	EXECUTED: 'Ejecutada',
	CLOSED_INCOMPLETE: 'Cerrada incompleta',
	CANCELLED: 'Anulada'
};

export const EXIT_LINE_STATUS_LABELS: Record<ExitLineStatus, string> = {
	PENDING: 'Pendiente',
	EXITED: 'Salió',
	SKIPPED: 'No salió'
};

export const CALF_DECISION_LABELS: Record<CalfAtFootDecision, string> = {
	WITH_MOTHER: 'Sale con ella',
	STAYS: 'Se queda'
};

export interface ExitOrderSummary {
	id: number;
	code: string;
	kind: ExitOrderKind;
	kind_label: string;
	reason: 'SALE';
	reason_label: string;
	status: ExitOrderStatus;
	status_label: string;
	buyer: { id: number; name: string | null; cuit: string | null } | null;
	exit_date: string;
	planned_head_count: number;
	exited_count: number;
	pending_count: number;
	skipped_count: number;
	dte_head_count: number;
	dtes_count: number;
	/** Something left and no DTE was loaded yet: recommended, never required. */
	without_dte: boolean;
	total_weight_kg: number | null;
	total_amount: number | null;
	emitted_at: string | null;
	closed_at: string | null;
	closing_reason: string | null;
}

interface NamedRef {
	id: number;
	name: string | null;
}

/** One animal of the roll, with the photo taken the day it left. */
export interface ExitOrderLine {
	id: number;
	caravan_id: number;
	label: string;
	status: ExitLineStatus;
	status_label: string;
	from_batch: NamedRef | null;
	activity: NamedRef | null;
	category: NamedRef | null;
	was_pregnant: boolean | null;
	weight_kg: number | null;
	/** The share of the truck's total kg, not a weighing of the animal. */
	weight_estimated: boolean;
	/** Pending: the animal's last weighing, what the order plans with. */
	last_weight_kg: number | null;
	price_per_kg: number | null;
	amount: number | null;
	exited_at: string | null;
	skipped_reason: string | null;
}

export interface ExitOrderDte {
	id: number;
	dte_number: string;
	dte_date: string;
	head_count: number;
	observations: string | null;
}

export interface ExitOrderHistoryEntry {
	id: number;
	from_status: ExitOrderStatus | null;
	to_status: ExitOrderStatus;
	user: string | null;
	reason: string | null;
	metadata: Record<string, unknown> | null;
	created_at: string | null;
}

export interface ExitOrder extends ExitOrderSummary {
	responsable: string | null;
	observations: string | null;
	first_executed_at: string | null;
	animals: ExitOrderLine[];
	dtes: ExitOrderDte[];
	history: ExitOrderHistoryEntry[];
}

export interface ExitDtePayload {
	dte_number: string;
	dte_date: string;
	head_count: number;
	observations?: string | null;
}

export interface ExitLinePayload {
	caravan_id: number;
	weight_kg: number | null;
	weight_estimated: boolean;
	price_per_kg: number | null;
	amount: number | null;
	calf_decision: CalfAtFootDecision | null;
}

/** "Emitir orden" and its edit. */
export interface IssueExitOrderPayload {
	buyer_partner_id: number;
	exit_date: string;
	caravan_ids: number[];
	responsable: string | null;
	observations: string | null;
	/** The $/kg agreed with the buyer, per animal (optional). */
	agreed_prices: { caravan_id: number; price_per_kg: number }[];
}

/** One load of an issued order. */
export interface ExecuteExitOrderPayload {
	exit_date: string;
	exit_batch_id: number | null;
	lines: ExitLinePayload[];
	dte: ExitDtePayload | null;
}

/** "Registrar egreso" and "Vender": the exit already happened. */
export interface RegisterExitPayload extends ExecuteExitOrderPayload {
	buyer_partner_id: number;
	responsable: string | null;
	observations: string | null;
}

export interface ExitLineDeathPayload {
	death_date: string;
	death_cause_id: number;
	observations: string | null;
	death_batch_id: number | null;
}

/** A cow of the load and the calf that is still at her foot. */
export interface CalfAtFoot {
	mother_id: number;
	calf_id: number;
	calf_label: string;
}

/** The body of a 422: the message and the errors by field ("lines.2.weight_kg"). */
export interface ExitErrorBody {
	message?: string;
	errors?: Record<string, string[]>;
}

export const exitErrorBody = (error: unknown): ExitErrorBody | undefined =>
	(error as { response?: { data?: ExitErrorBody } })?.response?.data;

export const exitOrderErrorMessage = (error: unknown, fallback: string): string => {
	const body = exitErrorBody(error);
	const first = Object.values(body?.errors ?? {})[0]?.[0];

	return first ?? body?.message ?? fallback;
};
