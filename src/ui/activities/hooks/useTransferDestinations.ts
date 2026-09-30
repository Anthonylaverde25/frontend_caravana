import { useCallback, useMemo, useState } from 'react';
import type { Cact01Destination } from '@/ui/work-templates/components/scan/types';

export type TransferDestinationMode = 'single' | 'per_animal';

let destinationSequence = 0;

const newKey = (): string => {
  destinationSequence += 1;

  return `dest-${destinationSequence}`;
};

/**
 * A destination declared on screen, before any animal points at it.
 *
 * It is born already inside the destination activity of the movement. The activity is not
 * something each destination answers for itself — it is declared once for the whole sheet
 * and every destination inherits it, which is what keeps the batches of one movement inside
 * one productive stage.
 */
export const emptyDestination = (
  isConfined: boolean | null,
  activityId: number | null
): Cact01Destination => ({
  key: newKey(),
  label: '',
  mode: 'existing',
  batchId: null,
  name: '',
  activityId,
  batchTypeId: null,
  isConfined,
  touched: false,
});

/**
 * The destinations of a per-animal transfer and which animal goes to each.
 *
 * Reuses `Cact01Destination`, the same shape the scan screen resolves from paper, so a
 * destination declared here and one read off a sheet are the same thing to everything
 * downstream — the printable column, the payload and the backend all see one type.
 *
 * Leaving an animal unassigned is a deliberate choice, not a missing value: it means the
 * operator will decide at the chute. What it costs is the on-screen execution, because a
 * movement cannot be recorded against a destination nobody has named yet.
 */
export function useTransferDestinations(
  defaultManagement: boolean | null,
  destinationActivityId: number | null
) {
  const [destinations, setDestinations] = useState<Cact01Destination[]>([]);
  const [assignments, setAssignments] = useState<Record<number, string>>({});

  const add = useCallback(() => {
    setDestinations((prev) => [...prev, emptyDestination(defaultManagement, destinationActivityId)]);
  }, [defaultManagement, destinationActivityId]);

  const update = useCallback((key: string, patch: Partial<Cact01Destination>) => {
    setDestinations((prev) =>
      prev.map((destination) =>
        destination.key === key ? { ...destination, ...patch, touched: true } : destination
      )
    );
  }, []);

  const remove = useCallback((key: string) => {
    setDestinations((prev) => prev.filter((destination) => destination.key !== key));
    setAssignments((prev) =>
      Object.fromEntries(Object.entries(prev).filter(([, value]) => value !== key))
    );
  }, []);

  /** Assigns one animal, or a whole selection in one go: apart 200 head one by one is not work. */
  const assign = useCallback((caravanIds: number[], key: string | null) => {
    setAssignments((prev) => {
      const next = { ...prev };

      caravanIds.forEach((id) => {
        if (key === null) {
          delete next[id];
        } else {
          next[id] = key;
        }
      });

      return next;
    });
  }, []);

  const countOf = useCallback(
    (key: string, caravanIds: number[]): number =>
      caravanIds.filter((id) => assignments[id] === key).length,
    [assignments]
  );

  const labelOf = useCallback(
    (key: string | undefined): string | null => {
      if (!key) return null;

      const destination = destinations.find((d) => d.key === key);

      if (!destination) return null;

      return destination.name.trim() || null;
    },
    [destinations]
  );

  /**
   * What gets printed on the row of an animal: the batch it goes to and the management
   * letter of that batch.
   *
   * Null when the destination was left for the chute. The letter comes from the batch, never
   * from the animal, so a destination whose management system is undeclared prints the name
   * and leaves the letter blank.
   */
  const assignmentOf = useCallback(
    (key: string | undefined): { lote: string; manejo: 'C' | 'P' | '' } | null => {
      if (!key) return null;

      const destination = destinations.find((d) => d.key === key);
      const lote = destination?.name.trim();

      if (!destination || !lote) return null;

      return {
        lote,
        manejo: destination.isConfined === true ? 'C' : destination.isConfined === false ? 'P' : '',
      };
    },
    [destinations]
  );

  /**
   * Everything that stops the movement from being recorded from this screen. An unassigned
   * animal is listed on purpose: it is not an error, it is the reason the sheet has to go
   * out on paper first.
   */
  const issuesFor = useCallback(
    (caravanIds: number[]): string[] => {
      const issues: string[] = [];
      const used = new Set(caravanIds.map((id) => assignments[id]).filter(Boolean));

      if (destinationActivityId == null && destinations.length > 0) {
        issues.push('Falta la actividad de destino: define a qué etapa productiva pasan los animales.');
      }

      destinations.forEach((destination) => {
        const label = destination.name.trim() || 'un destino sin nombre';

        // The invariant of the movement, checked here as well as in the picker that should
        // make it impossible: every destination batch lives inside the destination activity.
        if (
          destinationActivityId != null &&
          destination.activityId != null &&
          destination.activityId !== destinationActivityId
        ) {
          issues.push(`El lote ${label} no pertenece a la actividad de destino declarada.`);
          return;
        }

        if (destination.mode === 'existing' && destination.batchId == null) {
          issues.push(`Elegí el lote existente para ${label}.`);
          return;
        }

        if (destination.mode === 'new') {
          if (destination.name.trim() === '') issues.push('Falta el nombre de uno de los lotes nuevos.');
          if (destination.activityId == null) issues.push(`Falta la actividad de ${label}.`);
          if (destination.batchTypeId == null) issues.push(`Falta el tipo de lote de ${label}.`);
          if (destination.isConfined == null) {
            issues.push(`Indicá si ${label} se maneja a corral o de forma extensiva.`);
          }
        }
      });

      // Two destinations landing on the same batch would write the same MOVEMENT_IN twice,
      // which the backend rejects. Caught here, where the operator can still merge them.
      const identities = destinations
        .filter((d) => used.has(d.key))
        .map((d) => (d.mode === 'existing' ? `batch:${d.batchId}` : `name:${d.name.trim().toUpperCase()}`))
        .filter((identity) => identity !== 'batch:null' && identity !== 'name:');

      if (new Set(identities).size !== identities.length) {
        issues.push('Hay dos destinos que apuntan al mismo lote. Uní los dos grupos en uno solo.');
      }

      return Array.from(new Set(issues));
    },
    [destinations, assignments, destinationActivityId]
  );

  const unassignedCount = useCallback(
    (caravanIds: number[]): number => caravanIds.filter((id) => !assignments[id]).length,
    [assignments]
  );

  const reset = useCallback(() => {
    setDestinations([]);
    setAssignments({});
  }, []);

  /**
   * Replaces everything with what an issued order already decided: the screen shows the order
   * it is bound to, not a fresh start.
   */
  const load = useCallback((next: Cact01Destination[], nextAssignments: Record<number, string>) => {
    setDestinations(next);
    setAssignments(nextAssignments);
  }, []);

  const usedDestinations = useMemo(
    () => destinations.filter((destination) => Object.values(assignments).includes(destination.key)),
    [destinations, assignments]
  );

  return {
    destinations,
    usedDestinations,
    assignments,
    add,
    update,
    remove,
    assign,
    countOf,
    labelOf,
    assignmentOf,
    issuesFor,
    unassignedCount,
    reset,
    load,
  };
}

export type TransferDestinationsState = ReturnType<typeof useTransferDestinations>;
