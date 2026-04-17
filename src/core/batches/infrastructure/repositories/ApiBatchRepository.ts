import axiosInstance from '@/lib/axiosInstance';
import { Batch, CreateBatchRequest } from '../../domain/entities/Batch';
import { IBatchRepository } from '../../domain/repositories/IBatchRepository';

export class ApiBatchRepository implements IBatchRepository {
  async findAll(farmId?: number): Promise<Batch[]> {
    const params = farmId ? { farm_id: farmId } : {};
    const response = await axiosInstance.get<Batch[]>('/batches', { params });
    return response.data;
  }

  async create(request: CreateBatchRequest): Promise<Batch> {
    const response = await axiosInstance.post<Batch>('/batches', request);
    return response.data;
  }
}
