import { useCallback, useState } from 'react';
import axiosInstance from '@/utils/axios';
import type {
  Lser01Error,
  Lser01HeaderError,
  Lser01Metadata,
  Lser01ValidationErrors,
  WorkTemplateScanRow,
} from '../components/scan/types';

export interface Lser01SuccessResult {
  batch_id: number;
  batch_name: string;
  service_order_id: number | null;
  service_order_code: string | null;
  females_count: number;
}

/**
 * Errors keyed by row id instead of by position, so deleting or editing a row in the repair
 * screen does not shift the remaining messages onto the wrong animals.
 */
export interface Lser01RepairState {
  message: string;
  headerErrors: Lser01HeaderError[];
  rowErrorsById: Record<string, Lser01Error[]>;
  editedRowIds: Set<string>;
}

export const emptyLser01Metadata = (): Lser01Metadata => ({
  lote: '',
  toro_caravana: '',
  planned_start_date: new Date().toISOString().slice(0, 10),
  planned_end_date: '',
  responsable: '',
  observaciones: '',
});

const rowKey = (row: WorkTemplateScanRow, index: number): string => String(row.id ?? `idx-${index}`);

/** Laravel FormRequest 422 (`errors: {field: [msg]}`) as header errors of the repair screen. */
const fromFormRequestErrors = (errors: Record<string, string[]>): Lser01HeaderError[] =>
  Object.entries(errors).map(([field, messages]) => ({
    field,
    code: 'INVALID_FIELD',
    message: messages[0] ?? 'Dato inválido.',
  }));

export function useLser01Submission() {
  const [repair, setRepair] = useState<Lser01RepairState | null>(null);

  const submit = useCallback(
    async (metadata: Lser01Metadata, rows: WorkTemplateScanRow[]): Promise<Lser01SuccessResult | null> => {
      const payload = {
        lote: metadata.lote.trim(),
        toro_caravana: metadata.toro_caravana.trim(),
        planned_start_date: metadata.planned_start_date,
        planned_end_date: metadata.planned_end_date || null,
        responsable: metadata.responsable.trim() || null,
        observaciones: metadata.observaciones.trim() || null,
        // Every row is sent, blanks included: the backend reports errors by position in this array.
        rows: rows.map((r) => ({
          caravana: r.caravana.trim(),
          observations: r.observations?.trim() || null,
        })),
      };

      try {
        const response = await axiosInstance.post('/work-templates/lser-01/process', payload);
        setRepair(null);
        return response.data.data as Lser01SuccessResult;
      } catch (err: any) {
        const status = err.response?.status;
        const body = err.response?.data ?? {};

        if (status !== 422) {
          throw err;
        }

        const validation = body as Partial<Lser01ValidationErrors> & { errors?: Record<string, string[]> };
        const rowErrorsById: Record<string, Lser01Error[]> = {};

        (validation.row_errors ?? []).forEach((rowError) => {
          const row = rows[rowError.row_index];
          if (row) {
            rowErrorsById[rowKey(row, rowError.row_index)] = rowError.errors;
          }
        });

        const headerErrors = validation.errors
          ? fromFormRequestErrors(validation.errors)
          : (validation.header_errors ?? []);

        // A domain rejection without per-row detail still has to be shown on the repair screen.
        if (headerErrors.length === 0 && Object.keys(rowErrorsById).length === 0) {
          headerErrors.push({ field: 'general', code: 'DOMAIN_ERROR', message: body.message ?? 'La planilla fue rechazada.' });
        }

        setRepair({
          message: body.message ?? 'La planilla tiene errores. Corríjalos antes de confirmar.',
          headerErrors,
          rowErrorsById,
          editedRowIds: new Set(),
        });

        return null;
      }
    },
    []
  );

  const markRowEdited = useCallback((row: WorkTemplateScanRow, index: number) => {
    setRepair((prev) => {
      if (!prev) return prev;
      const editedRowIds = new Set(prev.editedRowIds);
      editedRowIds.add(rowKey(row, index));
      return { ...prev, editedRowIds };
    });
  }, []);

  const clearRepair = useCallback(() => setRepair(null), []);

  return { repair, submit, markRowEdited, clearRepair, rowKey };
}
