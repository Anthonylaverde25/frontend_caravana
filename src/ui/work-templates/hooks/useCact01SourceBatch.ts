import { useEffect, useMemo, useRef, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import axiosInstance from '@/utils/axios';
import { useCompany } from '@/contexts/CompanyContext';
import { normalizeDestinationKey } from './useCact01Pages';
import type { Cact01PagesState } from './useCact01Pages';

interface SourceBatchOption {
  id: number;
  name: string;
  activityName: string;
  count: number;
}

interface BatchSummary {
  id: number;
  name: string;
}

/** What the server makes of the batch name on the sheet and the animals listed below it. */
export interface Cact01SourceResolution {
  basis: 'name_and_caravans' | 'name' | 'caravans' | 'conflict' | 'none';
  proposed: BatchSummary | null;
  name_match: BatchSummary | null;
  caravans_match: BatchSummary | null;
  caravans_read: number;
  caravans_found: number;
  caravans_in_match: number;
  caravans_not_found: number;
  distribution: (BatchSummary & { count: number })[];
  /** What the system knows of each tag found, for the cells the scan left blank. */
  animals: { identification: string; sex: string; category_label: string | null }[];
}

/** Rows are edited one keystroke at a time; the question is asked once the typing stops. */
const RESOLVE_DELAY_MS = 400;

/**
 * Proposes the source batch of a scanned CACT-01.
 *
 * The name at the top is handwritten and often misread ("TEST CACT CRIO"), but the tags below
 * it are a stronger witness: every animal sits in a batch, and the animals of this sheet leave
 * from its source. The server weighs both and answers with a proposal and what backs it.
 *
 * It is a PROPOSAL: applied only while nobody else decided — the operator's choice and the
 * transfer order both outrank it — and only when the batch is one the source selector offers,
 * otherwise the screen would hold a value it cannot show. A conflict between the name and the
 * animals proposes nothing; the header lays out both and the operator picks.
 */
export function useCact01SourceBatch(pages: Cact01PagesState, options: SourceBatchOption[]) {
  const { activeCompanyId } = useCompany();
  const { sourceBatchOrigin, setSourceBatchId, fillFromSystem } = pages;
  const writtenName = pages.metadata.lote_origen;

  const tags = useMemo(
    () =>
      Array.from(
        new Set(pages.rows.map((row) => row.caravana.trim().toUpperCase()).filter((tag) => tag !== ''))
      ).sort(),
    [pages.rows]
  );

  const liveKey = JSON.stringify([normalizeDestinationKey(writtenName), tags]);
  const isEmpty = normalizeDestinationKey(writtenName) === '' && tags.length === 0;
  const [requestKey, setRequestKey] = useState(liveKey);

  useEffect(() => {
    const timer = setTimeout(() => setRequestKey(liveKey), RESOLVE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [liveKey]);

  const { data: resolution = null, isFetching, isPlaceholderData } = useQuery({
    queryKey: ['cact01-source-batch', activeCompanyId, requestKey],
    queryFn: async (): Promise<Cact01SourceResolution> => {
      const [lote_origen, caravanas] = JSON.parse(requestKey) as [string, string[]];
      const response = await axiosInstance.post<{ data: Cact01SourceResolution }>(
        '/work-templates/cact-01/source-batch',
        { lote_origen, caravanas }
      );

      return response.data.data;
    },
    enabled: !isEmpty && requestKey === liveKey,
    staleTime: 60 * 1000,
    // The last answer stays on screen while a corrected tag is being typed, instead of blinking.
    placeholderData: keepPreviousData,
  });

  const offered = (batch: BatchSummary | null): boolean =>
    batch != null && options.some((option) => option.id === batch.id);

  const proposedId = resolution && offered(resolution.proposed) ? resolution.proposed!.id : null;

  // Once per answer, and only an answer to THIS sheet: the previous one stays on screen while the
  // new one loads, and applying it would carry the last sheet's batch over. A background refetch
  // of the same sheet must not re-impose a proposal the operator has since cleared. Clearing the
  // screen forgets it, so the next sheet gets its own.
  const appliedFor = useRef<string | null>(null);
  const isCurrentAnswer = resolution != null && !isPlaceholderData && requestKey === liveKey;

  useEffect(() => {
    if (isEmpty) {
      appliedFor.current = null;
      return;
    }

    if (!isCurrentAnswer || appliedFor.current === requestKey) return;

    appliedFor.current = requestKey;

    if (sourceBatchOrigin === 'operator' || sourceBatchOrigin === 'order') return;

    // A batch that was only ever proposed goes when the evidence no longer backs it (a page
    // added, a tag corrected): leaving it would present an old guess as a current one.
    setSourceBatchId(proposedId, proposedId == null ? 'operator' : 'proposal');
  }, [isEmpty, isCurrentAnswer, proposedId, requestKey, sourceBatchOrigin, setSourceBatchId]);

  // The same answer knows every animal read: the sex and category the scan left blank are
  // filled from it. Only the answer to this sheet, never the one still shown from the last.
  useEffect(() => {
    if (!isCurrentAnswer || !resolution) return;

    fillFromSystem(
      Object.fromEntries(resolution.animals.map((animal) => [animal.identification.trim().toUpperCase(), animal]))
    );
  }, [isCurrentAnswer, resolution, fillFromSystem]);

  return {
    resolution: isEmpty ? null : resolution,
    isResolving: !isEmpty && (isFetching || requestKey !== liveKey),
    /** Whether a batch the answer names can be picked in the selector. */
    offered,
  };
}

export type Cact01SourceBatchState = ReturnType<typeof useCact01SourceBatch>;
