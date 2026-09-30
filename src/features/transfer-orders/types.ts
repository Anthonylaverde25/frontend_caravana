/**
 * A transfer order (CACT-01) as the API returns it.
 *
 * The status codes are technical and in English; what the screen shows is `status_label`, or
 * the labels below when a status has to be named before any order exists (the filters).
 */
export type TransferOrderKind = 'PLANNED' | 'REGISTERED';

export type TransferOrderStatus = 'DRAFT' | 'ISSUED' | 'PARTIAL' | 'EXECUTED' | 'CLOSED_INCOMPLETE' | 'CANCELLED';

export type TransferOrderAnimalStatus = 'PENDING' | 'MOVED' | 'SKIPPED';

/**
 * Whether the animals change category, declared by whoever issues the order: KEEP (the current
 * category is printed, greyed, to find the animal), DECLARED (each line carries the new C/S and it
 * is printed) or AT_CHUTE (a blank C/S column; blank means no change).
 */
export type TransferOrderCategoryMode = 'KEEP' | 'DECLARED' | 'AT_CHUTE';

export const TRANSFER_ORDER_STATUS_LABELS: Record<TransferOrderStatus, string> = {
  DRAFT: 'Borrador',
  ISSUED: 'Emitida',
  PARTIAL: 'Parcial',
  EXECUTED: 'Ejecutada',
  CLOSED_INCOMPLETE: 'Cerrada incompleta',
  CANCELLED: 'Anulada'
};

export interface TransferOrderDestination {
  id: number;
  /** Normalised name: what a handwritten row of the paper is joined by. */
  key: string;
  label: string;
  target_batch_id: number | null;
  target_batch_name: string | null;
  new_batch_name: string | null;
  new_batch_type_id: number | null;
  new_batch_type_name: string | null;
  is_confined: boolean | null;
  /** Management of the batch that will receive them: the new batch's, or the existing one's. */
  management_is_confined: boolean | null;
  /** The batch that actually received the animals, once some did. */
  resolved_batch_id: number | null;
  resolved_batch_name: string | null;
  planned_head_count: number;
  moved_head_count: number;
}

export interface TransferOrderAnimal {
  id: number;
  caravan_id: number;
  identification: string | null;
  sex: string | null;
  category_name: string | null;
  /** The current category as the sheet prints it: "Vaquillona / Reposición". */
  category_label: string | null;
  current_batch_id: number | null;
  /** Only in a DECLARED order. Null = this animal keeps its category. */
  target_category_id: number | null;
  target_subcategory_id: number | null;
  target_category_label: string | null;
  /** Null = decided at the chute, on purpose. */
  destination_key: string | null;
  status: TransferOrderAnimalStatus;
  moved_at: string | null;
  caravan_movement_id: number | null;
}

export interface TransferOrderHistoryEntry {
  id: number;
  from_status: TransferOrderStatus | null;
  to_status: TransferOrderStatus;
  action_user: { id: number; name: string | null } | null;
  reason: string | null;
  metadata: {
    origin?: 'SHEET' | 'SCREEN' | 'REGISTRATION';
    moved_now?: number;
    moved_total?: number;
    /** A weaning order's execution: the same fact, counted in calves weaned. */
    weaned_now?: number;
    weaned_total?: number;
    pending?: number;
    skipped?: number;
    movement_date?: string;
    weaning_date?: string;
  } | null;
  created_at: string | null;
}

export interface TransferOrderSummary {
  id: number;
  code: string;
  status: TransferOrderStatus;
  status_label: string;
  /** Issued or partial: it commits animals and can be printed and executed. */
  is_open: boolean;
  /** A draft: editable, commits nothing, previewed but never printed. */
  is_editable: boolean;
  /** Planned before the movement, or registered after it already happened in the field. */
  kind: TransferOrderKind;
  kind_label: string;
  destination_mode: 'single' | 'per_animal';
  category_mode: TransferOrderCategoryMode;
  category_mode_label: string;
  source_batch: { id: number; name: string | null };
  source_activity_name: string | null;
  destination_activity: { id: number; name: string | null };
  planned_head_count: number;
  moved_head_count: number;
  pending_head_count: number;
  skipped_head_count: number;
  unassigned_head_count: number;
  movement_date: string;
  requested_by: { id: number; name: string | null } | null;
  emitted_at: string | null;
  printed_at: string | null;
  first_executed_at: string | null;
  closed_at: string | null;
  responsable: string | null;
  observations: string | null;
  closing_reason: string | null;
  destinations: TransferOrderDestination[];
  created_at: string | null;
}

export interface TransferOrder extends TransferOrderSummary {
  animals: TransferOrderAnimal[];
  history: TransferOrderHistoryEntry[];
}

/** POST /transfer-orders. Destinations carry the screen's own key; animals point at it. */
export interface EmitTransferOrderPayload {
  source_batch_id: number;
  destination_activity_id: number;
  destination_mode: 'single' | 'per_animal';
  movement_date: string;
  responsable?: string | null;
  observations?: string | null;
  destinations: {
    key: string;
    label: string;
    target_batch_id: number | null;
    new_batch_name: string | null;
    new_batch_type_id: number | null;
    is_confined: boolean | null;
  }[];
  /** Absent means KEEP. */
  category_mode?: TransferOrderCategoryMode;
  animals: {
    caravan_id: number;
    destination_key: string | null;
    /** Only read when the mode is DECLARED. */
    target_category_id?: number | null;
    target_subcategory_id?: number | null;
  }[];
  /** False (the default) saves a draft; true creates the order already issued. */
  issue?: boolean;
}

/** What was measured at the chute for one animal of a registered transfer. Absent = no change. */
export interface RegisterAnimalFields {
  current_weight?: number;
  /** DL, 2D, 4D, 6D or 8D (full mouth). */
  teeth?: string;
  category_id?: number;
  /** Travels with `category_id`: null is the category alone, never a subcategory on its own. */
  subcategory_id?: number | null;
  observations?: string;
}

/** POST /transfer-orders/register: an order's payload, with the chute data of each animal. */
export interface RegisterTransferPayload extends Omit<EmitTransferOrderPayload, 'animals' | 'issue'> {
  animals: ({ caravan_id: number; destination_key: string | null } & RegisterAnimalFields)[];
}

export interface TransferWarning {
  code: string;
  message: string;
}

export interface RegisterTransferResult {
  order: TransferOrder;
  warnings: TransferWarning[];
}

/** A CACT-01 row that could not be recorded, named by its caravan. */
export interface TransferRowError {
  row_index: number;
  caravana: string;
  errors: TransferWarning[];
}

/** What the CACT-01 result says about the order it fulfilled. */
export interface TransferOrderExecutionSummary {
  id: number;
  code: string;
  status: TransferOrderStatus;
  status_label: string;
  planned_head_count: number;
  moved_now: number;
  moved_head_count: number;
  pending_head_count: number;
  pending_identifications: string[];
  /** The order was created on confirming a scanned sheet that carried none. */
  created_from_sheet?: boolean;
}

/** The API's domain error body: a message and a stable code. */
export const transferOrderErrorMessage = (error: unknown, fallback: string): string => {
  const body = (error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })?.response
    ?.data;

  return body?.errors ? (Object.values(body.errors)[0]?.[0] ?? fallback) : (body?.message ?? fallback);
};
