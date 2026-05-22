import { IBatchTypeRepository } from '../../domain/repositories/IBatchTypeRepository';
import { BatchType } from '../../domain/entities/BatchType';

export class ListBatchTypesUseCase {
  constructor(private batchTypeRepository: IBatchTypeRepository) {}

  async execute(): Promise<BatchType[]> {
    return this.batchTypeRepository.findAll();
  }
}
