import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/utils/axios';
import type {
  Cact01Destination,
  Cact01Error,
  Cact01HeaderError,
  Cact01Metadata,
  Cact01Row,
  Cact01SuccessResult,
  Cact01ValidationErrors,
} from '../components/scan/types';

/**
 * Errors keyed by row id instead of by position, so deleting or editing a row in the
 * repair screen does not shift the remaining messages onto the wrong animals.
 */
export interface Cact01RepairState {
  message: string;
  headerErrors: Cact01HeaderError[];
  rowErrorsById: Record<string, Cact01Error[]>;
  editedRowIds: Set<string>;
}

/** Laravel FormRequest 422 (`errors: {field: [msg]}`) as header errors of the repair screen. */
const fromFormRequestErrors = (errors: Record<string, string[]>): Cact01HeaderError[] =>
  Object.entries(errors).map(([field, messages]) => ({
    field: field.startsWith('destinations') ? 'destinations' : field,
    code: 'INVALID_FIELD',
    message: messages[0] ?? 'Dato inválido.',
  }));

const nullIfBlank = (value: string): string | null => value.trim() || null;

const numberOrNull = (value: string): number | null => {
  const clean = value.trim().replace(',', '.');

  return clean === '' || !Number.isFinite(Number(clean)) ? null : Number(clean);
};

export function useCact01Submission() {
  const queryClient = useQueryClient();
  const [repair, setRepair] = useState<Cact01RepairState | null>(null);

  const submit = useCallback(
    async (
      metadata: Cact01Metadata,
      sourceBatchId: number | null,
      destinations: Cact01Destination[],
      rows: Cact01Row[]
    ): Promise<Cact01SuccessResult | null> => {
      const payload = {
        source_batch_id: sourceBatchId,
        fecha_movimiento: metadata.fecha_movimiento,
        actividad_origen: nullIfBlank(metadata.actividad_origen),
        actividad_destino: nullIfBlank(metadata.actividad_destino),
        sistema_manejo: nullIfBlank(metadata.sistema_manejo),
        total_cabezas: numberOrNull(metadata.total_cabezas),
        peso_total: numberOrNull(metadata.peso_total),
        responsable: nullIfBlank(metadata.responsable),
        observaciones: nullIfBlank(metadata.observaciones),
        // Destinations travel RESOLVED: the backend never looks a batch up by the name
        // read off paper.
        destinations: destinations.map((destination) => ({
          key: destination.key,
          target_batch_id: destination.mode === 'existing' ? destination.batchId : null,
          new_batch:
            destination.mode === 'new'
              ? {
                  name: destination.name.trim(),
                  activity_id: destination.activityId,
                  batch_type_id: destination.batchTypeId,
                  is_confined: destination.isConfined,
                }
              : null,
        })),
        // Every row is sent, blanks included: the backend reports errors by position in
        // this array.
        rows: rows.map((r) => ({
          caravana: r.caravana.trim(),
          peso_actual: numberOrNull(r.peso_actual),
          sexo: nullIfBlank(r.sexo),
          categoria: nullIfBlank(r.categoria),
          dientes: nullIfBlank(r.dientes),
          destination_key: r.destination_key,
          observations: nullIfBlank(r.observations),
        })),
      };

      try {
        const response = await axiosInstance.post('/work-templates/cact-01/process', payload);
        setRepair(null);
        queryClient.invalidateQueries({ queryKey: ['caravans'] });
        queryClient.invalidateQueries({ queryKey: ['batches'] });
        queryClient.invalidateQueries({ queryKey: ['activities'] });
        queryClient.invalidateQueries({ queryKey: ['batch-weight-history'] });

        return response.data.data as Cact01SuccessResult;
      } catch (err) {
        const error = err as { response?: { status?: number; data?: { message?: string } } };
        const status = error.response?.status;
        const body = error.response?.data ?? {};

        if (status !== 422) {
          throw err;
        }

        const validation = body as Partial<Cact01ValidationErrors> & { errors?: Record<string, string[]> };
        const rowErrorsById: Record<string, Cact01Error[]> = {};

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
          headerErrors.push({
            field: 'general',
            code: 'DOMAIN_ERROR',
            message: body.message ?? 'La planilla fue rechazada.',
          });
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
