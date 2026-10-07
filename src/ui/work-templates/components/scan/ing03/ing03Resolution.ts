import type { DteRowError, EntryOrder, EntryOrderDte, EntryOrderReceiptSheet, ReceivePayload } from '@/features/entry-orders/types';
import { inheritedSexOf } from '@/features/entry-orders/categoryLines';
import type { Ing03Metadata, Ing03Page, Ing03Row } from '../../../hooks/useIng03Pages';
import { ing03LayoutOf } from '../../../templates/ing03/ing03Columns';
import { findingsOf, lineReferencesOf, parseBodyCondition, parseWeight } from './ing03LineChecks';

/** What a line of the sheet does once confirmed. */
export type Ing03Outcome = 'received' | 'ignored' | 'error';

export interface Ing03RowResolution {
  outcome: Ing03Outcome;
  /** Why, when it is not the plain case: an error blocks, a warning is to check, an info explains. */
  note: { severity: 'error' | 'warning' | 'info'; message: string } | null;
  /** What a written breed, coat or category could say instead, as the server answered: a click away. */
  fix?: { field: 'raza' | 'pelaje' | 'cat'; candidates: string[] };
}

/** What the reviewer declares about the head of the DTE that no line names. */
export interface Ing03Missing {
  /** Head declared as never arriving; the rest arrive later. */
  count: number;
  reason: string;
}

export interface Ing03Resolution {
  rows: Map<string, Ing03RowResolution>;
  /** Problems of the sheet as a whole: they block confirming. */
  headerErrors: string[];
  /** Things to check that do not block. */
  headerWarnings: string[];
  counts: Record<Ing03Outcome, number>;
  sheet: EntryOrderReceiptSheet | null;
  dte: EntryOrderDte | null;
  /** Head of the DTE left in transit after this reception, before declaring any missing. */
  left: number;
  /** The reception, ready to send when there are no errors. */
  payload: ReceivePayload | null;
  /** The lines the payload sends, in its order: the server reports row errors by this index. */
  sentRowIds: string[];
}

const OUTCOMES: Ing03Outcome[] = ['received', 'ignored', 'error'];

const kg = (value: number) => `${value.toLocaleString('es-AR')} kg`;

const numberOrNull = (value: number | null | 'invalid'): number | null => (typeof value === 'number' ? value : null);

/**
 * The pages the reception covers. A page whose number was not read counts by load order only when
 * the sheet has as many pages as were scanned; otherwise it is said, and not counted.
 */
const pagesOf = (pages: Ing03Page[], sheet: EntryOrderReceiptSheet, warnings: string[]): number[] => {
  const read = pages.map((p) => p.hojaNumero).filter((n): n is number => n !== null);

  if (read.length === pages.length) return [...new Set(read)];

  if (pages.length === sheet.page_count) return Array.from({ length: sheet.page_count }, (_, i) => i + 1);

  warnings.push('No se leyó el número de alguna hoja ("Hoja N de M"): esa hoja no queda registrada como escaneada en la orden.');

  return [...new Set(read)];
};

/**
 * A scanned ING-03 against the order it names. Every line written is an animal that arrived on the
 * sheet's DTE: its caravan is created when the reception is registered. Sex is checked only on a
 * troop of both sexes, the category only when the animal's sex admits several of the order's
 * categories (otherwise it is the only one its sex admits) and the breed only on one of several;
 * the rest is inherited. On a sheet by code the number and letter are checked here; on a sheet in
 * words, what is written goes to the server, which resolves it against the order and answers line
 * by line. The boxes of an injured eye, ear or limb travel with the line; marked on a line without
 * caravan, they belong to no animal. More
 * lines than head in transit are received anyway and raise an incident; fewer leave head in
 * transit, unless the reviewer declares them as never arriving. Everything the paper says that
 * cannot be true is an error on its line; what is odd but possible is a warning. A person
 * supervises it all before confirming.
 *
 * A sheet weighed with one average has no weight per line: the PESO PROMEDIO of its header is the
 * weight of every animal that arrived. The body condition (EC) of a line is optional; written, it
 * must be on the official scale.
 */
export const resolveIng03 = (
  order: EntryOrder | null,
  pages: Ing03Page[],
  rows: Ing03Row[],
  metadata: Ing03Metadata,
  missing: Ing03Missing,
  today: string
): Ing03Resolution => {
  const resolutions = new Map<string, Ing03RowResolution>();
  const headerErrors: string[] = [];
  const headerWarnings: string[] = [];
  const counts = Object.fromEntries(OUTCOMES.map((o) => [o, 0])) as Record<Ing03Outcome, number>;
  const set = (row: Ing03Row, resolution: Ing03RowResolution) => {
    resolutions.set(row.id, resolution);
    counts[resolution.outcome] += 1;
  };
  const empty = (): Ing03Resolution => ({ rows: resolutions, headerErrors, headerWarnings, counts, sheet: null, dte: null, left: 0, payload: null, sentRowIds: [] });

  if (!metadata.orden_ingreso) headerErrors.push('La hoja no trae el código de la orden de ingreso: escribilo en el encabezado.');
  if (!order) {
    if (metadata.orden_ingreso) headerErrors.push(`No existe la orden de ingreso ${metadata.orden_ingreso}: corregí el código leído.`);

    return empty();
  }

  const sheet = order.receipt_sheets.find((s) => s.label === metadata.hoja_recepcion) ?? null;
  const dte = sheet ? (order.dtes.find((d) => d.id === sheet.dte_id) ?? null) : null;

  if (!sheet || !dte) {
    headerErrors.push(
      metadata.hoja_recepcion
        ? `La orden ${order.code} no tiene la hoja de recepción ${metadata.hoja_recepcion}: corregí el número leído.`
        : 'La hoja no trae su número de hoja de recepción (R1, R2…): escribilo en el encabezado.'
    );

    return empty();
  }

  if (sheet.status === 'REPLACED') {
    headerWarnings.push(`La hoja ${sheet.label} había sido reemplazada por una más nueva. Se puede cargar igual: lo que dice el papel pasó.`);
  }
  if (metadata.dte && metadata.dte.toUpperCase() !== sheet.dte_number.toUpperCase()) {
    headerWarnings.push(`La hoja dice DTE ${metadata.dte} y la ${sheet.label} es del DTE ${sheet.dte_number}: vale el de la orden.`);
  }
  // Head to write: in transit, or received by count without caravan (also on a closed order).
  const toIdentify = order.accepts_reception ? dte.to_identify_count : dte.uncaravaned_count;
  if (toIdentify === 0) {
    headerErrors.push(`El DTE ${dte.dte_number} de la orden ${order.code} no tiene cabezas en tránsito ni sin caravana por recibir.`);
  }

  if (!metadata.fecha_recepcion) headerErrors.push('Falta la fecha de recepción.');
  else if (metadata.fecha_recepcion > today) headerErrors.push('La fecha de recepción no puede ser futura.');
  else if (metadata.fecha_recepcion < dte.dte_date) headerErrors.push('La hacienda no pudo llegar antes de que se emitiera su DTE.');

  const averaged = sheet.weighing_mode === 'AVERAGE';
  const average = averaged ? parseWeight(metadata.peso_promedio) : null;

  if (average === 'invalid') {
    headerErrors.push(`El peso promedio "${metadata.peso_promedio}" no es un número mayor que cero.`);
  } else if (average !== null && ((order.min_weight != null && average < order.min_weight) || (order.max_weight != null && average > order.max_weight))) {
    headerWarnings.push(
      `El peso promedio de ${kg(average)} está fuera del rango declarado en la compra (${order.min_weight ?? '—'} a ${order.max_weight ?? '—'} kg). Revisá la lectura.`
    );
  }

  const layout = ing03LayoutOf(order, sheet);
  const inheritedSex = inheritedSexOf(order.sex_composition);
  const animals = new Map<string, NonNullable<ReceivePayload['animals']>[number]>();
  const received = new Map(order.dtes.flatMap((d) => (d.animals ?? []).map((a) => [a.identification.toUpperCase(), a] as const)));
  const seen = new Set<string>();

  rows.forEach((row) => {
    const tag = row.caravana.trim().toUpperCase();
    // A sheet weighed with one average has no weight column: whatever the line says does not count.
    const weight = averaged ? null : parseWeight(row.peso);
    const bodyCondition = parseBodyCondition(row.ec);
    const error = (message: string) => set(row, { outcome: 'error', note: { severity: 'error', message } });

    if (tag === '' && findingsOf(row).length > 0) {
      return error('Renglón con una lesión marcada y sin caravana: escribí la caravana del animal o desmarcá la casilla.');
    }
    if (tag === '') {
      set(row, { outcome: 'ignored', note: { severity: 'warning', message: 'Renglón sin caravana: no se carga. Escribila o borrá el renglón.' } });
      return;
    }
    if (seen.has(tag)) return error(`La caravana ${tag} está dos veces en la hoja.`);
    seen.add(tag);

    const already = received.get(tag);
    if (already) return error(`La caravana ${tag} ya se recibió el ${already.received_at} en esta orden: no se carga de nuevo.`);
    const references = lineReferencesOf(order, layout, row, inheritedSex);
    if (references.error) return error(references.error);
    if (weight === 'invalid') return error(`El peso "${row.peso}" no es un número mayor que cero.`);
    if (bodyCondition === 'invalid') return error(`El EC "${row.ec}" no está en la escala oficial: de 1 a 5, de 0,5 en 0,5 (1 · 1,5 · 2 … 5).`);

    animals.set(row.id, {
      caravana: tag,
      ...references.animal,
      weight: averaged ? numberOrNull(average) : numberOrNull(weight),
      body_condition: numberOrNull(bodyCondition),
      arrival_findings: findingsOf(row)
    });
    set(row, { outcome: 'received', note: references.warning ? { severity: 'warning', message: references.warning } : null });
  });

  const excess = counts.received - toIdentify;
  // Lines that identify head already received do not leave anything in transit.
  const left = Math.max(0, dte.pending_count - Math.max(0, counts.received - dte.uncaravaned_count));

  if (excess > 0 && !order.accepts_reception) {
    headerErrors.push(
      `La orden ${order.code} está cerrada: la hoja sólo puede identificar las ${dte.uncaravaned_count} cabezas recibidas sin caravana y trae ${counts.received}.`
    );
  } else if (excess > 0) {
    headerWarnings.push(
      `El DTE ${dte.dte_number} tiene ${toIdentify} ${toIdentify === 1 ? 'cabeza' : 'cabezas'} por recibir y la hoja trae ${counts.received}: ${excess} de más se reciben igual y queda una novedad para el proveedor.`
    );
  }
  if (counts.received === 0 && missing.count === 0) headerErrors.push('La hoja no trae ninguna caravana escrita.');
  if (missing.count > left) headerErrors.push(`Quedan ${left} cabezas en tránsito: no pueden faltar ${missing.count}.`);
  if (missing.count > 0 && missing.reason.trim().length < 3) headerErrors.push('Indicá por qué no van a llegar las cabezas que faltan.');
  if (averaged && average === null && counts.received > 0) {
    headerWarnings.push('La hoja es de peso promedio y no se escribió el peso: las caravanas se reciben sin peso. Escribilo arriba si se pesaron.');
  }

  const blocked = headerErrors.length > 0 || counts.error > 0;
  const sentRowIds = [...animals.keys()];

  return {
    rows: resolutions,
    headerErrors,
    headerWarnings,
    counts,
    sheet,
    dte,
    left,
    payload: blocked
      ? null
      : {
          method: 'SHEET',
          received_at: metadata.fecha_recepcion,
          dte_id: dte.id,
          receipt_sheet_id: sheet.id,
          pages: pagesOf(pages, sheet, headerWarnings),
          animals: [...animals.values()],
          missing_head_count: missing.count,
          reason: missing.count > 0 ? missing.reason.trim() : null
        },
    sentRowIds
  };
};

/** The cell of the review a server field points to. */
const FIX_FIELD: Record<string, 'raza' | 'pelaje' | 'cat'> = { breed_text: 'raza', color_text: 'pelaje', category_text: 'cat' };

/**
 * The review with what the server said about each line of the last attempt: a written breed or
 * category it could not resolve marks its line, with the candidates to pick from.
 */
export const withServerRowErrors = (resolution: Ing03Resolution, rowErrors: DteRowError[] | undefined): Ing03Resolution => {
  if (!rowErrors?.length) return resolution;

  const rows = new Map(resolution.rows);
  const counts = { ...resolution.counts };

  rowErrors.forEach((rowError) => {
    const id = resolution.sentRowIds[rowError.row];
    const current = id ? rows.get(id) : undefined;

    if (!id || !current) return;

    if (current.outcome !== 'error') {
      counts[current.outcome] -= 1;
      counts.error += 1;
    }

    const field = FIX_FIELD[rowError.field];
    rows.set(id, {
      outcome: 'error',
      note: { severity: 'error', message: rowError.message },
      ...(field && rowError.candidates?.length ? { fix: { field, candidates: rowError.candidates } } : {})
    });
  });

  return { ...resolution, rows, counts };
};
