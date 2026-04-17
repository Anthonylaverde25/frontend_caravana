import { Batch, CreateBatchRequest } from '../entities/Batch';

export interface IBatchRepository {
  findAll(farmId?: number): Promise<Batch[]>;
  create(request: CreateBatchRequest): Promise<Batch>;
}
