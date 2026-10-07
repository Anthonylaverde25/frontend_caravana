/** The kinds every template's problems are grouped by, so the guide reads the same everywhere. */
export type IssueCategory = 'animal' | 'order' | 'outcome' | 'calf' | 'dates' | 'destination' | 'measures' | 'sheet' | 'other';

export const ISSUE_CATEGORY_LABEL: Record<IssueCategory, string> = {
  animal: 'Caravana / animal',
  order: 'Orden',
  outcome: 'Resultado / evento',
  calf: 'Cría',
  dates: 'Fechas',
  destination: 'Lote / destino',
  measures: 'Medidas',
  sheet: 'Encabezado / hoja',
  other: 'Otros'
};

/** Display order of the categories in the guide. */
export const ISSUE_CATEGORY_ORDER: IssueCategory[] = ['sheet', 'order', 'animal', 'outcome', 'calf', 'dates', 'destination', 'measures', 'other'];

/** What a problem means and what to do about it, by code. */
export interface IssueGuide {
  category: IssueCategory;
  title: string;
  solution: string;
}

/**
 * One problem of a scanned sheet, whatever template it came from: an answer of the server (with its
 * code) or a check of the review itself (without one).
 */
export interface ScanIssue {
  severity: 'error' | 'warning';
  scope: 'sheet' | 'header' | 'row';
  code: string | null;
  message: string;
  field?: string;
  /** The id the row is rendered with (`data-scan-row-id`), to go to it. */
  rowId?: string;
  /** How the row is named in the guide: "Fila 3 · PAR-V-35". */
  rowLabel?: string;
}

/** The server's error shape shared by PAR-01, CACT-01, DEST-01 and LSER-01. */
export interface CodedError {
  code: string;
  message: string;
  field?: string;
}
