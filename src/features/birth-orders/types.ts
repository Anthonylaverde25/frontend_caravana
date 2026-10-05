import type { TransferOrderHistoryEntry, TransferOrderKind, TransferOrderStatus } from '@/features/transfer-orders/types';

/**
 * A birth order (PAR-01) as the API returns it.
 *
 * It shares the lifecycle and the kind of transfer and weaning orders, with the same codes and
 * labels, so the chips, the status filter and the history timeline are theirs. What differs: there
 * is no destination (each calf is born in its mother's batch), the roll is of pregnant FEMALES, and
 * each line ends in what happened to her — a live calf (V), a calf born dead (NM, charged to the
 * mother), a calf that died at foot (M, charged to the calf) or a loss registered outside the sheet.
 * Before that, a line may be OVERDUE: she passed her due date without calving (N), an alert.
 */
export type BirthOrderStatus = TransferOrderStatus;
export type BirthOrderKind = TransferOrderKind;
export type BirthOrderAnimalStatus = 'PENDING' | 'OVERDUE' | 'BORN' | 'BORN_DIED' | 'LOST' | 'SKIPPED';

/** Still waiting for the calving: the reprinted sheet lists these. */
export const isOpenBirthLine = (status: BirthOrderAnimalStatus): boolean => status === 'PENDING' || status === 'OVERDUE';

/** Already registered: a reloaded sheet skips these. */
export const isResolvedBirthLine = (status: BirthOrderAnimalStatus): boolean =>
  status === 'BORN' || status === 'BORN_DIED' || status === 'LOST';

/**
 * Declared, never inferred from a calf tag being written. ABORTION is legacy: lines registered
 * before the abortion left the sheet. It is never offered.
 */
export type BirthOutcome = 'LIVE' | 'STILLBORN' | 'PERINATAL_DEATH' | 'ABORTION';

/** The outcomes the sheet and the screen offer. */
export const BIRTH_OUTCOMES: BirthOutcome[] = ['LIVE', 'STILLBORN', 'PERINATAL_DEATH'];

export const BIRTH_OUTCOME_LABELS: Record<BirthOutcome, string> = {
  LIVE: 'Parió',
  STILLBORN: 'Nació muerto',
  PERINATAL_DEATH: 'Murió al pie',
  ABORTION: 'Aborto'
};

/** The letters the PAR-01 sheet prints next to each box, and the ones the scan reads back. */
export const BIRTH_OUTCOME_MARKS: Record<BirthOutcome, string> = {
  LIVE: 'V',
  STILLBORN: 'NM',
  PERINATAL_DEATH: 'M',
  ABORTION: 'A'
};

/** The box "No parió": she passed her due date without calving. */
export const OVERDUE_MARK = 'N';

const normalizeMark = (text: string | null | undefined): string =>
  (text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ');

/** One outcome as a sheet or a screen wrote it, or null when it is none of the three. */
export const birthOutcomeFromText = (text: string | null | undefined): BirthOutcome | null => {
  const value = normalizeMark(text);

  if (['LIVE', 'V', 'VIVO', 'VIVA', 'PARIO', 'PARTO', 'NACIO VIVO'].includes(value)) return 'LIVE';
  if (['STILLBORN', 'NM', 'NACIO MUERTO', 'NACIDO MUERTO', 'NACIDA MUERTA', 'MUERTO AL NACER'].includes(value)) return 'STILLBORN';
  if (['PERINATAL_DEATH', 'M', 'MURIO', 'MUERTO', 'MUERTA', 'MURIO AL PIE', 'MUERTO AL PIE'].includes(value)) return 'PERINATAL_DEATH';

  return null;
};

/** The "resultado" cell, read: at most one outcome, plus the N. The mirror of the API's BirthSheetMark. */
export interface BirthSheetMark {
  outcome: BirthOutcome | null;
  overdue: boolean;
  abortion: boolean;
  /** Two outcomes at once, or something that is not a mark. */
  ambiguous: boolean;
  empty: boolean;
}

export const parseBirthSheetMark = (text: string | null | undefined): BirthSheetMark => {
  const value = normalizeMark(text);
  const outcomes = new Set<BirthOutcome>();
  let overdue = false;
  let abortion = false;
  let unknown = false;

  const parts = value === '' ? [] : value.split(/[,;/+|]+/).map((part) => part.trim()).filter(Boolean);
  const tokens = parts.flatMap((part) =>
    birthOutcomeFromText(part) || ['N', 'NO PARIO'].includes(part) || part.includes(' ') === false ? [part] : part.split(' ')
  );

  tokens.forEach((token) => {
    const outcome = birthOutcomeFromText(token);

    if (outcome) outcomes.add(outcome);
    else if (['N', 'NO PARIO', 'OVERDUE'].includes(token)) overdue = true;
    else if (['A', 'ABORTO', 'ABORTADA', 'ABORTION'].includes(token)) abortion = true;
    else unknown = true;
  });

  return {
    outcome: outcomes.size === 1 ? [...outcomes][0] : null,
    overdue,
    abortion,
    ambiguous: outcomes.size > 1 || unknown,
    empty: tokens.length === 0
  };
};

/** The cell a sheet would carry for an outcome and the N: "N, V", "NM", "N". */
export const birthSheetMarkText = (outcome: BirthOutcome | null, overdue: boolean): string =>
  [overdue ? OVERDUE_MARK : null, outcome ? BIRTH_OUTCOME_MARKS[outcome] : null].filter(Boolean).join(', ');

export const GESTATION_STAGE_LABELS: Record<string, string> = { head: 'Cabeza', body: 'Cuerpo', tail: 'Cola' };

export interface BirthOrderSire {
  id: number;
  identification: string;
  is_confirmed: boolean;
}

export interface BirthOrderAnimal {
  id: number;
  /** The mother. */
  caravan_id: number;
  identification: string | null;
  category_label: string | null;
  gestation_id: number | null;
  gestation_start_date: string | null;
  estimated_due_date: string | null;
  gestation_stage: string | null;
  /** Candidate sires of the gestation. Never printed; offered in the review and on the screen. */
  sires: BirthOrderSire[];
  /** The sire the system uses if none is declared: the confirmed one, or the only candidate. */
  suggested_sire_id: number | null;
  source_batch_id: number | null;
  source_batch_name: string | null;
  current_batch_id: number | null;
  current_batch_name: string | null;
  /** A calving found at a round that the order did not list. */
  unplanned: boolean;
  status: BirthOrderAnimalStatus;
  outcome: BirthOutcome | null;
  outcome_label: string | null;
  /** A line closed by a loss registered outside the sheet (Monitoreo Gestacional): its real reason. */
  loss_reason_code: string | null;
  loss_reason_label: string | null;
  event_date: string | null;
  /** N: the day she was found past her due date without calving. Kept after she calves. */
  overdue_reported_at: string | null;
  /** Days since the N, while the line is still OVERDUE. */
  overdue_days: number | null;
  overdue_notes: string | null;
  calf_caravan_id: number | null;
  calf_identification: string | null;
  calf_sex: string | null;
  calf_batch_id: number | null;
  calf_batch_name: string | null;
  executed_at: string | null;
  observations: string | null;
}

export interface BirthOrderSourceBatch {
  id: number;
  name: string | null;
  head_count: number;
}

export interface BirthOrderSummary {
  id: number;
  code: string;
  status: BirthOrderStatus;
  status_label: string;
  is_open: boolean;
  is_editable: boolean;
  kind: BirthOrderKind;
  kind_label: string;
  period_start: string | null;
  period_end: string | null;
  source_batches: BirthOrderSourceBatch[];
  planned_head_count: number;
  /** Planned plus the unplanned calvings found at the rounds. */
  head_count: number;
  resolved_head_count: number;
  born_head_count: number;
  /** Calved a live calf that died at foot. */
  born_died_head_count: number;
  lost_head_count: number;
  stillborn_head_count: number;
  /** Lines closed by a loss registered outside the sheet. */
  external_loss_head_count: number;
  /** Legacy: abortions marked on the sheet before they left it. */
  abortion_head_count: number;
  /** Open lines: PENDING and OVERDUE. */
  pending_head_count: number;
  /** Past their due date without calving. */
  overdue_head_count: number;
  skipped_head_count: number;
  unplanned_head_count: number;
  requested_by: { id: number; name: string | null } | null;
  emitted_at: string | null;
  printed_at: string | null;
  first_executed_at: string | null;
  closed_at: string | null;
  responsable: string | null;
  observations: string | null;
  closing_reason: string | null;
  created_at: string | null;
}

export interface BirthOrder extends BirthOrderSummary {
  animals: BirthOrderAnimal[];
  history: TransferOrderHistoryEntry[];
}

/** POST /birth-orders (and PUT on a draft). */
export interface EmitBirthOrderPayload {
  period_start: string | null;
  period_end: string | null;
  responsable?: string | null;
  observations?: string | null;
  animals: { caravan_id: number }[];
  /** False (the default) saves a draft; true creates the order already issued. */
  issue?: boolean;
}

/** What the screen declares for one female: the outcome and, for a live calf, its data. */
export interface BirthFieldPayload {
  caravan_id: number;
  outcome: BirthOutcome | null;
  /** "No parió en fecha" (N). */
  overdue?: boolean;
  calf_identification?: string | null;
  calf_sex?: 'M' | 'H' | null;
  calf_weight?: number | null;
  calf_breed_id?: number | null;
  /** The coat (pelaje): a colour of the catalog that the breed admits. */
  calf_color_id?: number | null;
  calf_teeth?: number | null;
  /** Optional: left empty, the gestation's single or confirmed sire is used, or it waits in "Sires pendientes". */
  father_id?: number | null;
  birth_date?: string | null;
  observations?: string | null;
}

/** POST /birth-orders/register. */
export interface RegisterBirthsPayload extends Omit<EmitBirthOrderPayload, 'animals' | 'issue'> {
  animals: BirthFieldPayload[];
}

/** POST /birth-orders/{id}/execute. */
export interface ExecuteBirthOrderBody {
  round_date?: string;
  animals: BirthFieldPayload[];
}

export interface BirthWarning {
  code: string;
  message: string;
  row_index?: number | null;
  field?: string;
}

/** What the PAR-01 result says about the order it fulfilled. */
export interface BirthOrderExecutionSummary {
  id: number;
  code: string;
  status: BirthOrderStatus;
  status_label: string;
  kind: BirthOrderKind;
  planned_head_count: number;
  head_count: number;
  resolved_now: number;
  resolved_head_count: number;
  born_head_count: number;
  born_died_head_count: number;
  lost_head_count: number;
  pending_head_count: number;
  overdue_head_count: number;
  pending_identifications: string[];
  overdue_animals: { identification: string; overdue_reported_at: string | null; estimated_due_date: string | null }[];
  /** The order was created on confirming a scanned sheet that carried none. */
  created_from_sheet?: boolean;
}

/** The PAR-01 result, from a scanned sheet, an order executed on the screen or a registration. */
export interface BirthResult {
  resolved_count: number;
  live_count: number;
  stillborn_count: number;
  perinatal_death_count: number;
  overdue_new_count: number;
  overdue_resolved_count: number;
  overdue_open_count: number;
  already_registered_count: number;
  differs_count: number;
  males_count: number;
  females_count: number;
  unplanned_count: number;
  calves: { mother: string; calf: string; sex: string; batch_id: number | null; batch_name: string | null; father_id: number | null }[];
  overdue_new: { mother: string; overdue_reported_at: string; estimated_due_date: string | null }[];
  overdue_resolved: {
    mother: string;
    overdue_reported_at: string;
    event_date: string;
    days_after_report: number;
    days_after_due: number | null;
  }[];
  already_registered: { row_index: number; caravana_madre: string; kind: 'already' | 'overdue_kept'; message: string }[];
  warnings: BirthWarning[];
  birth_order: BirthOrderExecutionSummary;
}

export interface RegisterBirthsResult {
  message: string;
  order: BirthOrder;
  data: BirthResult;
}

/** One row problem of a PAR-01 422: the cell it points at, when it points at one. */
export interface BirthRowError {
  row_index: number;
  caravana_madre: string;
  errors: { code: string; message: string; field?: string }[];
}

/** The rows of a PAR-01 422, or none. */
export const birthRowErrors = (error: unknown): BirthRowError[] =>
  (error as { response?: { data?: { row_errors?: BirthRowError[] } } } | null)?.response?.data?.row_errors ?? [];

/** The API's domain error body, or the first per-row / per-header problem of a PAR-01 422. */
export const birthOrderErrorMessage = (error: unknown, fallback: string): string => {
  const body = (
    error as {
      response?: {
        data?: {
          message?: string;
          errors?: Record<string, string[]>;
          header_errors?: { message: string }[];
          row_errors?: BirthRowError[];
        };
      };
    }
  )?.response?.data;

  if (body?.errors) return Object.values(body.errors)[0]?.[0] ?? fallback;
  if (body?.header_errors?.[0]) return body.header_errors[0].message;
  if (body?.row_errors?.[0]) return `${body.row_errors[0].caravana_madre}: ${body.row_errors[0].errors[0]?.message ?? fallback}`;

  return body?.message ?? fallback;
};
