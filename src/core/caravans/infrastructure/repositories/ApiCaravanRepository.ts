import axiosInstance from '@/utils/axios';
import { Caravan, CreateCaravanRequest, RegisterBirthDTO } from '../../domain/entities/Caravan';
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
  async findAll(companyId?: number, scope?: 'own' | 'external' | 'all'): Promise<Caravan[]> {
    const headers: Record<string, string> = {};
    if (companyId) {
      headers['X-Company-ID'] = companyId.toString();
    }
    const params: Record<string, string> = {};
    if (scope) {
      params['scope'] = scope;
    }
    const response = await axiosInstance.get<any>('/caravans', { headers, params });
    const rawList = Array.isArray(response.data) ? response.data : (response.data?.data ?? []);
    return rawList.map(CaravanMapper.toDomain);
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

  async bulkRegisterBirth(births: RegisterBirthDTO[]): Promise<void> {
    await axiosInstance.post('/caravans/bulk-birth', { births });
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

  async getPedigree(id: number): Promise<any> {
    const response = await axiosInstance.get(`/caravans/${id}/pedigree`);
    return response.data;
  }

  async findById(id: number): Promise<Caravan> {
    const response = await axiosInstance.get<{ data: any }>(`/caravans/${id}`);
    return CaravanMapper.toDomain(response.data.data);
  }

  async findSummary(params: {
    companyId?: number;
    scope?: 'own' | 'external' | 'all';
    batchId?: number | string;
    search?: string;
    sex?: 'M' | 'H' | 'ALL';
    page?: number;
    perPage?: number;
  }): Promise<{
    data: any[];
    meta: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  }> {
    const headers: Record<string, string> = {};
    if (params.companyId) {
      headers['X-Company-ID'] = params.companyId.toString();
    }
    const queryParams: Record<string, any> = {};
    if (params.scope) queryParams.scope = params.scope;
    if (params.batchId !== undefined && params.batchId !== '') queryParams.batch_id = params.batchId;
    if (params.search) queryParams.search = params.search;
    if (params.sex && params.sex !== 'ALL') queryParams.sex = params.sex;
    if (params.page) queryParams.page = params.page;
    if (params.perPage) queryParams.per_page = params.perPage;

    const response = await axiosInstance.get<any>('/caravans/summary', {
      headers,
      params: queryParams,
    });

    return {
      data: response.data.data || [],
      meta: response.data.meta || {
        current_page: 1,
        last_page: 1,
        per_page: params.perPage || 25,
        total: (response.data.data || []).length,
      },
    };
  }
}
