import { CaravanWeightRecord, RecordCaravanWeightPayload } from '@/core/weighing/domain/entities/Weighing';
import { Caravan, CreateCaravanRequest, RegisterBirthDTO } from '../entities/Caravan';
import { CaravanSummaryPage, CaravanSummaryQuery } from '../entities/CaravanSummary';
import { TagCalvesPayload, UntaggedCalf } from '../entities/UntaggedCalf';
import { DeathBatchOption, DeathCause, RegisterDeathPayload } from '../entities/Death';

/**
 * ICaravanRepository
 * Domain contract — no dependency on HTTP or Eloquent.
 */
export interface ICaravanRepository {
  /** Retrieves all caravans for the active company (filtered by X-Company-ID header and scope). */
  findAll(companyId?: number, scope?: 'own' | 'external' | 'all'): Promise<Caravan[]>;

  /** Retrieves a single caravan by ID with full relational details. */
  findById(id: number): Promise<Caravan>;

  /** Retrieves paginated lightweight caravan summary for fast inventory display. */
  findSummary(params: CaravanSummaryQuery): Promise<CaravanSummaryPage>;


  /**
   * Creates or updates a caravan based on the identification field.
   * Mirrors the backend's Upsert strategy.
   */
  upsert(data: CreateCaravanRequest): Promise<{ action: string; id: number }>;

  /**
   * Mass upsert of multiple caravans.
   */
  bulkUpsert(data: CreateCaravanRequest[]): Promise<void>;

  /**
   * Registers multiple births (Bulk Birth).
   */
  bulkRegisterBirth(births: RegisterBirthDTO[]): Promise<void>;

  /** Removes a caravan record by its ID. */
  delete(id: number): Promise<void>;

  /** Retrieves the weight history for a caravan. */
  getWeights(id: number): Promise<CaravanWeightRecord[]>;

  /** Records a new weight for a caravan. */
  recordWeight(id: number, data: RecordCaravanWeightPayload): Promise<void>;

  /** Retrieves the 3G pedigree tree and inbreeding analysis for a caravan. */
  getPedigree(id: number): Promise<any>;

  /** The calves of a batch still waiting for their tag. */
  listUntaggedCalves(batchId: number): Promise<UntaggedCalf[]>;

  /** Puts the tags on calves born without one. Rejects with a 422 keyed by row on any error. */
  tagCalves(payload: TagCalvesPayload): Promise<void>;

  /** The active causes of death of the company. */
  listDeathCauses(): Promise<DeathCause[]>;

  /** The active death batches of the company. */
  listDeathBatches(): Promise<DeathBatchOption[]>;

  /** Registers the death of one or several animals. Rejects with a 422 keyed by animal on any error. */
  registerDeath(payload: RegisterDeathPayload): Promise<void>;
}
