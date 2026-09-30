import type { SireDTO } from '@/core/caravans/domain/entities/Caravan';
import type { BirthFieldPayload, BirthOrderAnimal, BirthOutcome, BirthRowError } from '@/features/birth-orders/types';

/** One pregnant female as the grid shows her: who she is, when she is due and who may be the sire. */
export interface BirthRollFemale {
  caravanId: number;
  identification: string;
  categoryLabel: string | null;
  batchName: string | null;
  dueDate: string | null;
  stage: string | null;
  sires: SireDTO[];
}

/** What the screen declares for one female. Empty strings are "not said". */
export interface BirthRollValue {
  outcome: BirthOutcome | '';
  calfIdentification: string;
  calfSex: 'M' | 'H' | '';
  calfWeight: string;
  calfBreedId: number | '';
  calfTeeth: string;
  /** Empty: the gestation's single or confirmed sire, or "Sires pendientes". */
  fatherId: number | '';
  birthDate: string;
  observations: string;
}

export type BirthRollField = keyof BirthRollValue;

/** A problem of one row, pointing at a cell when the server said which. */
export interface BirthCellError {
  field: BirthRollField | 'mother' | null;
  message: string;
}

export const emptyBirthValue = (): BirthRollValue => ({
  outcome: '',
  calfIdentification: '',
  calfSex: '',
  calfWeight: '',
  calfBreedId: '',
  // A newborn has no permanent teeth: 0 unless someone says otherwise.
  calfTeeth: '0',
  fatherId: '',
  birthDate: '',
  observations: ''
});

export const femaleFromOrderAnimal = (animal: BirthOrderAnimal): BirthRollFemale => ({
  caravanId: animal.caravan_id,
  identification: animal.identification ?? `#${animal.caravan_id}`,
  categoryLabel: animal.category_label,
  batchName: animal.current_batch_name ?? animal.source_batch_name,
  dueDate: animal.estimated_due_date,
  stage: animal.gestation_stage,
  sires: animal.sires
});

/** The sire the system uses when none is chosen: the confirmed one, or the only candidate. */
export const suggestedSire = (sires: SireDTO[]): SireDTO | null =>
  sires.find((s) => s.is_confirmed) ?? (sires.length === 1 ? sires[0] : null);

const numberOrNull = (value: string): number | null => (value.trim() === '' ? null : Number(value));

export const toBirthFieldPayload = (female: BirthRollFemale, value: BirthRollValue): BirthFieldPayload => {
  const live = value.outcome === 'LIVE';

  return {
    caravan_id: female.caravanId,
    outcome: value.outcome === '' ? null : value.outcome,
    calf_identification: live ? value.calfIdentification.trim() || null : null,
    calf_sex: live && value.calfSex !== '' ? value.calfSex : null,
    calf_weight: live ? numberOrNull(value.calfWeight) : null,
    calf_breed_id: live && value.calfBreedId !== '' ? value.calfBreedId : null,
    calf_teeth: live ? (numberOrNull(value.calfTeeth) ?? 0) : null,
    father_id: live && value.fatherId !== '' ? value.fatherId : null,
    birth_date: value.birthDate || null,
    observations: value.observations.trim() || null
  };
};

/** What still blocks sending one row: said in plain words, before the server says it per cell. */
export const rowProblem = (value: BirthRollValue): string | null => {
  if (value.outcome === '') return null;
  if (!value.birthDate) return 'falta la fecha';
  if (value.outcome !== 'LIVE') return null;
  if (!value.calfIdentification.trim()) return 'falta la caravana de la cría';
  if (value.calfSex === '') return 'falta el sexo de la cría';
  if (value.calfWeight.trim() !== '' && !(Number(value.calfWeight) > 0)) return 'el peso tiene que ser mayor a cero';

  return null;
};

const FIELD_BY_SERVER: Record<string, BirthCellError['field']> = {
  caravana_madre: 'mother',
  resultado: 'outcome',
  caravana_cria: 'calfIdentification',
  sexo: 'calfSex',
  peso: 'calfWeight',
  raza: 'calfBreedId',
  dientes: 'calfTeeth',
  father_id: 'fatherId',
  fecha_nacimiento: 'birthDate'
};

/** The row errors of a PAR-01 422, by the mother's caravan id. */
export const cellErrorsByFemale = (rowErrors: BirthRowError[], females: BirthRollFemale[]): Record<number, BirthCellError[]> => {
  const idByTag = new Map(females.map((f) => [f.identification.toUpperCase(), f.caravanId]));
  const result: Record<number, BirthCellError[]> = {};

  rowErrors.forEach((row) => {
    const id = idByTag.get(row.caravana_madre.toUpperCase());

    if (id == null) return;

    result[id] = row.errors.map((e) => ({ field: e.field ? (FIELD_BY_SERVER[e.field] ?? null) : null, message: e.message }));
  });

  return result;
};
