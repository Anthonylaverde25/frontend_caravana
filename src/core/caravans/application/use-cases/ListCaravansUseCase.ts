import { ICaravanRepository } from '../../domain/repositories/ICaravanRepository';
import { Caravan } from '../../domain/entities/Caravan';

/**
 * ListCaravansUseCase
 * Retrieves all caravans for the currently active company.
 * The company filter is applied at the infrastructure level via the X-Company-ID header.
 */
export class ListCaravansUseCase {
  constructor(private readonly caravanRepository: ICaravanRepository) {}

  async execute(companyId?: number): Promise<Caravan[]> {
    return this.caravanRepository.findAll(companyId);
  }
}
