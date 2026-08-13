import { Caravan } from '../entities/Caravan';
import { calculateWrightInbreeding, classifyInbreedingRisk, InbreedingRisk } from './pedigreeAnalysis';

export interface FemaleCompatibilityDetail {
  femaleId: number;
  femaleIdentification: string;
  femaleCategory?: string | null;
  femaleFx: number; // Mother's own inbreeding
  projectedFx: number; // Offspring inbreeding with this bull
  risk: InbreedingRisk;
  riskLabel: string;
  commonAncestors: string[];
  isPureExogamous: boolean; // projectedFx === 0.0
}

export interface RescueBullEvaluation {
  bull: Caravan;
  is100PercentRescue: boolean; // 100% compatible with ALL selected females (Fx = 0.0%)
  compatibleCount: number;
  incompatibleCount: number;
  totalFemales: number;
  compatibilityPercentage: number;
  maxProjectedFx: number;
  avgProjectedFx: number;
  femaleDetails: FemaleCompatibilityDetail[];
}

export interface OutcrossingRescueAnalysisResult {
  totalFemales: number;
  totalAvailableBulls: number;
  pureRescueBulls: RescueBullEvaluation[];
  partialRescueBulls: RescueBullEvaluation[];
  incompatibleBulls: RescueBullEvaluation[];
}

/**
 * analyzeRescueSiresForFemales
 *
 * Evaluates all available bulls against a group of selected females to find
 * 100% Outcrossing Rescue Sires (Fx = 0.0% with all females, ensuring maximum heterosis).
 */
export function analyzeRescueSiresForFemales(
  femaleIds: number[],
  availableBulls: Caravan[],
  caravansMap: Map<number, Caravan>
): OutcrossingRescueAnalysisResult {
  const pureRescueBulls: RescueBullEvaluation[] = [];
  const partialRescueBulls: RescueBullEvaluation[] = [];
  const incompatibleBulls: RescueBullEvaluation[] = [];

  const validFemaleIds = femaleIds.filter((id) => caravansMap.has(id));

  for (const bull of availableBulls) {
    const details: FemaleCompatibilityDetail[] = [];
    let compatibleCount = 0;
    let totalProjectedFx = 0;
    let maxProjectedFx = 0;

    for (const femaleId of validFemaleIds) {
      const female = caravansMap.get(femaleId)!;
      
      // Calculate mother's own inbreeding
      const motherInbreeding = calculateWrightInbreeding(
        female.lineage?.mother_id,
        female.lineage?.father_id,
        caravansMap
      );

      // Calculate projected offspring inbreeding between this female and this bull
      const matingInbreeding = calculateWrightInbreeding(female.id, bull.id, caravansMap);
      const { risk, label: riskLabel } = classifyInbreedingRisk(matingInbreeding.fx);
      const isPureExogamous = matingInbreeding.fx === 0.0;

      if (isPureExogamous) {
        compatibleCount++;
      }

      totalProjectedFx += matingInbreeding.fx;
      if (matingInbreeding.fx > maxProjectedFx) {
        maxProjectedFx = matingInbreeding.fx;
      }

      details.push({
        femaleId: female.id,
        femaleIdentification: female.identification,
        femaleCategory: female.category,
        femaleFx: motherInbreeding.fx,
        projectedFx: matingInbreeding.fx,
        risk,
        riskLabel,
        commonAncestors: matingInbreeding.commonAncestors,
        isPureExogamous,
      });
    }

    const totalFemales = validFemaleIds.length;
    const avgProjectedFx = totalFemales > 0 ? Math.round((totalProjectedFx / totalFemales) * 100) / 100 : 0;
    const compatibilityPercentage = totalFemales > 0 ? Math.round((compatibleCount / totalFemales) * 100) : 0;
    const is100PercentRescue = totalFemales > 0 && compatibleCount === totalFemales;

    const evaluation: RescueBullEvaluation = {
      bull,
      is100PercentRescue,
      compatibleCount,
      incompatibleCount: totalFemales - compatibleCount,
      totalFemales,
      compatibilityPercentage,
      maxProjectedFx,
      avgProjectedFx,
      femaleDetails: details,
    };

    if (is100PercentRescue) {
      pureRescueBulls.push(evaluation);
    } else if (compatibilityPercentage >= 50) {
      partialRescueBulls.push(evaluation);
    } else {
      incompatibleBulls.push(evaluation);
    }
  }

  // Sort pure rescue bulls alphabetically by identification
  pureRescueBulls.sort((a, b) => a.bull.identification.localeCompare(b.bull.identification));
  // Sort partial rescue bulls by highest compatibility percentage
  partialRescueBulls.sort((a, b) => b.compatibilityPercentage - a.compatibilityPercentage);
  // Sort incompatible bulls by lowest max projected Fx
  incompatibleBulls.sort((a, b) => a.maxProjectedFx - b.maxProjectedFx);

  return {
    totalFemales: validFemaleIds.length,
    totalAvailableBulls: availableBulls.length,
    pureRescueBulls,
    partialRescueBulls,
    incompatibleBulls,
  };
}
