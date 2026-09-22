import { useCallback, useEffect, useMemo, useState } from 'react';
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

/**
 * Groups the rows by the destination written on them and proposes a resolution for each
 * distinct name.
 *
 * Everything here is a PROPOSAL. What gets submitted is what the operator confirmed in
 * the destinations panel, which is also the only place a batch to be created gets its
 * activity, its type and its management system: the sheet carries a name, never a
 * configuration.
 *
 * The count per destination is the other half of the job. A group of one where there
 * should be thirty is how a misread batch name announces itself before anything is
 * written.
 */
export function useCact01Destinations(
  rows: Cact01Row[],
  batches: BatchOption[],
  defaultManagement: boolean | null
) {
  const [byKey, setByKey] = useState<Record<string, Cact01Destination>>({});

  const countsByKey = useMemo(() => {
    const counts = new Map<string, number>();

    rows.forEach((row) => {
      if (row.caravana.trim() === '') return;

      const key = normalizeDestinationKey(row.destination_key);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });

    return counts;
  }, [rows]);

  useEffect(() => {
    const next: Record<string, Cact01Destination> = {};
    let changed = false;

    countsByKey.forEach((_, key) => {
      if (byKey[key]) {
        next[key] = byKey[key];
        return;
      }

      // Proposals are seeded once per key. A later edit by the operator, or a batch
      // list refetched in the background, must not undo what they already chose.
      changed = true;

      const match = key === '' ? undefined : batches.find((batch) => normalizeDestinationKey(batch.name) === key);

      next[key] = match
        ? {
            key,
            label: key,
            mode: 'existing',
            batchId: match.id,
            name: match.name,
            activityId: match.activityId,
            batchTypeId: null,
            isConfined: match.isConfined,
            touched: false,
          }
        : {
            key,
            label: key,
            mode: 'new',
            batchId: null,
            name: key === '' ? '' : toTitleCase(key),
            activityId: null,
            batchTypeId: null,
            isConfined: defaultManagement,
            touched: false,
          };
    });

    // Keys that disappeared because their rows were edited or deleted.
    if (!changed && Object.keys(next).length === Object.keys(byKey).length) return;

    setByKey(next);
  }, [countsByKey, batches, defaultManagement, byKey]);

  // The header box is a proposal for the batches that get created, so changing it has
  // to reach the ones nobody has touched yet. A destination the operator already
  // answered is left alone: their answer outranks the box.
  useEffect(() => {
    setByKey((prev) => {
      let changed = false;
      const next: Record<string, Cact01Destination> = {};

      Object.entries(prev).forEach(([key, destination]) => {
        if (destination.mode === 'new' && !destination.touched && destination.isConfined !== defaultManagement) {
          changed = true;
          next[key] = { ...destination, isConfined: defaultManagement };
          return;
        }

        next[key] = destination;
      });

      return changed ? next : prev;
    });
  }, [defaultManagement]);

  const destinations = useMemo<Cact01Destination[]>(
    () =>
      Array.from(countsByKey.keys())
        .map((key) => byKey[key])
        .filter((destination): destination is Cact01Destination => Boolean(destination))
        .sort((a, b) => a.key.localeCompare(b.key)),
    [countsByKey, byKey]
  );

  const update = useCallback((key: string, patch: Partial<Cact01Destination>) => {
    setByKey((prev) => {
      const current = prev[key];

      if (!current) return prev;

      return { ...prev, [key]: { ...current, ...patch, touched: true } };
    });
  }, []);

  const countOf = useCallback((key: string): number => countsByKey.get(key) ?? 0, [countsByKey]);

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

    destinations.forEach((destination) => {
      const label = destination.key === '' ? 'las filas sin destino' : `"${destination.label}"`;

      if (destination.key === '') {
        issues.push(`Hay ${countOf('')} fila(s) sin lote de destino: ni en la celda ni en el encabezado.`);
        return;
      }

      if (destination.mode === 'existing' && destination.batchId == null) {
        issues.push(`Elegí el lote existente para ${label}.`);
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
  }, [destinations, duplicatedKeys, countOf]);

  const reset = useCallback(() => setByKey({}), []);

  return { destinations, update, countOf, duplicatedKeys, blockingIssues, reset };
}

const toTitleCase = (value: string): string =>
  value
    .toLowerCase()
    .split(' ')
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ');

export type Cact01DestinationsState = ReturnType<typeof useCact01Destinations>;
export type { BatchOption as Cact01BatchOption };
