import type { DteHeaderError, DteRowError } from '@/features/entry-orders/types';
import type { CodedError, ScanIssue } from './types';

/** A row of the review as the guide names it: the id it is rendered with and its caravan. */
export interface IssueRowRef {
  id: string;
  tag: string;
}

const rowLabel = (index: number, tag: string): string => `Fila ${index + 1}${tag.trim() ? ` · ${tag.trim()}` : ''}`;

/**
 * The server's answer of PAR-01, CACT-01, DEST-01 and LSER-01: errors of the header and errors by
 * row id. Rows are given in the order they are shown, so each problem is named by its position.
 */
export function fromCodedErrors(headerErrors: CodedError[] | undefined, rowErrorsById: Record<string, CodedError[]> | undefined, rows: IssueRowRef[]): ScanIssue[] {
  const issues: ScanIssue[] = (headerErrors ?? []).map((error) => ({
    severity: 'error',
    scope: 'header',
    code: error.code,
    message: error.message,
    field: error.field
  }));

  rows.forEach((row, index) => {
    (rowErrorsById?.[row.id] ?? []).forEach((error) => {
      issues.push({
        severity: 'error',
        scope: 'row',
        code: error.code,
        message: error.message,
        field: error.field,
        rowId: row.id,
        rowLabel: rowLabel(index, row.tag)
      });
    });
  });

  return issues;
}

/** The review's own checks: plain sentences, already worded as what to do. */
export function fromLocalChecks(errors: string[], warnings: string[]): ScanIssue[] {
  return [
    ...errors.map((message): ScanIssue => ({ severity: 'error', scope: 'sheet', code: null, message })),
    ...warnings.map((message): ScanIssue => ({ severity: 'warning', scope: 'sheet', code: null, message }))
  ];
}

/** Notes of a field-level review (ING-02): the cell they point at, no row. */
export function fromFieldNotes(notes: { field: string; severity: 'error' | 'warning'; message: string }[]): ScanIssue[] {
  return notes.map((note) => ({ severity: note.severity, scope: 'header', code: null, message: note.message, field: note.field }));
}

/** Notes of a row-level review (ING-03): one per row, by the id the row is rendered with. */
export function fromRowNotes(
  rows: IssueRowRef[],
  noteOf: (id: string) => { severity: 'error' | 'warning' | 'info'; message: string } | null
): ScanIssue[] {
  return rows.flatMap((row, index): ScanIssue[] => {
    const note = noteOf(row.id);

    if (!note || note.severity === 'info') return [];

    return [{ severity: note.severity, scope: 'row', code: null, message: note.message, rowId: row.id, rowLabel: rowLabel(index, row.tag) }];
  });
}

/** A 422 of the entry order API: its rows are counted in the payload sent, not in the review. */
export function fromEntryOrderErrors(headerErrors: DteHeaderError[] | undefined, rowErrors: DteRowError[] | undefined): ScanIssue[] {
  return [
    ...(headerErrors ?? []).map((error): ScanIssue => ({ severity: 'error', scope: 'header', code: error.code, message: error.message, field: error.field })),
    ...(rowErrors ?? []).map(
      (error): ScanIssue => ({ severity: 'error', scope: 'row', code: error.code, message: error.message, field: error.field, rowLabel: `Renglón ${error.row + 1}` })
    )
  ];
}
