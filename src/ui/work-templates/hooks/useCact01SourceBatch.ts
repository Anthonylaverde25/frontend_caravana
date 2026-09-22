import { useEffect, useRef } from 'react';
import { normalizeDestinationKey } from './useCact01Pages';

interface SourceBatchOption {
  id: number;
  name: string;
  activityName: string;
  count: number;
}

/**
 * Proposes the source batch from the name printed on the sheet.
 *
 * Without this the operator had to pick it by hand on every load, even though the sheet
 * says right at the top which batch the troop came from — and the validation would just
 * repeat "Elegí el lote de origen" over a header that already answered the question.
 *
 * It is a PROPOSAL, applied once per name read: the operator's choice outranks the paper,
 * and a batch list refetched in the background must not undo it. The match is
 * accent-insensitive, because that is exactly how a scan fails to find "Recría".
 *
 * Returns whether the name on the paper matched anything, so the header can say "we could
 * not find this batch" instead of silently showing an empty selector.
 */
export function useCact01SourceBatch(
  sheetName: string,
  sourceBatchId: number | null,
  setSourceBatchId: (batchId: number | null) => void,
  options: SourceBatchOption[]
): { matched: boolean; proposedFor: string | null } {
  const proposedFor = useRef<string | null>(null);
  const key = normalizeDestinationKey(sheetName);
  const match = key === '' ? undefined : options.find((option) => normalizeDestinationKey(option.name) === key);

  useEffect(() => {
    if (key === '' || proposedFor.current === key) {
      return;
    }

    proposedFor.current = key;

    if (match) {
      setSourceBatchId(match.id);
    }
  }, [key, match?.id, setSourceBatchId]);

  return {
    matched: Boolean(match),
    proposedFor: key === '' ? null : sheetName,
  };
}
