import axiosInstance from '@/utils/axios';
import { WeighingType } from '../../domain/entities/Weighing';
import { IWeighingTypeRepository } from '../../domain/repositories/IWeighingTypeRepository';

export class ApiWeighingTypeRepository implements IWeighingTypeRepository {
  async findAll(onlyActive = false): Promise<WeighingType[]> {
    const response = await axiosInstance.get<WeighingType[]>('/weighing-types', {
      params: onlyActive ? { only_active: 1 } : undefined,
    });
    return response.data;
  }

  async setActive(id: number, isActive: boolean): Promise<WeighingType> {
    const response = await axiosInstance.patch<WeighingType>(`/weighing-types/${id}/active`, { is_active: isActive });
    return response.data;
  }
}
