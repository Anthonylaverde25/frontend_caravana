/**
 * Entry orders of external livestock (ING-02). An order is the record of a purchase: it is born
 * without caravans, waits for the DTE (documento de tránsito electrónico) that lists them, and
 * then for the animals, which are in transit until received. The status tells what it waits for.
 */

export type EntryOrderStatus = 'DRAFT' | 'AWAITING_DTE' | 'IN_TRANSIT' | 'COMPLETED' | 'CLOSED_INCOMPLETE' | 'CANCELLED';

export const ENTRY_ORDER_STATUS_LABELS: Record<EntryOrderStatus, string> = {
  DRAFT: 'Borrador',
  AWAITING_DTE: 'En espera de DTE',
  IN_TRANSIT: 'En tránsito',
  COMPLETED: 'Completa',
  CLOSED_INCOMPLETE: 'Cerrada incompleta',
  CANCELLED: 'Anulada'
};

export type SexComposition = 'MALE' | 'FEMALE' | 'MIXED';

export const SEX_COMPOSITION_LABELS: Record<SexComposition, string> = {
  MALE: 'Machos',
  FEMALE: 'Hembras',
  MIXED: 'Ambos'
};

export type TroopCondition = 'REGULAR' | 'GOOD' | 'VERY_GOOD' | 'EXCELLENT';

export const TROOP_CONDITION_LABELS: Record<TroopCondition, string> = {
  REGULAR: 'Regular',
  GOOD: 'Bueno',
  VERY_GOOD: 'Muy bueno',
  EXCELLENT: 'Excelente'
};

export type BatchNameMode = 'AUTO' | 'CUSTOM';

export interface EntryOrderBreed {
  id: number;
  position: number;
  letter: string;
  breed_id: number;
  breed_name: string | null;
  color_id: number | null;
  color_name: string | null;
  label: string;
}

export type ReceptionStatus = 'PENDING' | 'RECEIVED' | 'MISSING';

/** SHEET: marked on an ING-03 receipt sheet and scanned. */
export type ReceptionMethod = 'CHUTE' | 'MANUAL' | 'SHEET';

export interface EntryOrderAnimal {
  id: number;
  caravan_id: number;
  identification: string;
  sex: 'M' | 'H';
  breed_position: number | null;
  breed_letter: string | null;
  /** Taken on reception, if weighed. */
  entry_weight: number | null;
  caravan_movement_id: number | null;
  reception_status: ReceptionStatus;
  reception_status_label: string;
  received_at: string | null;
  reception_method: ReceptionMethod | null;
}

export interface EntryOrderDte {
  id: number;
  dte_number: string;
  dte_date: string;
  head_count: number;
  in_transit_count: number;
  received_count: number;
  missing_count: number;
  observations: string | null;
  loaded_by: { id: number; name: string | null } | null;
  created_at: string | null;
  /** Only in the detail. */
  animals?: EntryOrderAnimal[];
}

export type EntryOrderIncidentType = 'EXCESS_HEAD' | 'EXCESS_MALES' | 'EXCESS_FEMALES' | 'MISSING_HEAD' | 'MISSING_DTE' | 'UNLISTED_CARAVAN';

export const ENTRY_ORDER_INCIDENT_LABELS: Record<EntryOrderIncidentType, string> = {
  EXCESS_HEAD: 'Cabezas de más',
  EXCESS_MALES: 'Machos de más',
  EXCESS_FEMALES: 'Hembras de más',
  MISSING_HEAD: 'Caravanas que no llegarán',
  MISSING_DTE: 'Cabezas sin DTE',
  UNLISTED_CARAVAN: 'Caravana sin DTE'
};

export type ReceiptSheetStatus = 'ISSUED' | 'PARTIAL' | 'PROCESSED' | 'REPLACED';

/**
 * An ING-03 receipt sheet: the paper one DTE is received on at the chute, an appendix of the
 * order's ING-02. The system keeps which one went out and which of its pages came back scanned.
 */
/** How an ING-03 is weighed: a weight per line, or one average in the header. */
export type WeighingMode = 'INDIVIDUAL' | 'AVERAGE';

export interface EntryOrderReceiptSheet {
  id: number;
  number: number;
  /** "R1". */
  label: string;
  dte_id: number;
  dte_number: string;
  status: ReceiptSheetStatus;
  status_label: string;
  /** Issued or scanned in part: still expected back from the field. */
  is_active: boolean;
  /** Part of the paper: chosen when issued, changeable until it is printed. */
  weighing_mode: WeighingMode;
  weighing_mode_label: string;
  /** The caravans it printed, in print order. */
  caravan_ids: number[];
  page_count: number;
  processed_pages: number[];
  missing_pages: number[];
  issued_by: { id: number; name: string | null } | null;
  printed_at: string | null;
  processed_at: string | null;
  replaced_at: string | null;
  created_at: string | null;
}

/** Something to settle with the provider. Never blocks the order nor changes its status. */
export interface EntryOrderIncident {
  id: number;
  type: EntryOrderIncidentType;
  type_label: string;
  detail: string;
  metadata: Record<string, unknown>;
  status: 'OPEN' | 'RESOLVED';
  status_label: string;
  dte_id: number | null;
  dte_number: string | null;
  resolution: string | null;
  raised_by: { id: number; name: string | null } | null;
  resolved_by: { id: number; name: string | null } | null;
  resolved_at: string | null;
  created_at: string | null;
}

export interface EntryOrderHistoryEntry {
  id: number;
  from_status: EntryOrderStatus | null;
  to_status: EntryOrderStatus;
  action_user: { id: number; name: string | null } | null;
  reason: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string | null;
}

export interface EntryOrderSummary {
  id: number;
  code: string;
  number: number;
  status: EntryOrderStatus;
  status_label: string;
  is_open: boolean;
  is_editable: boolean;
  accepts_dte: boolean;
  /** Some caravan of its DTEs is still in transit. */
  accepts_reception: boolean;
  can_cancel: boolean;
  can_close_incomplete: boolean;
  kind: 'PLANNED' | 'REGISTERED';
  kind_label: string;
  provider: { id: number; name: string | null; cuit: string | null };
  farm: { id: number; name: string | null; renspa: string | null };
  auction_number: string | null;
  batch: { id: number; name: string | null } | null;
  /** Null on a draft that has no name yet; demanded when the purchase is confirmed. */
  batch_name: string | null;
  batch_name_mode: BatchNameMode;
  /** The troop fields below are null only on a draft that has not declared them yet. */
  head_count: number | null;
  category: { id: number | null; name: string | null; sex: 'M' | 'H' | 'BOTH' | null };
  sex_composition: SexComposition | null;
  sex_composition_label: string | null;
  male_count: number | null;
  female_count: number | null;
  condition: TroopCondition | null;
  condition_label: string | null;
  age_min_months: number | null;
  age_max_months: number | null;
  age_range: string | null;
  knows_to_eat: boolean | null;
  tick_vaccinated: boolean | null;
  shrink_percent: number | null;
  estimated_weight: number | null;
  min_weight: number | null;
  max_weight: number | null;
  purchase_date: string;
  responsable: string | null;
  observations: string | null;
  breeds: EntryOrderBreed[];
  /** Caravans with DTE; may exceed head_count when a DTE brought more. */
  with_dte_count: number;
  /** Head bought still waiting for their document. */
  pending_dte_count: number;
  in_transit_count: number;
  received_count: number;
  missing_count: number;
  open_incidents_count: number;
  dte_count: number;
  dtes: EntryOrderDte[];
  requested_by: { id: number; name: string | null } | null;
  confirmed_at: string | null;
  printed_at: string | null;
  first_dte_at: string | null;
  closed_at: string | null;
  closing_reason: string | null;
  created_at: string | null;
  /** The ING-03 sheets issued for its DTEs (issuer name only in the detail). */
  receipt_sheets: EntryOrderReceiptSheet[];
}

export interface EntryOrder extends EntryOrderSummary {
  with_dte_male_count?: number;
  with_dte_female_count?: number;
  incidents: EntryOrderIncident[];
  history: EntryOrderHistoryEntry[];
}

export interface EntryOrderWarning {
  code: string;
  message: string;
  row?: number;
}

export interface EntryOrderResult {
  order: EntryOrder;
  warnings: EntryOrderWarning[];
}

/** The troop as the "Alta de Lote Externo" form sends it. */
export interface StoreEntryOrderPayload {
  confirm?: boolean;
  provider_id: number;
  farm_id: number;
  auction_number: string | null;
  batch_name_mode: BatchNameMode;
  batch_name: string | null;
  /** Required to confirm; a draft may send them null. */
  head_count: number | null;
  category_id: number | null;
  sex_composition: SexComposition | null;
  male_count: number | null;
  female_count: number | null;
  condition: TroopCondition | null;
  age_min_months: number | null;
  age_max_months: number | null;
  knows_to_eat: boolean | null;
  tick_vaccinated: boolean | null;
  shrink_percent: number | null;
  estimated_weight: number | null;
  min_weight: number | null;
  max_weight: number | null;
  purchase_date: string;
  responsable: string | null;
  observations: string | null;
  breeds: { breed_id: number; color_id: number | null }[];
}

export interface DteAnimalPayload {
  caravana: string;
  sex: 'M' | 'H' | null;
  breed_position: number | null;
}

/** A DTE as loaded: no arrival date nor weights, the animals are received later. */
export interface LoadDtePayload {
  dte_number: string;
  dte_date: string;
  observations: string | null;
  animals: DteAnimalPayload[];
}

/** "Registrar ingreso": the DTE arrives with its animals, so it carries their entry day and weights. */
export interface RegisterEntryPayload extends Omit<StoreEntryOrderPayload, 'confirm'> {
  dte: LoadDtePayload & {
    entered_at: string;
    animals: (DteAnimalPayload & { weight: number | null })[];
  };
  close_incomplete_reason: string | null;
}

export interface ReceivePayload {
  method: ReceptionMethod;
  received_at: string;
  dte_id: number | null;
  /** `body_condition`: official scale 1 to 5, in steps of 0.5. */
  received: { caravan_id?: number; identification?: string; weight: number | null; body_condition?: number | null }[];
  missing: number[];
  reason: string | null;
  /** From a scanned ING-03: the sheet, the pages it covers and the animals no DTE lists. */
  receipt_sheet_id?: number | null;
  pages?: number[];
  unlisted?: { identification: string; sex: 'M' | 'H' | null; breed: string | null; coat?: string | null; weight: number | null; body_condition?: number | null }[];
}

export interface DteHeaderError {
  field: string;
  code: string;
  message: string;
}

export interface DteRowError extends DteHeaderError {
  row: number;
}

/** What a 422 of the API says, in the three shapes it can come: form, domain or DTE rows. */
export interface EntryOrderApiError {
  message?: string;
  code?: string;
  field?: string | null;
  errors?: Record<string, string[]>;
  header_errors?: DteHeaderError[];
  row_errors?: DteRowError[];
}

export const entryOrderApiError = (error: unknown): EntryOrderApiError | null =>
  (error as { response?: { data?: EntryOrderApiError } })?.response?.data ?? null;

export const entryOrderErrorMessage = (error: unknown, fallback: string): string => {
  const body = entryOrderApiError(error);

  if (body?.errors) return Object.values(body.errors)[0]?.[0] ?? fallback;
  if (body?.header_errors?.[0]) return body.header_errors[0].message;
  if (body?.row_errors?.[0]) return `Fila ${body.row_errors[0].row + 1}: ${body.row_errors[0].message}`;

  return body?.message ?? fallback;
};
