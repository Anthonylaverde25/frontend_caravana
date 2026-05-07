import { Batch, CreateBatchRequest } from '../entities/Batch';

export interface IBatchRepository {
  findAll(farmId?: number): Promise<Batch[]>;
  create(batch: Batch): Promise<Batch>;
}
