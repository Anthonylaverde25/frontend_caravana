import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/utils/axios';
import type {
  Dest01BatchTarget,
  Dest01Error,
  Dest01HeaderError,
  Dest01Metadata,
  Dest01Row,
  Dest01ValidationErrors,
} from '../components/scan/types';

export interface Dest01SuccessResult {
  batch_id: number;
  batch_name: string;
  batch_created: boolean;
  calves_count: number;
  males_count: number;
  females_count: number;
  weighed_count: number;
  average_weight: number | null;
}

/**
 * Errors keyed by row id instead of by position, so deleting or editing a row in the repair
 * screen does not shift the remaining messages onto the wrong calves.
 */
export interface Dest01RepairState {
  message: string;
  headerErrors: Dest01HeaderError[];
  rowErrorsById: Record<string, Dest01Error[]>;
  editedRowIds: Set<string>;
}

/** Laravel FormRequest 422 (`errors: {field: [msg]}`) as header errors of the repair screen. */
const fromFormRequestErrors = (errors: Record<string, string[]>): Dest01HeaderError[] =>
  Object.entries(errors).map(([field, messages]) => ({
    field: field === 'target_batch_id' || field === 'new_batch_name' ? 'lote_destete' : field,
    code: 'INVALID_FIELD',
    message: messages[0] ?? 'Dato inválido.',
  }));

const nullIfBlank = (value: string): string | null => value.trim() || null;

export function useDest01Submission() {
  const queryClient = useQueryClient();
  const [repair, setRepair] = useState<Dest01RepairState | null>(null);

  const submit = useCallback(
    async (metadata: Dest01Metadata, target: Dest01BatchTarget, rows: Dest01Row[]): Promise<Dest01SuccessResult | null> => {
      const payload = {
        target_batch_id: target.mode === 'existing' ? target.batchId : null,
        new_batch_name: target.mode === 'new' ? nullIfBlank(target.name) : null,
        fecha_destete: metadata.fecha_destete,
        tipo_destete: nullIfBlank(metadata.tipo_destete),
        lote_origen: nullIfBlank(metadata.lote_origen),
        responsable: nullIfBlank(metadata.responsable),
        observaciones: nullIfBlank(metadata.observaciones),
        // Every row is sent, blanks included: the backend reports errors by position in this array.
        rows: rows.map((r) => ({
          caravana: r.caravana.trim(),
          caravana_madre: nullIfBlank(r.caravana_madre),
          peso: r.peso.trim() === '' ? null : r.peso.trim().replace(',', '.'),
          observations: nullIfBlank(r.observations),
        })),
      };

      try {
        const response = await axiosInstance.post('/work-templates/dest-01/process', payload);
        setRepair(null);
        queryClient.invalidateQueries({ queryKey: ['births-history'] });
        queryClient.invalidateQueries({ queryKey: ['caravans'] });
        queryClient.invalidateQueries({ queryKey: ['batches'] });
        return response.data.data as Dest01SuccessResult;
      } catch (err) {
        const error = err as { response?: { status?: number; data?: { message?: string } } };
        const status = error.response?.status;
        const body = error.response?.data ?? {};

        if (status !== 422) {
          throw err;
        }

        const validation = body as Partial<Dest01ValidationErrors> & { errors?: Record<string, string[]> };
        const rowErrorsById: Record<string, Dest01Error[]> = {};

        (validation.row_errors ?? []).forEach((rowError) => {
          const row = rows[rowError.row_index];
          if (row) {
            rowErrorsById[row.id] = rowError.errors;
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
    [queryClient]
  );

  const markRowEdited = useCallback((rowId: string) => {
    setRepair((prev) => {
      if (!prev || prev.editedRowIds.has(rowId)) return prev;
      const editedRowIds = new Set(prev.editedRowIds);
      editedRowIds.add(rowId);
      return { ...prev, editedRowIds };
    });
  }, []);

  const clearRepair = useCallback(() => setRepair(null), []);

  return { repair, submit, markRowEdited, clearRepair };
}
