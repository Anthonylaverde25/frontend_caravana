import { Caravan, CreateCaravanRequest } from '../entities/Caravan';

/**
 * ICaravanRepository
 * Domain contract — no dependency on HTTP or Eloquent.
 */
export interface ICaravanRepository {
  /** Retrieves all caravans for the active company (filtered by X-Company-ID header). */
  findAll(companyId?: number): Promise<Caravan[]>;

  /**
   * Creates or updates a caravan based on the identification field.
   * Mirrors the backend's Upsert strategy.
   */
  upsert(data: CreateCaravanRequest): Promise<{ action: string; id: number }>;

  /**
   * Mass upsert of multiple caravans.
   */
  bulkUpsert(data: CreateCaravanRequest[]): Promise<void>;

  /** Removes a caravan record by its ID. */
  delete(id: number): Promise<void>;

  /** Retrieves the weight history for a caravan. */
  getWeights(id: number): Promise<any[]>;

  /** Records a new weight for a caravan. */
  recordWeight(id: number, data: { weight: number; weighing_date: string; notes?: string }): Promise<void>;
}
