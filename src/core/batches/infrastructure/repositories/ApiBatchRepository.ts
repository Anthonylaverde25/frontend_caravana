import axiosInstance from '@/utils/axios';
import { Batch, CreateBatchRequest } from '../../domain/entities/Batch';
import { IBatchRepository } from '../../domain/repositories/IBatchRepository';
import { BatchMapper } from '../mappers/BatchMapper';

export class ApiBatchRepository implements IBatchRepository {
  async findAll(farmId?: number, batchType?: string, scope?: 'own' | 'external' | 'all'): Promise<Batch[]> {
    const params: any = {};
    if (farmId) params.farm_id = farmId;
    if (batchType) params.batch_type = batchType;
    if (scope && scope !== 'all') params.scope = scope;
    const response = await axiosInstance.get<any>('/batches', { params });
    const rawList = Array.isArray(response.data) ? response.data : (response.data?.data ?? []);
    // Map raw DTOs to Rich Entities
    return rawList.map(BatchMapper.toDomain);
  }

  async findById(id: number): Promise<Batch> {
    const response = await axiosInstance.get<any>(`/batches/${id}`);
    return BatchMapper.toDomain(response.data);
  }

  async create(batch: Batch): Promise<Batch> {
    const dto = BatchMapper.toDTO(batch);
    const response = await axiosInstance.post<any>('/batches', dto);
    return BatchMapper.toDomain(response.data);
  }

  async createServiceBatch(request: any): Promise<Batch> {
    const response = await axiosInstance.post<any>('/batches/service', request);
    return BatchMapper.toDomain(response.data);
  }

  async changeActivity(id: number, activityId: number, weight?: number): Promise<Batch> {
    const response = await axiosInstance.patch<any>(`/batches/${id}/activity`, { 
      activity_id: activityId,
      weight: weight
    });
    return BatchMapper.toDomain(response.data);
  }

  async getWeightHistory(id: number): Promise<any[]> {
    const response = await axiosInstance.get<any[]>(`/batches/${id}/weights`);
    return response.data;
  }
}
