import { useMemo } from 'react';
import { useBatches } from './useBatches';

/**
 * The own batches that can receive animals: active and not of a provider. The destinations of a
 * purchase are chosen among them, and "Crear lote nuevo" adds to them.
 */
export function useOwnActiveBatches() {
  const query = useBatches(undefined, undefined, 'own');
  const batches = useMemo(() => (query.data ?? []).filter((b) => b.provider_id == null && b.is_active), [query.data]);

  return { ...query, batches };
}
