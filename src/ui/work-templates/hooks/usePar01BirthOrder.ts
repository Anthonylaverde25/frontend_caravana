import { useMemo } from 'react';
import { useBirthOrderByCode } from '@/features/birth-orders/hooks/useBirthOrder';
import type { BirthOrder, BirthOrderAnimal } from '@/features/birth-orders/types';
import type { Par01PagesState } from './usePar01Pages';

/**
 * The birth order a scanned PAR-01 names by its code, and each of its females by tag: what the
 * review shows next to each row (due date, whether it is still pending) and the sires it offers.
 */
export function usePar01BirthOrder(state: Par01PagesState) {
  const code = state.metadata.orden_paricion.trim();
  const { data, isFetching } = useBirthOrderByCode(code || null);
  const order: BirthOrder | null = data ?? null;

  const animalsByTag = useMemo(() => {
    const byTag = new Map<string, BirthOrderAnimal>();
    order?.animals.forEach((animal) => {
      if (animal.identification) byTag.set(animal.identification.toUpperCase(), animal);
    });

    return byTag;
  }, [order]);

  return {
    code,
    order,
    isLoading: isFetching,
    /** The paper carries a code that no order has. */
    notFound: code !== '' && !isFetching && data === null,
    animalOf: (tag: string) => animalsByTag.get(tag.trim().toUpperCase()) ?? null
  };
}

export type Par01BirthOrderState = ReturnType<typeof usePar01BirthOrder>;
