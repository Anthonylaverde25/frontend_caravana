import axiosInstance from '@/utils/axios';
import { BatchType } from '../../domain/entities/BatchType';
import { IBatchTypeRepository } from '../../domain/repositories/IBatchTypeRepository';

export class ApiBatchTypeRepository implements IBatchTypeRepository {
  async findAll(): Promise<BatchType[]> {
    const response = await axiosInstance.get<BatchType[]>('/batch-types');
    console.log('API response data:', response.data);
    return response.data;
  }
}
