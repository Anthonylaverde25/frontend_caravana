import type {
  TransferOrderCategoryMode,
  TransferOrderHistoryEntry,
  TransferOrderKind,
  TransferOrderStatus,
  TransferWarning
} from '@/features/transfer-orders/types';

/**
 * A weaning order (DEST-01) as the API returns it.
 *
 * It shares the lifecycle, the kind and the category mode of a transfer order, with the same codes
 * and labels, so the chips, the status filter and the history timeline are the transfer order's.
 * What differs is where the calves come from: one order may take calves of several breeding
 * batches, so the source lives on each line of the roll.
 */
export type WeaningOrderStatus = TransferOrderStatus;
export type WeaningOrderKind = TransferOrderKind;
export type WeaningOrderCategoryMode = TransferOrderCategoryMode;
export type WeaningOrderAnimalStatus = 'PENDING' | 'WEANED' | 'SKIPPED';
export type WeaningDestinationMode = 'single' | 'per_animal';

/** Declared, never inferred from the age of the calves. */
export type WeaningType = 'TRADITIONAL' | 'ANTICIPATED' | 'EARLY';

export const WEANING_TYPE_LABELS: Record<WeaningType, string> = {
  TRADITIONAL: 'Tradicional',
  ANTICIPATED: 'Anticipado',
  EARLY: 'Precoz'
};

/** The word the DEST-01 sheet prints next to each box, and the one the scan reads back. */
export const WEANING_TYPE_SHEET_TEXT: Record<WeaningType, string> = {
  TRADITIONAL: 'TRADICIONAL',
  ANTICIPATED: 'ANTICIPADO',
  EARLY: 'PRECOZ'
};

export const WEANING_TYPES: WeaningType[] = ['TRADITIONAL', 'ANTICIPATED', 'EARLY'];

/** The type a sheet or a screen wrote, or null when it is none of the three (two boxes crossed). */
export const weaningTypeFromText = (text: string | null | undefined): WeaningType | null => {
  const value = (text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toUpperCase();

  if (!value) return null;

  return WEANING_TYPES.find((type) => type === value || WEANING_TYPE_SHEET_TEXT[type] === value) ?? null;
};

export interface WeaningOrderDestination {
  id: number;
  /** Normalised name: what a handwritten row of the paper is joined by. */
  key: string;
  label: string;
  target_batch_id: number | null;
  target_batch_name: string | null;
  new_batch_name: string | null;
  is_confined: boolean | null;
  /** The calves are weaned where they are: no batch is named or created. */
  stays_in_place?: boolean;
  /** Management of the batch that will receive them: the new batch's, or the existing one's. */
  management_is_confined: boolean | null;
  resolved_batch_id: number | null;
  resolved_batch_name: string | null;
  planned_head_count: number;
  weaned_head_count: number;
}

export interface WeaningOrderAnimal {
  id: number;
  caravan_id: number;
  identification: string | null;
  sex: string | null;
  mother_identification: string | null;
  birth_date: string | null;
  source_batch_id: number | null;
  source_batch_name: string | null;
  current_batch_id: number | null;
  /** The current category as the sheet prints it: "Ternero". */
  category_label: string | null;
  /** The current C/S, as ids: the reference a new one is chosen against. */
  category_id: number | null;
  subcategory_id: number | null;
  /**
   * In a DECLARED order, what it declares; in an AT_CHUTE order, what was decided when the calf
   * was weaned. Null = this calf keeps its category.
   */
  target_category_id: number | null;
  target_subcategory_id: number | null;
  target_category_label: string | null;
  /** Null = decided at the chute, on purpose. Where the calf went, once weaned. */
  destination_key: string | null;
  /** Where the order planned to send it: kept when it went elsewhere. */
  planned_destination_key: string | null;
  planned_destination_label: string | null;
  /** It went somewhere other than planned. */
  is_redirected: boolean;
  /** How it was actually weaned; null while pending. */
  weaning_type_applied: WeaningType | null;
  weaning_type_applied_label: string | null;
  /** Its deviations for the audit: null = none, PENDING = some not reviewed yet. */
  deviation_review: 'PENDING' | 'REVIEWED' | null;
  status: WeaningOrderAnimalStatus;
  weaned_at: string | null;
  caravan_movement_id: number | null;
}

export interface WeaningOrderSourceBatch {
  id: number;
  name: string | null;
  head_count: number;
}

export interface WeaningOrderSummary {
  id: number;
  code: string;
  status: WeaningOrderStatus;
  status_label: string;
  is_open: boolean;
  is_editable: boolean;
  kind: WeaningOrderKind;
  kind_label: string;
  destination_mode: WeaningDestinationMode;
  category_mode: WeaningOrderCategoryMode;
  category_mode_label: string;
  weaning_type: WeaningType | null;
  weaning_type_label: string | null;
  destination_activity: { id: number; name: string | null };
  source_batches: WeaningOrderSourceBatch[];
  planned_head_count: number;
  weaned_head_count: number;
  pending_head_count: number;
  skipped_head_count: number;
  unassigned_head_count: number;
  /** Planned date; the real one is declared when it is executed. */
  weaning_date: string;
  requested_by: { id: number; name: string | null } | null;
  emitted_at: string | null;
  printed_at: string | null;
  first_executed_at: string | null;
  closed_at: string | null;
  responsable: string | null;
  observations: string | null;
  closing_reason: string | null;
  destinations: WeaningOrderDestination[];
  created_at: string | null;
}

/** How far the weaning strayed from the plan. */
export interface WeaningDeviationSummary {
  /** Calves with deviations nobody reviewed yet. */
  pending_review_head_count: number;
  redirected_head_count: number;
  type_deviated_head_count: number;
}

export interface WeaningOrder extends WeaningOrderSummary {
  deviation_summary: WeaningDeviationSummary;
  animals: WeaningOrderAnimal[];
  history: TransferOrderHistoryEntry[];
}

/** A destination as the screen declares it; calves point at it by `key`. */
export interface WeaningDestinationPayload {
  key: string;
  label: string;
  target_batch_id: number | null;
  new_batch_name: string | null;
  is_confined: boolean | null;
  /** Weaned where they are. */
  stays_in_place?: boolean;
}

/** POST /weaning-orders (and PUT on a draft). */
export interface EmitWeaningOrderPayload {
  destination_mode: WeaningDestinationMode;
  category_mode: WeaningOrderCategoryMode;
  weaning_date: string;
  weaning_type: WeaningType | null;
  responsable?: string | null;
  observations?: string | null;
  destinations: WeaningDestinationPayload[];
  animals: {
    caravan_id: number;
    destination_key: string | null;
    target_category_id?: number | null;
    target_subcategory_id?: number | null;
  }[];
  /** False (the default) saves a draft; true creates the order already issued. */
  issue?: boolean;
}

/** POST /weaning-orders/register: an order's payload plus what the chute measured. */
export interface RegisterWeaningPayload extends Omit<EmitWeaningOrderPayload, 'animals' | 'issue'> {
  animals: (EmitWeaningOrderPayload['animals'][number] & { weight?: number | null; observations?: string | null })[];
}

export interface RegisterWeaningResult {
  order: WeaningOrder;
  warnings: TransferWarning[];
}

/** POST /weaning-orders/{id}/execute: the day it happened and, per calf, what was measured or decided. */
export interface ExecuteWeaningOrderBody {
  weaning_date?: string;
  /** Only these pending calves ("Registrar destetadas"); the rest stay pending. */
  caravan_ids?: number[];
  /** How they were weaned, when it differs from the plan. */
  weaning_type?: WeaningType | null;
  /** Where they went, when it differs from the plan; each calf points at one by `destination_key`. */
  destinations?: WeaningDestinationPayload[];
  animals?: {
    caravan_id: number;
    destination_key?: string | null;
    weight?: number | null;
    observations?: string | null;
    category_id?: number | null;
    subcategory_id?: number | null;
  }[];
}

/** What the DEST-01 result says about the order it fulfilled. */
export interface WeaningOrderExecutionSummary {
  id: number;
  code: string;
  status: WeaningOrderStatus;
  status_label: string;
  kind: WeaningOrderKind;
  planned_head_count: number;
  weaned_now: number;
  weaned_head_count: number;
  pending_head_count: number;
  pending_identifications: string[];
  /** The order was created on confirming a scanned sheet that carried none. */
  created_from_sheet?: boolean;
}

/** The DEST-01 result, from a scanned sheet or from executing an order on the screen. */
export interface WeaningResult {
  batch_id: number;
  batch_name: string;
  batch_created: boolean;
  /** batch_id null: the calves were weaned where they stood ("Quedan en su lote"). */
  destinations: { batch_id: number | null; batch_name: string; created: boolean; count: number; average_weight: number | null }[];
  calves_count: number;
  males_count: number;
  females_count: number;
  weighed_count: number;
  average_weight: number | null;
  warnings: TransferWarning[];
  weaning_order: WeaningOrderExecutionSummary | null;
}

/** The API's domain error body, or the first per-row / per-header problem of a DEST-01 422. */
export const weaningOrderErrorMessage = (error: unknown, fallback: string): string => {
  const body = (
    error as {
      response?: {
        data?: {
          message?: string;
          errors?: Record<string, string[]>;
          header_errors?: { message: string }[];
          row_errors?: { caravana: string; errors: { message: string }[] }[];
        };
      };
    }
  )?.response?.data;

  if (body?.errors) return Object.values(body.errors)[0]?.[0] ?? fallback;
  if (body?.header_errors?.[0]) return body.header_errors[0].message;
  if (body?.row_errors?.[0]) return `${body.row_errors[0].caravana}: ${body.row_errors[0].errors[0]?.message ?? fallback}`;

  return body?.message ?? fallback;
};

/** What a weaning did differently from its order. */
export type WeaningDeviationKind = 'DESTINATION' | 'WEANING_TYPE' | 'CATEGORY' | 'LATE' | 'NOT_WEANED';

export const WEANING_DEVIATION_KINDS: WeaningDeviationKind[] = ['DESTINATION', 'WEANING_TYPE', 'CATEGORY', 'LATE', 'NOT_WEANED'];

export const WEANING_DEVIATION_LABELS: Record<WeaningDeviationKind, string> = {
  DESTINATION: 'Destino',
  WEANING_TYPE: 'Tipo de destete',
  CATEGORY: 'Categoría',
  LATE: 'Destete tardío',
  NOT_WEANED: 'No destetadas'
};

/** GET /weaning-deviations: one calf of an order, weaned (or not) off the plan, and its review. */
export interface WeaningDeviation {
  id: number;
  weaning_order_id: number;
  order_code: string | null;
  order_status: WeaningOrderStatus | null;
  weaning_order_animal_id: number;
  caravan_id: number;
  identification: string | null;
  sex: string | null;
  source_batch_name: string | null;
  kind: WeaningDeviationKind;
  kind_label: string;
  planned: string | null;
  actual: string | null;
  metadata: Record<string, unknown>;
  occurred_at: string;
  recorded_by: { id: number; name: string | null } | null;
  is_reviewed: boolean;
  reviewed_at: string | null;
  reviewed_by: { id: number; name: string | null } | null;
  review_note: string | null;
}
