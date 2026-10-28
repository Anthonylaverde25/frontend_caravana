import { Farm } from '../entities/Farm';

export interface IFarmRepository {
  findAll(providerId?: number): Promise<Farm[]>;
  findById(id: number): Promise<Farm | null>;
  create(farm: Farm): Promise<Farm>;
}
