import { Batch } from '../../domain/entities/Batch';
import { IBatchRepository } from '../../domain/repositories/IBatchRepository';

export class GetBatchUseCase {
  constructor(private batchRepository: IBatchRepository) {}

  async execute(id: number): Promise<Batch> {
    return this.batchRepository.findById(id);
  }
}
