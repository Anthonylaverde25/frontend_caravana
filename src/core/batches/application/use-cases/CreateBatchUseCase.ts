import { IBatchRepository } from '../../domain/repositories/IBatchRepository';
import { Batch, CreateBatchRequest } from '../../domain/entities/Batch';

export class CreateBatchUseCase {
  constructor(private batchRepository: IBatchRepository) {}

  async execute(request: CreateBatchRequest): Promise<Batch> {
    return this.batchRepository.create(request);
  }
}
