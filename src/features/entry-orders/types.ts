/**
 * Entry orders of external livestock (ING-02). An order is the record of a purchase: it is born
 * without caravans and waits for its DTEs (documento de tránsito electrónico), each declaring how
 * many head are on their way. Those head are in transit until their animals arrive, and each
 * caravan is written down when it is received. The status tells what it waits for.
 */

export type EntryOrderStatus = 'DRAFT' | 'AWAITING_DTE' | 'IN_TRANSIT' | 'RECEIVED' | 'COMPLETED' | 'CLOSED_INCOMPLETE' | 'CANCELLED';

export const ENTRY_ORDER_STATUS_LABELS: Record<EntryOrderStatus, string> = {
  DRAFT: 'Borrador',
  AWAITING_DTE: 'En espera de DTE',
  IN_TRANSIT: 'En tránsito',
  RECEIVED: 'Recibida · por identificar',
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

/**
 * One category bought with its head ("30 Novillito"). Its number is what a received animal refers
 * to (CAT) when its sex admits more than one of the order's categories.
 */
export interface EntryOrderCategory {
  id: number;
  position: number;
  category_id: number;
  name: string | null;
  sex: 'M' | 'H' | 'BOTH' | null;
  /** Null only on a draft that has not declared it yet. */
  head_count: number | null;
  label: string;
}

/** SHEET: written on an ING-03 receipt sheet and scanned. CHUTE only on old rows. */
export type ReceptionMethod = 'CHUTE' | 'MANUAL' | 'SHEET';

/**
 * What the chute saw on an animal as it came off the truck: an injured eye, a damaged ear, a limb
 * problem (APLOMO on paper: lameness or a knock on the legs).
 */
export type ArrivalFindingCode = 'EYE' | 'EAR' | 'LIMB';

export const ARRIVAL_FINDINGS: { code: ArrivalFindingCode; label: string; short: string }[] = [
  { code: 'EYE', label: 'Ojo', short: 'Ojo' },
  { code: 'EAR', label: 'Oreja', short: 'Oreja' },
  { code: 'LIMB', label: 'Aplomo (renguera o golpe en patas)', short: 'Aplomo' }
];

/** A caravan received on a DTE: it only exists once the animal arrived. */
export interface EntryOrderAnimal {
  id: number;
  caravan_id: number;
  identification: string;
  sex: 'M' | 'H';
  breed_position: number | null;
  breed_letter: string | null;
  /** The order's category line it entered with. */
  category_position: number | null;
  /** Taken on reception, if weighed. */
  entry_weight: number | null;
  caravan_movement_id: number | null;
  received_at: string;
  reception_method: ReceptionMethod | null;
  /** The boxes marked on its reception line. */
  arrival_findings: ArrivalFindingCode[];
}

/** A DTE declares head, not caravans: what is in transit is a count. */
export interface EntryOrderDte {
  id: number;
  dte_number: string;
  dte_date: string;
  /** Head the document declares. */
  head_count: number;
  received_count: number;
  /** Head declared as never arriving. */
  missing_head_count: number;
  /** Caravans written down on it. */
  caravaned_count: number;
  /** Head received by count whose caravan is still to write (on an ING-03 or by hand). */
  uncaravaned_count: number;
  /** Lines an ING-03 of it expects: head in transit plus head received without caravan. */
  to_identify_count: number;
  /** Head still in transit: declared − received − missing, never below zero. */
  pending_count: number;
  /** Animals received over the head declared. */
  excess_count: number;
  /** Received + missing: the floor a correction of the head can go to. */
  accounted_count: number;
  observations: string | null;
  loaded_by: { id: number; name: string | null } | null;
  created_at: string | null;
  /** The caravans received on it; only in the detail. */
  animals?: EntryOrderAnimal[];
  /** Caravans that came off the truck with each finding; only in the detail. */
  arrival_findings_count?: Record<ArrivalFindingCode, number>;
}

export type EntryOrderIncidentType =
  | 'EXCESS_HEAD'
  | 'EXCESS_MALES'
  | 'EXCESS_FEMALES'
  | 'MISSING_HEAD'
  | 'MISSING_DTE'
  | 'ARRIVAL_EXCESS'
  | 'BREED_MISMATCH';

export const ENTRY_ORDER_INCIDENT_LABELS: Record<EntryOrderIncidentType, string> = {
  EXCESS_HEAD: 'Cabezas de más',
  EXCESS_MALES: 'Machos de más',
  EXCESS_FEMALES: 'Hembras de más',
  MISSING_HEAD: 'Cabezas que no llegarán',
  MISSING_DTE: 'Cabezas sin DTE',
  ARRIVAL_EXCESS: 'Cabezas de más en la llegada',
  BREED_MISMATCH: 'Raza distinta a la comprada'
};

export type ReceiptSheetStatus = 'ISSUED' | 'PARTIAL' | 'PROCESSED' | 'REPLACED';

/** How an ING-03 is weighed: a weight per line, or one average in the header. */
export type WeighingMode = 'INDIVIDUAL' | 'AVERAGE';

/**
 * How an ING-03 asks for the breed, coat and category of each line, when the order leaves them to
 * each animal: written in words, or by the header's reference (a letter and a number).
 */
export type ReferenceMode = 'WRITTEN' | 'CODE';

/**
 * An ING-03 receipt sheet: the paper one DTE is received on at the chute, an appendix of the
 * order's ING-02 — a blank line per head in transit, where the chute writes each caravan. The
 * system keeps which one went out and which of its pages came back scanned.
 */
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
  /** Part of the paper too: breed, coat and category written in words or by code. */
  reference_mode: ReferenceMode;
  reference_mode_label: string;
  /** Head the DTE declared when it was issued. */
  dte_head_count: number;
  /** Head in transit when it was issued: its blank lines. */
  expected_head_count: number;
  /** Lines printed, free ones included. */
  row_count: number;
  /** Still out, but the DTE's head were corrected since. */
  outdated: boolean;
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
  /** Some head of its DTEs are still in transit. */
  accepts_reception: boolean;
  /** Its DTEs' head can be corrected: animals may still arrive. */
  can_correct_dtes: boolean;
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
  /** Sum of its categories' head. The troop fields below are null only on a draft that has not declared them yet. */
  head_count: number | null;
  categories: EntryOrderCategory[];
  /** Some animal's sex admits more than one category: each received line says which (CAT). */
  needs_category_per_animal: boolean;
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
  /** Head declared by the DTEs; may exceed head_count when a DTE declared more. */
  with_dte_count: number;
  /** Head bought still waiting for their document. */
  pending_dte_count: number;
  /** Head of the DTEs still on their way. */
  in_transit_count: number;
  received_count: number;
  /** Head received by count whose caravan is still to write. */
  uncaravaned_count: number;
  /** Head declared as never arriving. */
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
  /** Only on an order of both sexes. */
  received_male_count?: number;
  received_female_count?: number;
  /** Only on an order of several categories: head received per category line. */
  received_by_category?: { position: number; received_count: number }[];
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
  /** One line per category bought; the order's head is their sum. Required to confirm. */
  categories: { category_id: number; head_count: number | null }[];
  /** Required to confirm; a draft may send them null. */
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

/** A DTE as loaded: the head it declares. No caravans: they are written down on arrival. */
export interface LoadDtePayload {
  dte_number: string;
  dte_date: string;
  head_count: number;
  observations: string | null;
}

/**
 * An animal received: its caravan and, when the order needs them, sex (order of both sexes), breed
 * line (order with several) and category line (when its sex admits several of the order's) — by
 * position, or as written on an ING-03 printed with words (`*_text`, resolved by the server).
 * `body_condition`: official scale 1 to 5, in steps of 0.5.
 */
export interface ReceivedAnimalPayload {
  caravana: string;
  sex: 'M' | 'H' | null;
  breed_position: number | null;
  category_position?: number | null;
  breed_text?: string | null;
  color_text?: string | null;
  category_text?: string | null;
  weight: number | null;
  body_condition: number | null;
  arrival_findings?: ArrivalFindingCode[];
}

/** "Registrar ingreso": the DTE arrives with its animals, so it carries their entry day. */
export interface RegisterEntryPayload extends Omit<StoreEntryOrderPayload, 'confirm'> {
  dte: LoadDtePayload & {
    entered_at: string;
    animals: ReceivedAnimalPayload[];
  };
  close_incomplete_reason: string | null;
}

/**
 * A reception of one DTE. By hand it confirms `received_head_count`, the head that arrived: that
 * closes the DTE, a difference raises an incident, and its caravans are optional. Without it (an
 * ING-03, or caravans written later) each animal is a caravan, and head left out stay in transit
 * unless declared missing, with a reason.
 */
export interface ReceivePayload {
  received_head_count?: number | null;
  /** The SENASA TRI its caravans were read from, if one was attached. */
  tri_number?: string | null;
  method: 'MANUAL' | 'SHEET';
  received_at: string;
  dte_id: number | null;
  animals: ReceivedAnimalPayload[];
  missing_head_count: number;
  reason: string | null;
  /** From a scanned ING-03: the sheet and the pages it covers. */
  receipt_sheet_id?: number | null;
  pages?: number[];
}

/**
 * What the AI read on the TRI (Tarjeta de Registro Individual de Tropa, SENASA) attached to a
 * reception: its caravans in item order, and what looks wrong, to review before receiving.
 */
export interface TriReading {
  tri_numbers: string[];
  pages: { file_name: string; page: number | null; total: number | null; caravans: number; error: string | null }[];
  caravans: { caravana: string; item: number | null; page: number | null }[];
  /** Written twice on the TRI: kept once. */
  repeated: string[];
  /** Already in the system: the reception will reject them. */
  existing: string[];
  warnings: string[];
}

/** "Corregir cabezas" of a DTE loaded wrong. */
export interface CorrectDteHeadCountPayload {
  head_count: number;
  reason: string;
}

export interface DteHeaderError {
  field: string;
  code: string;
  message: string;
}

export interface DteRowError extends DteHeaderError {
  row: number;
  /** A written breed, coat or category that fits several lines, or none: what it could say. */
  candidates?: string[];
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
