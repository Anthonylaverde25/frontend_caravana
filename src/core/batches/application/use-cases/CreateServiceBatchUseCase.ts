import { Batch, CreateServiceBatchRequest } from '../../domain/entities/Batch';
import { IBatchRepository } from '../../domain/repositories/IBatchRepository';

export class CreateServiceBatchUseCase {
  constructor(private readonly repository: IBatchRepository) {}

  async execute(request: CreateServiceBatchRequest): Promise<Batch> {
    return this.repository.createServiceBatch(request);
  }
}
