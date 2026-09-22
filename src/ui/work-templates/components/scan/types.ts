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
  lote_destete: string;
  fecha_destete: string;
  tipo_destete: string;
  lote_origen: string;
  responsable: string;
  observaciones: string;
}

/**
 * Destination of the weaned calves, declared by the operator. The first proposal comes from the
 * batch name read on the sheet; `touched` stops re-proposing once the operator has chosen.
 */
export interface Dest01BatchTarget {
  mode: 'existing' | 'new';
  batchId: number | null;
  name: string;
  touched: boolean;
}

export interface Dest01Row {
  id: string;
  /** Key of the scanned page the row comes from; `manual` for rows added on screen. */
  pageKey: string;
  caravana: string;
  caravana_madre: string;
  peso: string;
  observations: string;
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
  actividad_destino: string;
  lote_origen: string;
  lote_destino: string;
  fecha_movimiento: string;
  /** 'CORRAL' | 'PASTURA' | '' */
  sistema_manejo: string;
  total_cabezas: string;
  peso_total: string;
  responsable: string;
  observaciones: string;
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
  sexo: string;
  categoria: string;
  dientes: string;
  /** Normalised destination key: the row cell when written, the header otherwise. */
  destination_key: string;
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
}
