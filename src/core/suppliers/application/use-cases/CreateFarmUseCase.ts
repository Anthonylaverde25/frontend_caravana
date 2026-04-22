import { Farm } from '../../domain/entities/Farm';
import { IFarmRepository } from '../../domain/repositories/IFarmRepository';

export class CreateFarmUseCase {
  constructor(private repository: IFarmRepository) {}

  async execute(farm: Partial<Farm>): Promise<Farm> {
    return this.repository.create(farm);
  }
}
