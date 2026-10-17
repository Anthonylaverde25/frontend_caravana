import type { RegisterBirthsPayload } from '@/features/birth-orders/types';
import type { BirthRollFemale } from '../grid/birthRollTypes';
import type { BirthRollState } from '../grid/useBirthRollState';

/** Router state of the entry points: where "Registrar partos" was opened from. */
export interface RegisterBirthsEntryState {
  returnTo?: string;
}

/** "Registrar partos" of one batch, over Monitoreo Gestacional. */
export const registerBirthsPath = (batchId: number) => `/gestation/list/${batchId}/register-births`;

/** The data of the registration as a whole: the round is asked on the same screen as the calvings. */
export interface RegisterBirthsHeader {
  responsable: string;
  observations: string;
}

export const emptyRegisterHeader = (): RegisterBirthsHeader => ({ responsable: '', observations: '' });

export type BirthSheetFilter = 'pending' | 'stated' | 'all';
export type BirthStageFilter = 'ALL' | 'head' | 'body' | 'tail';

export const BIRTH_SHEET_FILTERS: BirthSheetFilter[] = ['pending', 'stated', 'all'];

export const BIRTH_SHEET_FILTER_LABELS: Record<BirthSheetFilter, string> = {
  pending: 'Sin resultado',
  stated: 'Con resultado',
  all: 'Todos'
};

export const BIRTH_STAGE_FILTER_LABELS: Record<BirthStageFilter, string> = {
  ALL: 'Todos los estadios',
  head: 'Cabeza',
  body: 'Cuerpo',
  tail: 'Cola'
};

export interface BirthSheetQuery {
  search: string;
  filter: BirthSheetFilter;
  stage: BirthStageFilter;
}

/** `stated`: the row declares something (an outcome). */
export function matchesSheetQuery(female: BirthRollFemale, query: BirthSheetQuery, stated: boolean): boolean {
  const term = query.search.trim().toLowerCase();

  return (
    (term === '' || female.identification.toLowerCase().includes(term)) &&
    (query.stage === 'ALL' || female.stage === query.stage) &&
    (query.filter === 'all' || (query.filter === 'stated') === stated)
  );
}

/**
 * Only the females with a result travel: the ones left empty did not calve yet, and a registration
 * leaves nothing pending. The order is created with exactly them, already executed.
 */
export const toRegisterPayload = (header: RegisterBirthsHeader, roll: BirthRollState): RegisterBirthsPayload => ({
  period_start: null,
  period_end: null,
  responsable: header.responsable.trim() || null,
  observations: header.observations.trim() || null,
  animals: roll.payload()
});
