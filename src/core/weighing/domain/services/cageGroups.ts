import { CageGroupInput } from '../entities/Weighing';

/**
 * Live arithmetic of a cage weighing, mirroring App\Core\Services\GroupWeightImputation. It only
 * informs: whether the loads cover the batch is decided by the backend when confirming.
 */
export interface CageGroupsSummary {
  heads: number;
  netWeight: number;
  average: number | null;
  /** Positive when heads are missing, negative when there are too many, 0 when they match. */
  missingHeads: number;
}

export const groupNet = (g: CageGroupInput) => g.gross_weight - g.tare_weight;

export const groupAverage = (g: CageGroupInput): number | null =>
  g.head_count > 0 && groupNet(g) > 0 ? groupNet(g) / g.head_count : null;

/** The same summary for an average declared with the heads it covers. */
export function summarizeDeclaredAverage(average: number, heads: number, batchHeads: number): CageGroupsSummary {
  const valid = average > 0 && heads > 0;

  return {
    heads: valid ? heads : 0,
    netWeight: valid ? average * heads : 0,
    average: valid ? average : null,
    missingHeads: batchHeads - (valid ? heads : 0),
  };
}

export function summarizeCageGroups(groups: CageGroupInput[], batchHeads: number): CageGroupsSummary {
  const valid = groups.filter((g) => g.head_count > 0 && groupNet(g) > 0);
  const heads = valid.reduce((sum, g) => sum + g.head_count, 0);
  const netWeight = valid.reduce((sum, g) => sum + groupNet(g), 0);

  return {
    heads,
    netWeight,
    average: heads > 0 ? netWeight / heads : null,
    missingHeads: batchHeads - heads,
  };
}
