import { Batch, CreateBatchRequest } from '../entities/Batch';
import { BatchOverview } from '../entities/BatchOverview';

export interface IBatchRepository {
  findAll(farmId?: number, batchType?: string, scope?: 'own' | 'external' | 'all'): Promise<Batch[]>;
  findById(id: number): Promise<Batch>;
  create(batch: Batch): Promise<Batch>;
  changeActivity(id: number, activityId: number, weight?: number): Promise<Batch>;
  /** Management system (pen vs. pasture). Mutable, and not a livestock movement. */
  changeManagement(id: number, isConfined: boolean): Promise<Batch>;
  getWeightHistory(id: number): Promise<any[]>;
  /** Composition, reproductive state and alerts of the batch. */
  getOverview(id: number): Promise<BatchOverview>;
}
