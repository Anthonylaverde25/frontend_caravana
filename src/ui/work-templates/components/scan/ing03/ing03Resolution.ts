import type { EntryOrder, EntryOrderAnimal, EntryOrderReceiptSheet, ReceivePayload } from '@/features/entry-orders/types';
import type { Ing03Metadata, Ing03Page, Ing03Row } from '../../../hooks/useIng03Pages';

/** What a line of the sheet does once confirmed. */
export type Ing03Outcome = 'received' | 'missing' | 'later' | 'unlisted' | 'ignored' | 'error';

export interface Ing03RowResolution {
  outcome: Ing03Outcome;
  /** The caravan of the order the line names, if any. */
  animal: EntryOrderAnimal | null;
  /** Why, when it is not the plain case: an error blocks, a warning is to check, an info explains. */
  note: { severity: 'error' | 'warning' | 'info'; message: string } | null;
}

export interface Ing03Resolution {
  rows: Map<string, Ing03RowResolution>;
  /** Problems of the sheet as a whole: they block confirming. */
  headerErrors: string[];
  /** Things to check that do not block. */
  headerWarnings: string[];
  counts: Record<Ing03Outcome, number>;
  /** The reception, ready to send when there are no errors. */
  payload: ReceivePayload | null;
}

const OUTCOMES: Ing03Outcome[] = ['received', 'missing', 'later', 'unlisted', 'ignored', 'error'];

const parseWeight = (raw: string): number | null | 'invalid' => {
  if (raw.trim() === '') return null;

  const value = Number(raw.replace(',', '.'));

  return Number.isFinite(value) && value > 0 ? value : 'invalid';
};

/** The official body condition scale: 1 to 5, in steps of 0.5. */
const parseBodyCondition = (raw: string): number | null | 'invalid' => {
  if (raw.trim() === '') return null;

  const value = Number(raw.replace(',', '.'));

  return Number.isFinite(value) && value >= 1 && value <= 5 && Number.isInteger(value * 2) ? value : 'invalid';
};

const kg = (value: number) => `${value.toLocaleString('es-AR')} kg`;

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
 * Each line of a scanned ING-03 against the order it names. A caravan of the order still in
 * transit is received (Llegó), declared missing (No llega) or left in transit (unmarked: it arrives
 * later). A caravan no DTE of the order lists, written on a free line, arrived without document: it
 * is not received, it is reported as an incident. Everything the paper says that cannot be true is
 * an error on its line; what is odd but possible is a warning. A person supervises it all before
 * confirming.
 *
 * A sheet weighed with one average has no weight per line: the PESO PROMEDIO of its header is the
 * weight of every caravan that arrived. The body condition (EC) of a line is optional; written, it
 * must be on the official scale.
 */
export const resolveIng03 = (
  order: EntryOrder | null,
  pages: Ing03Page[],
  rows: Ing03Row[],
  metadata: Ing03Metadata,
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

  if (!metadata.orden_ingreso) headerErrors.push('La hoja no trae el código de la orden de ingreso: escribilo en el encabezado.');
  if (!order) {
    if (metadata.orden_ingreso) headerErrors.push(`No existe la orden de ingreso ${metadata.orden_ingreso}: corregí el código leído.`);

    return { rows: resolutions, headerErrors, headerWarnings, counts, payload: null };
  }

  const sheet = order.receipt_sheets.find((s) => s.label === metadata.hoja_recepcion) ?? null;

  if (!sheet) {
    headerErrors.push(
      metadata.hoja_recepcion
        ? `La orden ${order.code} no tiene la hoja de recepción ${metadata.hoja_recepcion}: corregí el número leído.`
        : 'La hoja no trae su número de hoja de recepción (R1, R2…): escribilo en el encabezado.'
    );
  } else {
    if (sheet.status === 'REPLACED') {
      headerWarnings.push(`La hoja ${sheet.label} había sido reemplazada por una más nueva. Se puede cargar igual: lo que dice el papel pasó.`);
    }
    if (sheet.status === 'PROCESSED') {
      headerWarnings.push(`La hoja ${sheet.label} ya se procesó: las caravanas ya recibidas se marcan abajo y no se cargan dos veces.`);
    }
    if (metadata.dte && metadata.dte.toUpperCase() !== sheet.dte_number.toUpperCase()) {
      headerWarnings.push(`La hoja dice DTE ${metadata.dte} y la ${sheet.label} es del DTE ${sheet.dte_number}: vale el de la orden.`);
    }
  }

  if (!order.accepts_reception) {
    headerErrors.push(`La orden ${order.code} está ${order.status_label.toLowerCase()} y no tiene hacienda en tránsito por recibir.`);
  }

  if (!metadata.fecha_recepcion) headerErrors.push('Falta la fecha de recepción.');
  else if (metadata.fecha_recepcion > today) headerErrors.push('La fecha de recepción no puede ser futura.');

  const averaged = sheet?.weighing_mode === 'AVERAGE';
  const average = averaged ? parseWeight(metadata.peso_promedio) : null;

  if (averaged) {
    if (average === 'invalid') {
      headerErrors.push(`El peso promedio "${metadata.peso_promedio}" no es un número mayor que cero.`);
    } else if (average !== null && ((order.min_weight != null && average < order.min_weight) || (order.max_weight != null && average > order.max_weight))) {
      headerWarnings.push(
        `El peso promedio de ${kg(average)} está fuera del rango declarado en la compra (${order.min_weight ?? '—'} a ${order.max_weight ?? '—'} kg). Revisá la lectura.`
      );
    }

    const written = [...new Set(pages.map((p) => parseWeight(p.metadata.peso_promedio)).filter((w): w is number => typeof w === 'number'))];

    if (written.length > 1) {
      headerWarnings.push(
        `Las hojas traen pesos promedio distintos (${written.map(kg).join(', ')}): se usa el de arriba para todas las caravanas que llegaron. Corregilo si no es el que vale.`
      );
    }
  }

  const byIdentification = new Map(
    order.dtes.flatMap((dte) => (dte.animals ?? []).map((animal) => [animal.identification.toUpperCase(), { animal, dte }] as const))
  );
  const seen = new Set<string>();

  rows.forEach((row) => {
    const tag = row.caravana.trim().toUpperCase();
    // A sheet weighed with one average has no weight column: whatever the line says does not count.
    const weight = averaged ? null : parseWeight(row.peso);
    const bodyCondition = parseBodyCondition(row.ec);

    if (tag === '') {
      set(row, { outcome: 'ignored', animal: null, note: { severity: 'warning', message: 'Renglón sin caravana: no se carga. Escribila o borrá el renglón.' } });
      return;
    }

    if (seen.has(tag)) {
      set(row, { outcome: 'error', animal: null, note: { severity: 'error', message: `La caravana ${tag} está dos veces en la hoja.` } });
      return;
    }
    seen.add(tag);

    if (row.llego && row.no_llega) {
      set(row, { outcome: 'error', animal: null, note: { severity: 'error', message: 'Tiene marcadas las dos casillas: dejá sólo Llegó o No llega.' } });
      return;
    }

    if (weight === 'invalid') {
      set(row, { outcome: 'error', animal: null, note: { severity: 'error', message: `El peso "${row.peso}" no es un número mayor que cero.` } });
      return;
    }

    if (bodyCondition === 'invalid') {
      set(row, {
        outcome: 'error',
        animal: null,
        note: { severity: 'error', message: `El EC "${row.ec}" no está en la escala oficial: de 1 a 5, de 0,5 en 0,5 (1 · 1,5 · 2 … 5).` }
      });
      return;
    }

    const match = byIdentification.get(tag);

    if (!match) {
      if (row.no_llega) {
        set(row, { outcome: 'error', animal: null, note: { severity: 'error', message: `${tag} no está en ningún DTE de la orden: "No llega" no aplica. Revisá la lectura.` } });
        return;
      }

      set(row, {
        outcome: 'unlisted',
        animal: null,
        note: {
          severity: 'warning',
          message: `${tag} no figura en ningún DTE de la orden: no entra al stock, queda como novedad "Caravana sin DTE" para reclamar el DTE.${row.llego ? '' : ' Se toma como llegada porque se escribió en un renglón libre.'}`
        }
      });
      return;
    }

    const { animal, dte } = match;

    if (animal.reception_status !== 'PENDING') {
      set(row, {
        outcome: 'ignored',
        animal,
        note: {
          severity: 'info',
          message: animal.reception_status === 'RECEIVED' ? `Ya se recibió el ${animal.received_at ?? ''}: no se carga de nuevo.` : 'Ya se declaró que no llegará: no se carga de nuevo.'
        }
      });
      return;
    }

    const otherDte = sheet && dte.id !== sheet.dte_id ? `Es del DTE ${dte.dte_number}, no del de la hoja. ` : '';

    if (row.llego) {
      set(row, { outcome: 'received', animal, note: otherDte ? { severity: 'info', message: `${otherDte}Se recibe igual.` } : null });
      return;
    }

    if (row.no_llega) {
      set(row, {
        outcome: 'missing',
        animal,
        note: weight !== null ? { severity: 'warning', message: `${otherDte}Marcada "No llega" pero tiene peso: revisá cuál de las dos es.` } : otherDte ? { severity: 'info', message: otherDte } : null
      });
      return;
    }

    set(row, {
      outcome: 'later',
      animal,
      note: weight !== null ? { severity: 'warning', message: 'Tiene peso pero no está marcada como llegada: queda en tránsito. Marcá "Llegó" si llegó.' } : null
    });
  });

  if (counts.missing > 0 && metadata.motivo_no_llegan.trim().length < 3) {
    headerErrors.push(`Hay ${counts.missing === 1 ? '1 caravana marcada' : `${counts.missing} caravanas marcadas`} "No llega": falta el motivo.`);
  }

  if (counts.received + counts.missing + counts.unlisted === 0) {
    headerErrors.push('La hoja no marca ninguna caravana como llegada ni como que no llega.');
  }

  if (averaged && average === null && counts.received > 0) {
    headerWarnings.push('La hoja es de peso promedio y no se escribió el peso: las caravanas se reciben sin peso. Escribilo arriba si se pesaron.');
  }

  const blocked = headerErrors.length > 0 || counts.error > 0 || !sheet;
  const lines = rows.map((row) => ({ row, resolution: resolutions.get(row.id) }));
  const weightOf = (row: Ing03Row): number | null => {
    if (averaged) return typeof average === 'number' ? average : null;

    const weight = parseWeight(row.peso);

    return weight === 'invalid' ? null : weight;
  };
  const bodyConditionOf = (row: Ing03Row): number | null => {
    const score = parseBodyCondition(row.ec);

    return score === 'invalid' ? null : score;
  };

  return {
    rows: resolutions,
    headerErrors,
    headerWarnings,
    counts,
    payload:
      blocked || !sheet
        ? null
        : {
            method: 'SHEET',
            received_at: metadata.fecha_recepcion,
            dte_id: null,
            receipt_sheet_id: sheet.id,
            pages: pagesOf(pages, sheet, headerWarnings),
            received: lines
              .filter((l) => l.resolution?.outcome === 'received')
              .map((l) => ({ caravan_id: l.resolution!.animal!.caravan_id, weight: weightOf(l.row), body_condition: bodyConditionOf(l.row) })),
            missing: lines.filter((l) => l.resolution?.outcome === 'missing').map((l) => l.resolution!.animal!.caravan_id),
            reason: counts.missing > 0 ? metadata.motivo_no_llegan.trim() : null,
            unlisted: lines
              .filter((l) => l.resolution?.outcome === 'unlisted')
              .map((l) => ({
                identification: l.row.caravana.trim().toUpperCase(),
                sex: l.row.sexo === 'M' || l.row.sexo === 'H' ? l.row.sexo : null,
                breed: l.row.raza.trim() || null,
                coat: l.row.pelaje.trim() || null,
                // The average goes to the caravans that are received; an animal without DTE is not received.
                weight: averaged ? null : weightOf(l.row),
                body_condition: bodyConditionOf(l.row)
              }))
          }
  };
};
