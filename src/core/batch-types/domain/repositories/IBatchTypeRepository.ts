import { BatchType } from '../entities/BatchType';

export interface IBatchTypeRepository {
  findAll(): Promise<BatchType[]>;
}
