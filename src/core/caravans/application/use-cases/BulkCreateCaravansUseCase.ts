import { CreateCaravanRequest } from '../../domain/entities/Caravan';
import { ICaravanRepository } from '../../domain/repositories/ICaravanRepository';

/**
 * BulkCreateCaravansUseCase
 * Application layer orchestrator for mass caravan entry.
 */
export class BulkCreateCaravansUseCase {
  constructor(private caravanRepository: ICaravanRepository) {}

  async execute(caravans: CreateCaravanRequest[]): Promise<{ warnings: string[] }> {
    // Basic validation could be added here if needed across all items
    if (!caravans || caravans.length === 0) {
      return { warnings: [] };
    }

    return this.caravanRepository.bulkUpsert(caravans);
  }
}
