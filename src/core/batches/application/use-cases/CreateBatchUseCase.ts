import { IBatchRepository } from '../../domain/repositories/IBatchRepository';
import { Batch, CreateBatchRequest } from '../../domain/entities/Batch';

export class CreateBatchUseCase {
  constructor(private batchRepository: IBatchRepository) {}

  async execute(request: any): Promise<Batch> {
    // Domain Validation
    const batchEntity = Batch.create(request);
    
    return this.batchRepository.create(batchEntity);
  }
}
