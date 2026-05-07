import axiosInstance from '@/lib/axiosInstance';
import { Batch, CreateBatchRequest } from '../../domain/entities/Batch';
import { IBatchRepository } from '../../domain/repositories/IBatchRepository';
import { BatchMapper } from '../mappers/BatchMapper';

export class ApiBatchRepository implements IBatchRepository {
  async findAll(farmId?: number): Promise<Batch[]> {
    const params = farmId ? { farm_id: farmId } : {};
    const response = await axiosInstance.get<any[]>('/batches', { params });
    // Map raw DTOs to Rich Entities
    return response.data.map(BatchMapper.toDomain);
  }

  async create(batch: Batch): Promise<Batch> {
    const dto = BatchMapper.toDTO(batch);
    const response = await axiosInstance.post<any>('/batches', dto);
    return BatchMapper.toDomain(response.data);
  }
}
