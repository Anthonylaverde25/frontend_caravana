import { RegisterBirthDTO } from '../../domain/entities/Caravan';
import { ICaravanRepository } from '../../domain/repositories/ICaravanRepository';

/**
 * BulkRegisterBirthUseCase
 * Application layer orchestrator for bulk birth registrations.
 */
export class BulkRegisterBirthUseCase {
  constructor(private caravanRepository: ICaravanRepository) {}

  async execute(births: RegisterBirthDTO[]): Promise<void> {
    if (!births || births.length === 0) {
      return;
    }

    return this.caravanRepository.bulkRegisterBirth(births);
  }
}
