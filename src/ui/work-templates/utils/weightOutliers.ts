/**
 * The weights of a sheet that stand far from the rest of the same troop, shown on the review
 * screen BEFORE confirming: the person reviewing is the one who decides whether 1850 was a typo.
 *
 * Mirror of `TroopWeightOutlierDetector` on the server — same factor, same minimum sample, same
 * median — so the screen warns about exactly what the result will record.
 */
export const OUTLIER_FACTOR = 2;
export const OUTLIER_MIN_SAMPLE = 3;

export interface WeightOutlier {
  weight: number;
  median: number;
  above: boolean;
}

/** The weight written in a cell, as a number; null when blank or not a number. */
export const parseWeight = (raw: string): number | null => {
  const text = raw.trim().replace(',', '.');

  if (text === '') return null;

  const value = Number(text);

  return Number.isFinite(value) ? value : null;
};

const median = (values: number[]): number => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

/**
 * @param weightsById the parsed weight of each row, null when it has none
 * @returns only the rows out of place, by id
 */
export const weightOutliers = (weightsById: Record<string, number | null>): Record<string, WeightOutlier> => {
  const positive = Object.entries(weightsById).filter((entry): entry is [string, number] => entry[1] !== null && entry[1] > 0);

  if (positive.length < OUTLIER_MIN_SAMPLE) return {};

  const reference = median(positive.map(([, weight]) => weight));
  const outliers: Record<string, WeightOutlier> = {};

  positive.forEach(([id, weight]) => {
    if (weight > reference * OUTLIER_FACTOR || weight < reference / OUTLIER_FACTOR) {
      outliers[id] = { weight, median: reference, above: weight > reference };
    }
  });

  return outliers;
};

/** "1.850" / "180,8": the same rendering the server uses in its warning. */
export const formatKilos = (value: number): string =>
  value.toLocaleString('es-AR', { maximumFractionDigits: 1 });

/** What the review screen itself sees in a weight, before the server is asked. */
export interface WeightIssue {
  severity: 'error' | 'warning';
  message: string;
}

/**
 * The weight problems of every animal row, by id: zero or less is an error (it never is a weight),
 * far from the troop is a warning (it may be a typo, the reviewer decides).
 */
export const reviewWeightIssues = (rows: { id: string; caravana: string; peso: string }[]): Record<string, WeightIssue> => {
  const weightsById: Record<string, number | null> = {};
  rows
    .filter((row) => row.caravana.trim() !== '')
    .forEach((row) => {
      weightsById[row.id] = parseWeight(row.peso);
    });

  const issues: Record<string, WeightIssue> = {};
  Object.entries(weightsById).forEach(([id, weight]) => {
    if (weight !== null && weight <= 0) {
      issues[id] = { severity: 'error', message: 'El peso tiene que ser mayor a cero. Corríjalo o déjelo vacío si no se pesó.' };
    }
  });
  Object.entries(weightOutliers(weightsById)).forEach(([id, outlier]) => {
    issues[id] = {
      severity: 'warning',
      message: `${formatKilos(outlier.weight)} kg está muy ${outlier.above ? 'por encima' : 'por debajo'} del resto de la tropa (mediana ${formatKilos(outlier.median)} kg). Revise el número antes de confirmar.`,
    };
  });

  return issues;
};
