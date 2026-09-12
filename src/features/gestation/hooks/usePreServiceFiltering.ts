import { useMemo } from 'react';
import { BullHealthEvaluation } from '@/core/pre-service/domain/BullHealthEvaluation';
import {
  PreServiceFilterStatus,
  PreServiceLabFilter,
} from '@/ui/gestation/components/pre-service/PreServiceFilterBar';

export interface PreServiceCounts {
  total: number;
  apt: number;
  inTreatment: number;
  unfit: number;
  pending: number;
  pendingScrape: number;
  pendingSerology: number;
  pendingAnyLab: number;
  clearedLab: number;
}

interface Params {
  bulls: BullHealthEvaluation[];
  searchQuery: string;
  statusFilter: PreServiceFilterStatus;
  labFilter: PreServiceLabFilter;
}

const hasPending = (bull: BullHealthEvaluation, type: string): boolean =>
  bull.lab_samples?.some((s) => s.sample_type === type && s.status === 'PENDING_RESULTS') ?? false;

const isFullyCleared = (bull: BullHealthEvaluation): boolean => {
  const hasSamples = (bull.lab_samples?.length ?? 0) > 0;

  return hasSamples && (bull.lab_samples?.every((s) => s.status === 'NEGATIVE_CLEARED') ?? false);
};

/**
 * Triage arithmetic for the pre-service listing: the KPI counters and the filtered set.
 *
 * Extracted from the view so the container stays an orchestrator — the counters walk the whole
 * troop on every render and had no business living inside the JSX file.
 */
export function usePreServiceFiltering({ bulls, searchQuery, statusFilter, labFilter }: Params) {
  const counts = useMemo<PreServiceCounts>(() => {
    const acc: PreServiceCounts = {
      total: bulls.length,
      apt: 0,
      inTreatment: 0,
      unfit: 0,
      pending: 0,
      pendingScrape: 0,
      pendingSerology: 0,
      pendingAnyLab: 0,
      clearedLab: 0,
    };

    bulls.forEach((bull) => {
      if (bull.status === 'APT') acc.apt++;
      else if (bull.status === 'IN_TREATMENT') acc.inTreatment++;
      else if (bull.status === 'UNFIT') acc.unfit++;
      else acc.pending++;

      const scrape = hasPending(bull, 'PREPUCE_SCRAPE');
      const serology = hasPending(bull, 'BLOOD_SEROLOGY');

      if (scrape) acc.pendingScrape++;
      if (serology) acc.pendingSerology++;
      if (scrape || serology) acc.pendingAnyLab++;
      if (isFullyCleared(bull)) acc.clearedLab++;
    });

    return acc;
  }, [bulls]);

  const filteredBulls = useMemo(() => {
    return bulls.filter((bull) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matches =
          bull.caravan_number.toLowerCase().includes(query) ||
          (bull.aplomo_notes?.toLowerCase().includes(query) ?? false) ||
          (bull.observations?.toLowerCase().includes(query) ?? false);

        if (!matches) return false;
      }

      if (statusFilter !== 'ALL' && bull.status !== statusFilter) return false;

      if (labFilter === 'PENDING_SCRAPE') return hasPending(bull, 'PREPUCE_SCRAPE');
      if (labFilter === 'PENDING_SEROLOGY') return hasPending(bull, 'BLOOD_SEROLOGY');
      if (labFilter === 'PENDING_ANY') {
        return bull.lab_samples?.some((s) => s.status === 'PENDING_RESULTS') ?? false;
      }
      if (labFilter === 'CLEARED') return isFullyCleared(bull);

      return true;
    });
  }, [bulls, searchQuery, statusFilter, labFilter]);

  return { counts, filteredBulls };
}
