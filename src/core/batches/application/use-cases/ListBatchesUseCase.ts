import { IBatchRepository } from '../../domain/repositories/IBatchRepository';
import { Batch } from '../../domain/entities/Batch';

export class ListBatchesUseCase {
  constructor(private batchRepository: IBatchRepository) {}

  async execute(farmId?: number): Promise<Batch[]> {
    return this.batchRepository.findAll(farmId);
  }
}
