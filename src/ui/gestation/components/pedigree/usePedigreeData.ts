import { useMemo } from 'react';
import { useCompany } from '@/contexts/CompanyContext';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';
import {
  buildPedigreeRecord,
  PedigreeRecord,
} from '@/core/caravans/domain/services/pedigreeAnalysis';

export interface PedigreeMetrics {
  total: number;
  withLineage: number;
  avgFx: string;
  alertCount: number;
}

export function usePedigreeData() {
  const { activeCompanyId } = useCompany();
  const { data: caravans = [], isLoading } = useCaravans(activeCompanyId);

  // Map of caravan ID -> Caravan entity
  const caravansMap = useMemo(() => {
    const map = new Map<number, Caravan>();
    caravans.forEach((c) => map.set(c.id, c));
    return map;
  }, [caravans]);

  // Map of parent ID -> array of child IDs
  const childrenMap = useMemo(() => {
    const map = new Map<number, number[]>();
    caravans.forEach((c) => {
      if (c.lineage?.father_id) {
        const list = map.get(c.lineage.father_id) || [];
        list.push(c.id);
        map.set(c.lineage.father_id, list);
      }
      if (c.lineage?.mother_id) {
        const list = map.get(c.lineage.mother_id) || [];
        list.push(c.id);
        map.set(c.lineage.mother_id, list);
      }
    });
    return map;
  }, [caravans]);

  // Full Pedigree Records for all caravans
  const pedigreeRecords: PedigreeRecord[] = useMemo(() => {
    return caravans.map((c) => buildPedigreeRecord(c, caravansMap, childrenMap));
  }, [caravans, caravansMap, childrenMap]);

  // Genetic metrics summary
  const metrics: PedigreeMetrics = useMemo(() => {
    const total = caravans.length;
    const withLineage = pedigreeRecords.filter((r) => r.father !== null || r.mother !== null).length;
    const sumFx = pedigreeRecords.reduce((acc, r) => acc + r.inbreedingCoefficient, 0);
    const avgFx = total > 0 ? (sumFx / total).toFixed(2) : '0.00';
    const alertCount = pedigreeRecords.filter(
      (r) => r.inbreedingRisk === 'HIGH' || r.inbreedingRisk === 'CRITICAL'
    ).length;

    return { total, withLineage, avgFx, alertCount };
  }, [caravans.length, pedigreeRecords]);

  return { caravans, isLoading, pedigreeRecords, metrics, caravansMap };
}