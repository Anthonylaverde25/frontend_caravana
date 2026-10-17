import { WeighingType } from '../entities/Weighing';

export interface IWeighingTypeRepository {
  findAll(onlyActive?: boolean): Promise<WeighingType[]>;
  setActive(id: number, isActive: boolean): Promise<WeighingType>;
}
