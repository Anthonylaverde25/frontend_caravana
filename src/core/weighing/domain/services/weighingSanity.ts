import { WeighingTypeCode } from '../entities/Weighing';

/**
 * Soft checks for a weight typed by hand. They never block: a strange weight is usually a typo or
 * a misread scale, but it can be real, and the person entering it decides.
 *
 * Kept in step with App\Core\Services\WeighingSanityPolicy: same limits and same daily rates.
 */
export const WEIGHT_SANITY = {
  MIN_PHYSICAL_KG: 15,
  MAX_PHYSICAL_KG: 1200,
  MAX_BIRTH_KG: 65,
  /** Above this daily gain since the last weighing the reading is suspicious. */
  MAX_DAILY_GAIN_KG: 2.5,
  /** Below this daily change (a loss) the reading is suspicious. */
  MIN_DAILY_GAIN_KG: -1.5,
} as const;

export interface PreviousWeight {
  weight: number;
  date: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

const kg = (value: number) => `${value.toLocaleString('es-AR', { maximumFractionDigits: 1 })} kg`;

const formatDate = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
};

/** Returns the warnings for a weight, most important first. An empty list means nothing odd. */
export function weighingWarnings(
  weight: number,
  date: string,
  type?: WeighingTypeCode,
  previous?: PreviousWeight | null
): string[] {
  if (!Number.isFinite(weight) || weight <= 0) {
    return [];
  }

  const warnings: string[] = [];

  if (weight < WEIGHT_SANITY.MIN_PHYSICAL_KG || weight > WEIGHT_SANITY.MAX_PHYSICAL_KG) {
    warnings.push(
      `${kg(weight)} está fuera de lo posible para un bovino (${WEIGHT_SANITY.MIN_PHYSICAL_KG} a ${WEIGHT_SANITY.MAX_PHYSICAL_KG} kg). Revisá la balanza o el tipeo.`
    );
  }

  if (type === 'BIRTH' && weight > WEIGHT_SANITY.MAX_BIRTH_KG) {
    warnings.push(`${kg(weight)} es muy alto para un peso al nacer (más de ${WEIGHT_SANITY.MAX_BIRTH_KG} kg).`);
  }

  if (previous) {
    const days = Math.round((Date.parse(date) - Date.parse(previous.date)) / DAY_MS);

    if (days > 0) {
      const dailyChange = (weight - previous.weight) / days;

      if (dailyChange > WEIGHT_SANITY.MAX_DAILY_GAIN_KG || dailyChange < WEIGHT_SANITY.MIN_DAILY_GAIN_KG) {
        const sign = dailyChange > 0 ? '+' : '';
        warnings.push(
          `Pesó ${kg(previous.weight)} el ${formatDate(previous.date)} y ahora ${kg(weight)}: ${sign}${dailyChange.toFixed(1)} kg/día. Revisá la lectura.`
        );
      }
    }
  }

  return warnings;
}
