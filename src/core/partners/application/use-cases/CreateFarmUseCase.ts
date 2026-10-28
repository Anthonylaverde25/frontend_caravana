import { Farm } from '../../domain/entities/Farm';
import { IFarmRepository } from '../../domain/repositories/IFarmRepository';

export class CreateFarmUseCase {
  constructor(private repository: IFarmRepository) {}

  async execute(farmData: any): Promise<Farm> {
    // Domain Validation
    const farmEntity = Farm.create(farmData);
    
    return this.repository.create(farmEntity);
  }
}
