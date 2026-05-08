import { ICaravanRepository } from '../../domain/repositories/ICaravanRepository';
import { CreateCaravanRequest } from '../../domain/entities/Caravan';

/**
 * UpsertCaravanUseCase
 * Creates a new caravan or updates an existing one based on its identification.
 * Delegates to the backend's Upsert strategy.
 */
export class UpsertCaravanUseCase {
  constructor(private readonly caravanRepository: ICaravanRepository) {}

  async execute(data: CreateCaravanRequest): Promise<{ action: string; id: number }> {
    return this.caravanRepository.upsert(data);
  }
}
