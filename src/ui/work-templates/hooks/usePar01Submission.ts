import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/utils/axios';
import type { BirthOrder, BirthResult } from '@/features/birth-orders/types';
import type { Par01Metadata, Par01Row } from './usePar01Pages';

/** What the server objected to, by row id and by header field: marked on the review, never a separate step. */
export interface Par01Problems {
  header: { field: string; code: string; message: string }[];
  byRowId: Record<string, { code: string; message: string; field?: string }[]>;
}

const EMPTY: Par01Problems = { header: [], byRowId: {} };

/** A row that says nothing — no mother, no outcome, no calf — is a blank line of the paper. */
const isBlank = (row: Par01Row) =>
  !row.caravana_madre.trim() && !row.resultado.trim() && !row.caravana_cria.trim() && !row.sexo.trim() && !row.peso.trim() && !row.fecha_nacimiento;

/** The sheet as the server reads it, for confirming it and for obtaining its order alike. */
const payloadOf = (metadata: Par01Metadata, sent: Par01Row[], birthOrderId: number | null) => ({
  birth_order_id: birthOrderId,
  orden_paricion: metadata.orden_paricion || null,
  fecha_recorrida: metadata.fecha_recorrida || null,
  lote: metadata.lote || null,
  responsable: metadata.responsable || null,
  observaciones: metadata.observaciones || null,
  rows: sent.map((row) => ({
    caravana_madre: row.caravana_madre,
    resultado: row.resultado || null,
    caravana_cria: row.caravana_cria || null,
    sexo: row.sexo || null,
    peso: row.peso === '' ? null : row.peso,
    raza: row.raza || null,
    pelaje: row.pelaje || null,
    dientes: row.dientes === '' ? 0 : Number(row.dientes),
    father_id: row.father_id === '' ? null : Number(row.father_id),
    fecha_nacimiento: row.fecha_nacimiento || null,
    observations: row.observations || null,
    fuera_de_orden: row.fuera_de_orden !== ''
  }))
});

/** A 422 turned into the problems the review marks, by row id and by header field. Anything else is rethrown. */
const problemsOf = (err: unknown, sent: Par01Row[]): Par01Problems => {
  const body = (err as { response?: { status?: number; data?: Record<string, unknown> } }).response;

  if (body?.status !== 422) throw err;

  const data = body.data as {
    message?: string;
    header_errors?: Par01Problems['header'];
    row_errors?: { row_index: number; errors: { code: string; message: string; field?: string }[] }[];
    errors?: Record<string, string[]>;
  };
  const byRowId: Par01Problems['byRowId'] = {};

  (data.row_errors ?? []).forEach((row) => {
    const target = sent[row.row_index];

    if (target) byRowId[target.id] = row.errors;
  });

  const header = [...(data.header_errors ?? [])];

  if (data.errors) {
    Object.values(data.errors).forEach((messages) => header.push({ field: 'rows', code: 'SHAPE', message: messages[0] }));
  }

  if (header.length === 0 && Object.keys(byRowId).length === 0) {
    header.push({ field: 'rows', code: 'INVALID', message: data.message ?? 'La planilla tiene errores.' });
  }

  return { header, byRowId };
};

/**
 * Sends a supervised PAR-01 load to the one path that registers calvings, all or nothing. On a 422
 * the problems come back row by row and are kept for the review to mark the cells.
 */
export function usePar01Submission() {
  const queryClient = useQueryClient();
  const [problems, setProblems] = useState<Par01Problems>(EMPTY);

  const clear = useCallback(() => setProblems(EMPTY), []);

  const submit = useCallback(
    async (metadata: Par01Metadata, rows: Par01Row[], birthOrderId: number | null): Promise<BirthResult | null> => {
      const sent = rows.filter((row) => !isBlank(row));

      try {
        const response = await axiosInstance.post<{ data: BirthResult }>('/work-templates/par-01/process', payloadOf(metadata, sent, birthOrderId));

        setProblems(EMPTY);
        ['birth-orders', 'caravans', 'batches', 'births-history', 'pending-sires'].forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));

        return response.data.data;
      } catch (err) {
        setProblems(problemsOf(err, sent));

        return null;
      }
    },
    [queryClient]
  );

  /**
   * "Obtener orden de parición": the sheet carries no order, and one is generated from it — checked
   * exactly as confirming it would be — with every female on the paper, without registering
   * anything. Null when the sheet has problems, which are marked on the review.
   */
  const obtainOrder = useCallback(
    async (metadata: Par01Metadata, rows: Par01Row[]): Promise<BirthOrder | null> => {
      const sent = rows.filter((row) => !isBlank(row));

      try {
        const response = await axiosInstance.post<{ data: BirthOrder }>('/work-templates/par-01/order', payloadOf(metadata, sent, null));

        setProblems(EMPTY);
        queryClient.invalidateQueries({ queryKey: ['birth-orders'] });

        return response.data.data;
      } catch (err) {
        setProblems(problemsOf(err, sent));

        return null;
      }
    },
    [queryClient]
  );

  return { problems, submit, obtainOrder, clear };
}
