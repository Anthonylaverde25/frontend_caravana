import { Farm } from '../entities/Farm';

export interface IFarmRepository {
  findAll(providerId?: number): Promise<Farm[]>;
  create(farm: Partial<Farm>): Promise<Farm>;
}
