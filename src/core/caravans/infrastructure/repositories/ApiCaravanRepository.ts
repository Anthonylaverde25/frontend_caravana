import axiosInstance from '@/utils/axios';
import { Caravan, CreateCaravanRequest } from '../../domain/entities/Caravan';
import { ICaravanRepository } from '../../domain/repositories/ICaravanRepository';
import { CaravanMapper } from '../mappers/CaravanMapper';

/**
 * ApiCaravanRepository
 * Infrastructure implementation of ICaravanRepository.
 * Communicates with the Laravel backend via Axios.
 * The X-Company-ID header is injected globally by CompanyContext,
 * which triggers the BelongsToCompany global scope on the backend.
 */
export class ApiCaravanRepository implements ICaravanRepository {
  async findAll(companyId?: number): Promise<Caravan[]> {
    const headers: Record<string, string> = {};
    if (companyId) {
      headers['X-Company-ID'] = companyId.toString();
    }
    const response = await axiosInstance.get<any[]>('/caravans', { headers });
    return response.data.map(CaravanMapper.toDomain);
  }

  async upsert(data: CreateCaravanRequest): Promise<{ action: string; id: number }> {
    const response = await axiosInstance.post<{ action: string; id: number }>(
      '/caravans',
      data,
    );

    return response.data;
  }

  async bulkUpsert(data: CreateCaravanRequest[]): Promise<void> {
    await axiosInstance.post('/caravans/bulk', { caravans: data });
  }

  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`/caravans/${id}`);
  }

  async getWeights(id: number): Promise<any[]> {
    const response = await axiosInstance.get<any[]>(`/caravans/${id}/weights`);
    return response.data;
  }

  async recordWeight(id: number, data: { weight: number; weighing_date: string; notes?: string }): Promise<void> {
    await axiosInstance.post(`/caravans/${id}/weights`, data);
  }

  async bulkRecordWeights(weights: any[]): Promise<void> {
    await axiosInstance.post('/caravans/bulk-weights', { weights });
  }
}
