import type { DestinationSexScope, EntryOrderDestinationPayload, SexComposition } from '@/features/entry-orders/types';

/**
 * Where the animals of a purchase go, by category line and sex — the same rules the server applies
 * (EntryDestinationPlan). An animal goes to the rule of its sex, else to the rule of its whole line,
 * else to the transit batch. A line is split by sex only when its category admits both sexes and
 * the troop brings both.
 */

export type CategorySex = 'M' | 'H' | 'BOTH';
export type AnimalSexCode = 'M' | 'H';

/** A category line of the form, as the distribution needs it. */
export interface DistributionLine {
  /** 1, 2, 3…: the number printed on the order. */
  position: number;
  categoryName: string;
  /** Null while the catalogue is loading. */
  categorySex: CategorySex | null;
  headCount: number | null;
}

export type DestinationRule = EntryOrderDestinationPayload;

export const SEX_SCOPE_WORD: Record<DestinationSexScope, string | null> = { ALL: null, M: 'machos', H: 'hembras' };

export const splittable = (line: DistributionLine, composition: SexComposition | null | undefined): boolean =>
  line.categorySex === 'BOTH' && composition !== 'MALE' && composition !== 'FEMALE';

/** The sexes an animal of this line can have in this troop. */
export const possibleSexes = (
  line: DistributionLine,
  composition: SexComposition | null | undefined
): AnimalSexCode[] => {
  const bySex: AnimalSexCode[] = composition === 'MALE' ? ['M'] : composition === 'FEMALE' ? ['H'] : ['M', 'H'];

  return line.categorySex == null || line.categorySex === 'BOTH'
    ? bySex
    : bySex.filter((sex) => sex === line.categorySex);
};

export const batchFor = (rules: DestinationRule[], position: number, sex: AnimalSexCode): number | null =>
  rules.find((r) => r.category_position === position && r.sex_scope === sex)?.destination_batch_id ??
  rules.find((r) => r.category_position === position && r.sex_scope === 'ALL')?.destination_batch_id ??
  null;

/** The (line, sex) pairs no rule takes: they go to the transit batch. */
export const uncovered = (
  lines: DistributionLine[],
  composition: SexComposition | null | undefined,
  rules: DestinationRule[]
): { position: number; sex: AnimalSexCode }[] =>
  lines.flatMap((line) =>
    possibleSexes(line, composition)
      .filter((sex) => batchFor(rules, line.position, sex) == null)
      .map((sex) => ({ position: line.position, sex }))
  );

/** Whether some animal goes to the transit batch, so it needs a name. A troop without lines does. */
export const needsTransitBatch = (
  lines: DistributionLine[],
  composition: SexComposition | null | undefined,
  rules: DestinationRule[]
): boolean => lines.length === 0 || uncovered(lines, composition, rules).length > 0;

/** "Mismo lote para toda la tropa": one rule per line, to the same batch. */
export const rulesForSameBatch = (lines: DistributionLine[], batchId: number | null): DestinationRule[] =>
  batchId == null
    ? []
    : lines.map((line) => ({ category_position: line.position, sex_scope: 'ALL', destination_batch_id: batchId }));

/**
 * The rules kept after the troop changed: those of a line that is gone are dropped, and a rule per
 * sex of a line that can no longer be split becomes the rule of the whole line when its sex is the
 * only one left. Returns how many were dropped, to tell the user.
 */
export const adjustRules = (
  rules: DestinationRule[],
  lines: DistributionLine[],
  composition: SexComposition | null | undefined
): { rules: DestinationRule[]; dropped: number } => {
  const kept: DestinationRule[] = [];
  let dropped = 0;

  rules.forEach((rule) => {
    const line = lines.find((l) => l.position === rule.category_position);

    if (!line) {
      dropped++;
      return;
    }

    if (rule.sex_scope === 'ALL' || splittable(line, composition)) {
      kept.push(rule);
      return;
    }

    const possible = possibleSexes(line, composition);
    const lineTaken = kept.some((k) => k.category_position === rule.category_position);

    if (possible.length === 1 && possible[0] === rule.sex_scope && !lineTaken)
      kept.push({ ...rule, sex_scope: 'ALL' });
    else dropped++;
  });

  return { rules: kept, dropped };
};

/** "Ternero · machos", or the category alone for the whole line. */
export const ruleLabel = (line: DistributionLine | undefined, scope: DestinationSexScope): string => {
  const name = line?.categoryName ?? 'Categoría';
  const word = SEX_SCOPE_WORD[scope];

  return word ? `${name} · ${word}` : name;
};

/** How the form shows the destinations of an order: one batch for all, distributed, or none. */
export const modeOf = (rules: DestinationRule[], lineCount: number): 'SAME' | 'DISTRIBUTE' | 'LATER' => {
  if (rules.length === 0) return 'LATER';

  const batches = new Set(rules.map((r) => r.destination_batch_id));
  const wholeLines = rules.every((r) => r.sex_scope === 'ALL');

  return batches.size === 1 && wholeLines && rules.length === lineCount ? 'SAME' : 'DISTRIBUTE';
};
