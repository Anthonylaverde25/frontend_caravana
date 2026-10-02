/**
 * Entry orders of external livestock (ING-02). An order is the record of a purchase: it is born
 * without caravans and waits for the DTE (documento de tránsito electrónico) that lists them.
 */

export type EntryOrderStatus = 'DRAFT' | 'AWAITING_DTE' | 'PARTIAL' | 'COMPLETED' | 'CLOSED_INCOMPLETE' | 'CANCELLED';

export const ENTRY_ORDER_STATUS_LABELS: Record<EntryOrderStatus, string> = {
  DRAFT: 'Borrador',
  AWAITING_DTE: 'En espera de DTE',
  PARTIAL: 'DTE parcial',
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

export interface EntryOrderAnimal {
  id: number;
  caravan_id: number;
  identification: string;
  sex: 'M' | 'H';
  breed_position: number | null;
  breed_letter: string | null;
  entry_weight: number | null;
  caravan_movement_id: number | null;
}

export interface EntryOrderDte {
  id: number;
  dte_number: string;
  dte_date: string;
  entered_at: string;
  head_count: number;
  observations: string | null;
  loaded_by: { id: number; name: string | null } | null;
  created_at: string | null;
  /** Only in the detail. */
  animals?: EntryOrderAnimal[];
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
  kind: 'PLANNED' | 'REGISTERED';
  kind_label: string;
  provider: { id: number; name: string | null; cuit: string | null };
  farm: { id: number; name: string | null; renspa: string | null };
  auction_number: string | null;
  batch: { id: number; name: string | null } | null;
  batch_name: string;
  batch_name_mode: BatchNameMode;
  head_count: number;
  category: { id: number; name: string | null; sex: 'M' | 'H' | 'BOTH' | null };
  sex_composition: SexComposition;
  sex_composition_label: string;
  male_count: number | null;
  female_count: number | null;
  condition: TroopCondition;
  condition_label: string;
  age_min_months: number | null;
  age_max_months: number | null;
  age_range: string | null;
  knows_to_eat: boolean;
  tick_vaccinated: boolean;
  shrink_percent: number | null;
  estimated_weight: number;
  min_weight: number | null;
  max_weight: number | null;
  purchase_date: string;
  responsable: string | null;
  observations: string | null;
  breeds: EntryOrderBreed[];
  entered_count: number;
  pending_count: number;
  dte_count: number;
  dtes: EntryOrderDte[];
  requested_by: { id: number; name: string | null } | null;
  confirmed_at: string | null;
  printed_at: string | null;
  first_dte_at: string | null;
  closed_at: string | null;
  closing_reason: string | null;
  created_at: string | null;
}

export interface EntryOrder extends EntryOrderSummary {
  entered_male_count?: number;
  entered_female_count?: number;
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
  head_count: number;
  category_id: number;
  sex_composition: SexComposition;
  male_count: number | null;
  female_count: number | null;
  condition: TroopCondition;
  age_min_months: number | null;
  age_max_months: number | null;
  knows_to_eat: boolean;
  tick_vaccinated: boolean;
  shrink_percent: number | null;
  estimated_weight: number;
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
  weight: number | null;
}

export interface LoadDtePayload {
  dte_number: string;
  dte_date: string;
  entered_at: string;
  observations: string | null;
  animals: DteAnimalPayload[];
}

export interface RegisterEntryPayload extends Omit<StoreEntryOrderPayload, 'confirm'> {
  dte: LoadDtePayload;
  close_incomplete_reason: string | null;
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
