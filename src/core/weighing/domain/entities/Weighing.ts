/** Why an animal was put on the scale. Mirrors App\Core\Enums\WeighingTypeCode. */
export type WeighingTypeCode =
  | 'BIRTH'
  | 'WEANING'
  | 'CONTROL'
  | 'BATCH_CONTROL'
  | 'PRE_SERVICE'
  | 'PREGNANCY_CHECK'
  | 'ENTRY'
  | 'EXIT'
  | 'EMERGENCY';

export type WeighingMethod = 'INDIVIDUAL' | 'AVERAGE' | 'PORTABLE_FIELD' | 'ESTIMATED';

export type ShrunkCondition = 'FULL_WEIGHT' | 'SHRUNK_12H' | 'CALCULATED';

export type WeighingSource =
  | 'MANUAL'
  | 'WEIGHING_ORDER'
  | 'WEANING'
  | 'ACTIVITY_CHANGE'
  | 'ENTRY'
  | 'BIRTH'
  | 'IMPORT';

export interface WeighingType {
  id: number;
  code: WeighingTypeCode;
  name: string;
  description: string | null;
  affects_adpv: boolean;
  default_method: WeighingMethod;
  default_shrunk_condition: ShrunkCondition;
  /** Can be measured on one animal (everything but a cage re-weighing). */
  allows_individual: boolean;
  /** Can be measured on a batch as a whole (everything but birth and an individual control). */
  allows_group: boolean;
  display_order: number;
  is_system: boolean;
  is_active: boolean;
}

/** One entry of the weight history of an animal, as returned by GET /caravans/{id}/weights. */
export interface CaravanWeightRecord {
  id: number;
  caravan_id: number;
  weight: number;
  current: boolean;
  weighing_date: string;
  weighing_time: string | null;
  weighing_type: WeighingTypeCode;
  weighing_type_name: string;
  affects_adpv: boolean;
  method: WeighingMethod;
  shrunk_condition: ShrunkCondition;
  shrink_pct: number | null;
  source: WeighingSource;
  notes: string | null;
  created_at: string | null;
}

export interface RecordCaravanWeightPayload {
  weight: number;
  weighing_date: string;
  weighing_time?: string | null;
  weighing_type?: WeighingTypeCode;
  method?: WeighingMethod;
  shrunk_condition?: ShrunkCondition;
  shrink_pct?: number | null;
  notes?: string;
}

export const WEIGHING_METHOD_LABELS: Record<WeighingMethod, string> = {
  INDIVIDUAL: 'Individual (manga)',
  AVERAGE: 'Promedio (jaula / camión)',
  PORTABLE_FIELD: 'Balanza portátil',
  ESTIMATED: 'Estimado (cinta)',
};

export const SHRUNK_CONDITION_LABELS: Record<ShrunkCondition, string> = {
  FULL_WEIGHT: 'Peso lleno',
  SHRUNK_12H: 'Desbaste 12 h',
  CALCULATED: 'Desbaste calculado',
};

/** Methods that describe one animal on a scale. An average only exists as a batch weighing. */
export const INDIVIDUAL_WEIGHING_METHODS: WeighingMethod[] = ['INDIVIDUAL', 'PORTABLE_FIELD', 'ESTIMATED'];

/** One load of a cage or truck scale. */
export interface CageGroupInput {
  head_count: number;
  gross_weight: number;
  tare_weight: number;
}

/** What the operator wrote down: each cage load, or the average per head already worked out. */
export type BatchWeighingEntry = 'AVERAGE' | 'LOADS';

export interface RegisterBatchWeighingPayload {
  batch_id: number;
  weighing_type: WeighingTypeCode;
  weighing_date: string;
  weighing_time?: string | null;
  shrunk_condition: ShrunkCondition;
  shrink_pct?: number | null;
  responsable?: string | null;
  observations?: string | null;
  entry: BatchWeighingEntry;
  /** AVERAGE only. */
  average_weight?: number;
  head_count?: number;
  /** LOADS only. */
  groups?: CageGroupInput[];
}

export interface WeighingOrderGroup extends CageGroupInput {
  sequence: number;
  net_weight: number;
  average_weight: number;
}

export interface WeighingOrder {
  id: number;
  code: string;
  status: string;
  status_label: string;
  kind: 'PLANNED' | 'REGISTERED';
  mode: 'INDIVIDUAL' | 'GROUP';
  weighing_type: WeighingTypeCode;
  weighing_type_name: string;
  batch_id: number | null;
  batch_name: string | null;
  shrunk_condition: ShrunkCondition;
  shrink_pct: number | null;
  weighing_date: string;
  weighing_time: string | null;
  planned_head_count: number;
  weighed_count: number;
  total_heads: number;
  total_net_weight: number;
  average_weight: number | null;
  entry: BatchWeighingEntry | null;
  groups: WeighingOrderGroup[];
  responsable: string | null;
  observations: string | null;
  created_at: string | null;
}
