import axiosInstance from '@/utils/axios';
import { Farm } from '../../domain/entities/Farm';
import { IFarmRepository } from '../../domain/repositories/IFarmRepository';
import { FarmMapper } from '../mappers/FarmMapper';

export class ApiFarmRepository implements IFarmRepository {
  async findAll(providerId?: number): Promise<Farm[]> {
    const params = providerId ? { provider_id: providerId } : {};
    const response = await axiosInstance.get<any[]>('/farms', { params });
    return response.data.map(FarmMapper.toDomain);
  }

  async findById(id: number): Promise<Farm | null> {
    const response = await axiosInstance.get<any>(`/farms/${id}`);
    return FarmMapper.toDomain(response.data);
  }

  async create(farm: Farm): Promise<Farm> {
    const dto = FarmMapper.toDTO(farm);
    const response = await axiosInstance.post<any>('/farms', dto);
    return FarmMapper.toDomain(response.data);
  }
}
