import { ICaravanRepository } from '../../domain/repositories/ICaravanRepository';

/**
 * DeleteCaravanUseCase
 * Permanently removes a caravan record from the active company's dataset.
 */
export class DeleteCaravanUseCase {
  constructor(private readonly caravanRepository: ICaravanRepository) {}

  async execute(id: number): Promise<void> {
    return this.caravanRepository.delete(id);
  }
}
