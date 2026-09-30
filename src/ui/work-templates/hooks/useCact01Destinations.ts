import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ActivityBatch } from '@/core/activities/domain/entities/Activity';
import type { Cact01Destination, Cact01Row } from '../components/scan/types';
import { normalizeDestinationKey } from './useCact01Pages';

interface BatchOption {
  id: number;
  name: string;
  activityId: number;
  activityName: string;
  isConfined: boolean | null;
}

/** What one written destination name carries on the paper: its animals and its M letters. */
interface PaperDestination {
  count: number;
  /** Every distinct letter written against this batch. More than one is a contradiction. */
  letters: Set<'C' | 'P'>;
}

/**
 * Groups the rows by the destination written on them and proposes a resolution for each
 * distinct name.
 *
 * Everything here is a PROPOSAL. What gets submitted is what the operator confirmed in
 * the destinations panel. The sheet carries a name and a management letter, never a
 * configuration: the batch TYPE is the one thing it cannot carry, and it is asked only for
 * the names that do not already exist in the destination activity.
 *
 * A name is matched ONLY against the batches of that activity. Searching the whole company
 * is how a movement declared towards one stage used to land in a batch of another, decided
 * by nothing but the order of a list.
 *
 * The count per destination is the other half of the job. A group of one where there
 * should be thirty is how a misread batch name announces itself before anything is
 * written.
 */
export function useCact01Destinations(
  rows: Cact01Row[],
  batches: BatchOption[],
  defaultManagement: boolean | null,
  destinationActivityId: number | null
) {
  const [byKey, setByKey] = useState<Record<string, Cact01Destination>>({});

  const paperByKey = useMemo(() => {
    const byName = new Map<string, PaperDestination>();

    rows.forEach((row) => {
      if (row.caravana.trim() === '') return;

      const key = normalizeDestinationKey(row.destination_key);
      const current = byName.get(key) ?? { count: 0, letters: new Set<'C' | 'P'>() };

      current.count += 1;

      if (row.manejo === 'C' || row.manejo === 'P') {
        current.letters.add(row.manejo);
      }

      byName.set(key, current);
    });

    return byName;
  }, [rows]);

  /** Batches of the destination activity: the only ones a destination may resolve to. */
  const eligibleBatches = useMemo(
    () =>
      batches.filter((batch) => destinationActivityId == null || batch.activityId === destinationActivityId),
    [batches, destinationActivityId]
  );

  /**
   * Names that exist as an active batch of ANOTHER activity.
   *
   * Neither resolution is available for these: pointing at that batch would break the
   * declared destination, and creating one would collide with a name already in use. It
   * takes a person to rename or pick again, so it is surfaced rather than guessed.
   */
  const conflictingByKey = useMemo(() => {
    const conflicts = new Map<string, BatchOption>();

    if (destinationActivityId == null) return conflicts;

    paperByKey.forEach((_, key) => {
      if (key === '') return;

      const insideActivity = eligibleBatches.some((batch) => normalizeDestinationKey(batch.name) === key);

      if (insideActivity) return;

      const elsewhere = batches.find((batch) => normalizeDestinationKey(batch.name) === key);

      if (elsewhere) conflicts.set(key, elsewhere);
    });

    return conflicts;
  }, [paperByKey, eligibleBatches, batches, destinationActivityId]);

  useEffect(() => {
    const next: Record<string, Cact01Destination> = {};
    let changed = false;

    paperByKey.forEach((paper, key) => {
      if (byKey[key]) {
        next[key] = byKey[key];
        return;
      }

      // Proposals are seeded once per key. A later edit by the operator, or a batch
      // list refetched in the background, must not undo what they already chose.
      changed = true;

      const match = key === '' ? undefined : eligibleBatches.find((batch) => normalizeDestinationKey(batch.name) === key);

      // The M letters of this batch's rows. One distinct letter is an answer; two is a
      // contradiction, left unresolved here so the operator settles it.
      const fromPaper = paper.letters.size === 1 ? paper.letters.has('C') : null;

      next[key] = match
        ? {
            key,
            label: key,
            mode: 'existing',
            batchId: match.id,
            name: match.name,
            activityId: match.activityId,
            batchTypeId: null,
            // An existing batch is never reconfigured from paper: what it declares wins, and
            // a letter that disagrees is reported, not applied.
            isConfined: match.isConfined,
            touched: false,
          }
        : {
            key,
            label: key,
            mode: 'new',
            batchId: null,
            name: key === '' ? '' : toTitleCase(key),
            // The activity of a batch to be created is the sheet's, not a question of its own.
            activityId: destinationActivityId,
            batchTypeId: null,
            isConfined: fromPaper ?? defaultManagement,
            touched: false,
          };
    });

    // Keys that disappeared because their rows were edited or deleted.
    if (!changed && Object.keys(next).length === Object.keys(byKey).length) return;

    setByKey(next);
  }, [paperByKey, eligibleBatches, defaultManagement, destinationActivityId, byKey]);

  /**
   * Changing the destination activity re-opens every proposal nobody has touched.
   *
   * They were resolved against the previous activity, and a batch of another stage is no
   * longer a possible answer. Without this, choosing the activity AFTER loading the pages left
   * every name proposed as a new batch of nothing — which is the order people actually work in,
   * because the paper arrives first.
   *
   * What the operator already answered is left alone: their choice outranks a re-proposal.
   */
  const seededActivity = useRef<number | null | undefined>(undefined);

  useEffect(() => {
    const isFirstRun = seededActivity.current === undefined;
    const changed = seededActivity.current !== destinationActivityId;

    seededActivity.current = destinationActivityId;

    if (isFirstRun || !changed) return;

    setByKey((prev) => {
      const kept = Object.entries(prev).filter(([, destination]) => destination.touched);

      return kept.length === Object.keys(prev).length ? prev : Object.fromEntries(kept);
    });
  }, [destinationActivityId]);

  // The header box is a proposal for the batches that get created, so changing it has
  // to reach the ones nobody has touched yet. A destination the operator already
  // answered is left alone: their answer outranks the box.
  //
  // A destination whose rows carry an M letter is also left alone, and that is the order of
  // precedence the paper itself has: the letter was written about THAT batch, the box speaks
  // for the whole sheet. Without this the box would erase what the M cells declared.
  useEffect(() => {
    setByKey((prev) => {
      let changed = false;
      const next: Record<string, Cact01Destination> = {};

      Object.entries(prev).forEach(([key, destination]) => {
        const declaredOnItsRows = (paperByKey.get(key)?.letters.size ?? 0) === 1;

        if (
          destination.mode === 'new' &&
          !destination.touched &&
          !declaredOnItsRows &&
          destination.isConfined !== defaultManagement
        ) {
          changed = true;
          next[key] = { ...destination, isConfined: defaultManagement };
          return;
        }

        next[key] = destination;
      });

      return changed ? next : prev;
    });
  }, [defaultManagement, paperByKey]);

  const destinations = useMemo<Cact01Destination[]>(
    () =>
      Array.from(paperByKey.keys())
        .map((key) => byKey[key])
        .filter((destination): destination is Cact01Destination => Boolean(destination))
        .sort((a, b) => a.key.localeCompare(b.key)),
    [paperByKey, byKey]
  );

  const update = useCallback((key: string, patch: Partial<Cact01Destination>) => {
    setByKey((prev) => {
      const current = prev[key];

      if (!current) return prev;

      return { ...prev, [key]: { ...current, ...patch, touched: true } };
    });
  }, []);

  const countOf = useCallback((key: string): number => paperByKey.get(key)?.count ?? 0, [paperByKey]);

  /**
   * Two keys landing on the same batch would write the same MOVEMENT_IN twice, so the
   * backend rejects it. Caught here first, where the operator can still see which two
   * groups to merge.
   */
  const duplicatedKeys = useMemo<Set<string>>(() => {
    const byBatch = new Map<string, string[]>();

    destinations.forEach((destination) => {
      const identity =
        destination.mode === 'existing'
          ? `batch:${destination.batchId}`
          : `name:${normalizeDestinationKey(destination.name)}`;

      if (identity === 'batch:null' || identity === 'name:') return;

      byBatch.set(identity, [...(byBatch.get(identity) ?? []), destination.key]);
    });

    const duplicated = new Set<string>();
    byBatch.forEach((keys) => {
      if (keys.length > 1) keys.forEach((key) => duplicated.add(key));
    });

    return duplicated;
  }, [destinations]);

  /** Everything the backend would reject as a header error, surfaced before submitting. */
  const blockingIssues = useMemo<string[]>(() => {
    const issues: string[] = [];

    if (destinationActivityId == null && destinations.length > 0) {
      issues.push('Falta la actividad de destino: elegí a qué etapa productiva pasan los animales.');
    }

    destinations.forEach((destination) => {
      const label = destination.key === '' ? 'las filas sin destino' : `"${destination.label}"`;

      if (destination.key === '') {
        issues.push(`Hay ${countOf('')} animal(es) sin lote de destino: definilo en la celda de su fila.`);
        return;
      }

      // The name is taken by an active batch of another stage: it can neither receive these
      // animals nor be created, so somebody has to rename it or point somewhere else.
      const conflicting = conflictingByKey.get(destination.key);

      if (conflicting && destination.mode === 'new') {
        issues.push(
          `Ya existe un lote activo "${conflicting.name}" en ${conflicting.activityName}, y la planilla declara otra actividad de destino. Renombralo o elegí otro lote para ${label}.`
        );
        return;
      }

      // The same batch cannot be born penned on one line and grazing on another.
      const letters = paperByKey.get(destination.key)?.letters;

      if (destination.mode === 'new' && letters && letters.size > 1) {
        issues.push(
          `El lote nuevo para ${label} aparece como corral en una fila y como pastura en otra. Un lote es una cosa o la otra.`
        );
      }

      if (destination.mode === 'existing' && destination.batchId == null) {
        issues.push(`Elegí el lote existente para ${label}.`);
        return;
      }

      if (
        destinationActivityId != null &&
        destination.activityId != null &&
        destination.activityId !== destinationActivityId
      ) {
        issues.push(`El lote de ${label} no pertenece a la actividad de destino de la planilla.`);
        return;
      }

      if (destination.mode === 'new') {
        if (destination.name.trim() === '') issues.push(`Falta el nombre del lote nuevo para ${label}.`);
        if (destination.activityId == null) issues.push(`Falta la actividad del lote nuevo para ${label}.`);
        if (destination.batchTypeId == null) issues.push(`Falta el tipo de lote nuevo para ${label}.`);
        if (destination.isConfined == null) {
          issues.push(`Indicá si el lote nuevo para ${label} se maneja a corral o de forma extensiva.`);
        }
      }

      if (duplicatedKeys.has(destination.key)) {
        issues.push(`${label} apunta al mismo lote que otro destino. Uní los dos grupos en uno solo.`);
      }
    });

    return Array.from(new Set(issues));
  }, [destinations, duplicatedKeys, countOf, conflictingByKey, paperByKey, destinationActivityId]);

  /**
   * What the M cells say about batches that already exist.
   *
   * Never blocking and never applied: the sheet does not reconfigure a batch. It is reported
   * because a letter that disagrees with the batch is either a misread cell or a batch whose
   * management system nobody updated, and both are worth knowing before the movement.
   */
  const advisories = useMemo<string[]>(() => {
    const notes: string[] = [];

    destinations.forEach((destination) => {
      if (destination.mode !== 'existing' || destination.batchId == null) return;

      const letters = paperByKey.get(destination.key)?.letters;

      if (!letters || letters.size !== 1) return;

      const written = letters.has('C');

      if (destination.isConfined == null) {
        notes.push(
          `La planilla escribió ${written ? 'C' : 'P'} para "${destination.name}", pero ese lote no tiene declarado el sistema de manejo. No se modifica: cambialo desde el lote, en Actividades.`
        );
        return;
      }

      if (destination.isConfined !== written) {
        notes.push(
          `La planilla escribió ${written ? 'corral' : 'pastura'} para "${destination.name}", pero el lote está declarado como ${destination.isConfined ? 'corral' : 'pastura'}. Vale el lote.`
        );
      }
    });

    return Array.from(new Set(notes));
  }, [destinations, paperByKey]);

  const reset = useCallback(() => setByKey({}), []);

  return { destinations, update, countOf, duplicatedKeys, blockingIssues, advisories, reset };
}

const toTitleCase = (value: string): string =>
  value
    .toLowerCase()
    .split(' ')
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ');

export type Cact01DestinationsState = ReturnType<typeof useCact01Destinations>;
export type { BatchOption as Cact01BatchOption };
