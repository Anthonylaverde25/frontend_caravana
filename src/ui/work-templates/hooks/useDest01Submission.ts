import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/utils/axios';
import type { WeaningResult } from '@/features/weaning-orders/types';
import type {
  Dest01BatchTarget,
  Dest01DestinationMode,
  Dest01Error,
  Dest01HeaderError,
  Dest01Metadata,
  Dest01Row,
  Dest01ValidationErrors,
} from '../components/scan/types';
import { normalizeDestinationKey } from './useCact01Pages';

/** The DEST-01 result: the same one executing a weaning order from the screen answers with. */
export type Dest01SuccessResult = WeaningResult;

/** Where the calves of the sheet go, as the operator resolved it, and the order the paper fulfils. */
export interface Dest01Destinations {
  mode: Dest01DestinationMode;
  /** Single mode: the one weaning batch. */
  target: Dest01BatchTarget;
  /** Per animal: each batch name written on the rows, by its normalised key. */
  perAnimalKeys: string[];
  perAnimalTargets: Record<string, Dest01BatchTarget>;
  weaningOrderId: number | null;
}

const destinationOf = (key: string, target: Dest01BatchTarget) =>
  target.mode === 'existing'
    ? { key, target_batch_id: target.batchId, new_batch: null }
    : { key, target_batch_id: null, new_batch: { name: target.name.trim(), is_confined: target.isConfined } };

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
    field: field === 'target_batch_id' || field === 'new_batch_name' || field.startsWith('destinations') ? 'lote_destete' : field,
    code: 'INVALID_FIELD',
    message: messages[0] ?? 'Dato inválido.',
  }));

const nullIfBlank = (value: string): string | null => value.trim() || null;

export function useDest01Submission() {
  const queryClient = useQueryClient();
  const [repair, setRepair] = useState<Dest01RepairState | null>(null);

  const submit = useCallback(
    async (metadata: Dest01Metadata, where: Dest01Destinations, rows: Dest01Row[]): Promise<Dest01SuccessResult | null> => {
      const perAnimal = where.mode === 'per_animal';
      const singleKey = normalizeDestinationKey(where.target.name) || 'DESTETE';
      const payload = {
        weaning_order_id: where.weaningOrderId,
        // The code as read: a code that found no order is rejected, a blank one creates it.
        orden_destete: nullIfBlank(metadata.orden_destete),
        destination_mode: where.mode,
        destinations: perAnimal
          ? where.perAnimalKeys.filter((key) => where.perAnimalTargets[key]).map((key) => destinationOf(key, where.perAnimalTargets[key]))
          : [destinationOf(singleKey, where.target)],
        sistema_manejo: nullIfBlank(metadata.sistema_manejo),
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
          cs_nueva: nullIfBlank(r.cs_nueva),
          // A blank batch on a per-animal sheet is a calf without destination: never the header's.
          destination_key: perAnimal ? normalizeDestinationKey(r.lote_destino) : '',
          manejo: nullIfBlank(r.manejo),
        })),
      };

      try {
        const response = await axiosInstance.post('/work-templates/dest-01/process', payload);
        setRepair(null);
        ['births-history', 'caravans', 'batches', 'weaning-orders'].forEach((key) =>
          queryClient.invalidateQueries({ queryKey: [key] })
        );
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
