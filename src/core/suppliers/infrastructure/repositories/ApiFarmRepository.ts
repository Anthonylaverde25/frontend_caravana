import axiosInstance from '@/lib/axiosInstance';
import { Farm } from '../../domain/entities/Farm';
import { IFarmRepository } from '../../domain/repositories/IFarmRepository';

export class ApiFarmRepository implements IFarmRepository {
  async findAll(providerId?: number): Promise<Farm[]> {
    const params = providerId ? { provider_id: providerId } : {};
    const response = await axiosInstance.get<Farm[]>('/farms', { params });
    return response.data;
  }
}
