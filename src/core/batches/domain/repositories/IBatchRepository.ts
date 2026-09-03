import { Batch, CreateBatchRequest, CreateServiceBatchRequest } from '../entities/Batch';

export interface IBatchRepository {
  findAll(farmId?: number, batchType?: string, scope?: 'own' | 'external' | 'all'): Promise<Batch[]>;
  findById(id: number): Promise<Batch>;
  create(batch: Batch): Promise<Batch>;
  createServiceBatch(request: CreateServiceBatchRequest): Promise<Batch>;
  changeActivity(id: number, activityId: number, weight?: number): Promise<Batch>;
  getWeightHistory(id: number): Promise<any[]>;
}
