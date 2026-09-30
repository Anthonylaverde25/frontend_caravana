import type { TransferOrderExecutionSummary } from '@/features/transfer-orders/types';


export interface WorkTemplateScanRow {
  id?: string | number;
  caravana: string;
  confidence?: number;
  observations: string;

  // ING-01 specific fields
  category?: string;
  sex?: string;
  breed?: string;
  teeth?: string | number;
  entry_weight?: string | number;

  // TOR-01 specific fields
  ce_cm?: string | number;
  bcs?: string | number;
  libido?: string;
  aplomos?: string;
  scrape_collected?: boolean;
  scrape_tube?: string;
  serology_collected?: boolean;
  serology_tube?: string;
  physical_verdict?: string; // 'A' | 'R' | 'T'
}

export interface Tor01Metadata {
  farm_name: string;
  renspa: string;
  veterinarian_name: string;
  veterinarian_license: string;
  sample_round: number;
  evaluation_date: string;
}

export interface Ing01Metadata {
  batch_name: string;
  activity_name: string;
  entry_date: string;
  provider_cuit: string;
  provider_renspa: string;
  guia_dte: string;
}

export interface Lser01Metadata {
  lote: string;
  toro_caravana: string;
  planned_start_date: string;
  planned_end_date: string;
  responsable: string;
  observaciones: string;
}

export interface Lser01Error {
  code: string;
  message: string;
}

export interface Lser01HeaderError extends Lser01Error {
  field: string;
}

export interface Lser01RowError {
  row_index: number;
  caravana: string;
  errors: Lser01Error[];
}

/** 422 body returned by POST /work-templates/lser-01/process. */
export interface Lser01ValidationErrors {
  message: string;
  header_errors: Lser01HeaderError[];
  row_errors: Lser01RowError[];
}

export interface Dest01Metadata {
  /** The weaning order code as read off paper (DS-YYYYMMDD-NNNN); blank on a sheet printed blank. */
  orden_destete: string;
  lote_destete: string;
  /** The CORRAL / PASTURA box of the header, for the single weaning batch. */
  sistema_manejo: string;
  fecha_destete: string;
  tipo_destete: string;
  lote_origen: string;
  responsable: string;
  observaciones: string;
}

/**
 * A weaning batch named on the sheet, as the operator resolved it: an existing weaning batch or a
 * new one, with its management system when it is new. The first proposal comes from the name read
 * on the sheet (or from the order); `touched` stops re-proposing once the operator has chosen.
 */
export interface Dest01BatchTarget {
  mode: 'existing' | 'new';
  batchId: number | null;
  name: string;
  /** Only for a new batch: corral, pasture, or not answered yet. */
  isConfined: boolean | null;
  touched: boolean;
}

/** One weaning batch for every calf (the header names it), or a batch per calf (a column). */
export type Dest01DestinationMode = 'single' | 'per_animal';

export interface Dest01Row {
  id: string;
  /** Key of the scanned page the row comes from; `manual` for rows added on screen. */
  pageKey: string;
  caravana: string;
  caravana_madre: string;
  peso: string;
  observations: string;
  /** The C/S nueva cell as read: a category, a subcategory or both. Blank = no change. */
  cs_nueva: string;
  /** Per animal: the weaning batch of this calf, as written. Blank = a calf without destination. */
  lote_destino: string;
  /** Per animal: the C / P letter of the batch of this row. */
  manejo: string;
}

export interface Dest01Page {
  key: string;
  fileName: string;
  previewUrl: string | null;
  hojaNumero: number | null;
  hojaTotal: number | null;
  metadata: Dest01Metadata;
  rows: Dest01Row[];
}

export type Dest01Error = Lser01Error;
export type Dest01HeaderError = Lser01HeaderError;
export type Dest01RowError = Lser01RowError;

/** 422 body returned by POST /work-templates/dest-01/process. */
export type Dest01ValidationErrors = Lser01ValidationErrors;

export interface Cact01Metadata {
  actividad_origen: string;
  /**
   * The destination activity, resolved against the catalogue.
   *
   * One per sheet, all its pages included, and the restriction every destination obeys: a
   * batch written by hand at the chute has to belong to THIS activity. It is what the
   * backend validates against; the text below is only what the paper said.
   */
  actividad_destino_id: number | null;
  /** As read off the paper. Kept for the control message when it disagrees with the id. */
  actividad_destino: string;
  lote_origen: string;
  /** The destination for ALL the animals. Blank on a per-animal sheet: it has none. */
  lote_destino: string;
  /**
   * The sheet carries a destination per animal. Then there is no sheet-wide destination: what
   * the header says is not inherited, and a blank row cell is an animal with no destination
   * yet, to be set in that very cell.
   */
  destino_por_animal: boolean;
  fecha_movimiento: string;
  /** 'CORRAL' | 'PASTURA' | '' */
  sistema_manejo: string;
  total_cabezas: string;
  peso_total: string;
  responsable: string;
  observaciones: string;
  /**
   * The transfer order code printed in the header box, as read. Blank on a sheet filled in
   * without an order, which is still a valid sheet.
   */
  orden_transferencia: string;
}

/**
 * One distinct destination read off the sheet, as the operator resolved it.
 *
 * `key` is the normalised name written on paper; it is what joins rows to destinations.
 * The paper only ever carries that name — the activity, the batch type and the
 * management system of a batch to be created are declared here, on screen, because a
 * sheet cannot configure a batch.
 */
export interface Cact01Destination {
  key: string;
  /** Label as first read, kept for display even after the operator picks another batch. */
  label: string;
  mode: 'existing' | 'new';
  batchId: number | null;
  name: string;
  activityId: number | null;
  batchTypeId: number | null;
  /** true = penned, false = pasture, null = not answered yet. */
  isConfined: boolean | null;
  /** Stops re-proposing a match once the operator has chosen. */
  touched: boolean;
}

export interface Cact01Row {
  id: string;
  /** Key of the scanned page the row comes from; `manual` for rows added on screen. */
  pageKey: string;
  caravana: string;
  peso_actual: string;
  /** The animal's sex as the system knows it by its tag; the sheet's is only illustrative. */
  sexo: string;
  categoria: string;
  dientes: string;
  /** Normalised destination key: the row cell when written, the header otherwise. */
  destination_key: string;
  /**
   * The M cell: 'C' for corral, 'P' for pastura, '' when it was left blank.
   *
   * It describes the BATCH named in `destination_key`, not the animal. It rides on the row
   * because that is where the paper has room for it, which is also why two rows naming the
   * same new batch with different letters is a contradiction the operator has to settle.
   */
  manejo: string;
  /**
   * The C/S nueva cell: the new category or subcategory as written ("Novillito", "Reposición",
   * "Vaquillona / Reposición"), '' for no change. Text on purpose: the backend resolves it
   * against the catalog and reports what it cannot resolve on its own.
   */
  cs_nueva: string;
  /**
   * Cells the screen filled with what the system already knows of the animal. Shown as such and
   * sent blank: the paper did not say them, so there is nothing to control. The sex is always
   * the system's; a category the scan left blank is filled, and editing it makes it the operator's.
   */
  systemFilled?: { sexo?: boolean; categoria?: boolean };
  observations: string;
}

export interface Cact01Page {
  key: string;
  fileName: string;
  previewUrl: string | null;
  hojaNumero: number | null;
  hojaTotal: number | null;
  metadata: Cact01Metadata;
  rows: Cact01Row[];
}

export type Cact01Error = Lser01Error;
export type Cact01HeaderError = Lser01HeaderError;
export type Cact01RowError = Lser01RowError;

/** 422 body returned by POST /work-templates/cact-01/process. */
export type Cact01ValidationErrors = Lser01ValidationErrors;

/** Advisory findings: shown next to what they refer to, never blocking the save. */
export interface Cact01Warning {
  code: string;
  message: string;
}

export interface Cact01DestinationResult {
  batch_id: number;
  batch_name: string;
  created: boolean;
  count: number;
  weighed_count: number | null;
  total_weight: number | null;
  average_weight: number | null;
}

export interface Cact01SuccessResult {
  source: {
    before: { batch_id: number; batch_name: string; count: number | null; average_weight: number | null; total_weight: number | null };
    after: { batch_id: number; batch_name: string | null; count: number | null; average_weight: number | null; total_weight: number | null };
    weighed_in_sheet: number;
  };
  destinations: Cact01DestinationResult[];
  warnings: Cact01Warning[];
  /** The order the movement fulfilled, when the sheet or the screen named one. */
  transfer_order?: TransferOrderExecutionSummary | null;
}
