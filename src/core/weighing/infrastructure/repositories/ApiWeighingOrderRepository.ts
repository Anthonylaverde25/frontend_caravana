import axiosInstance from '@/utils/axios';
import { RegisterBatchWeighingPayload, WeighingOrder } from '../../domain/entities/Weighing';

export class ApiWeighingOrderRepository {
  async registerBatchWeighing(payload: RegisterBatchWeighingPayload): Promise<WeighingOrder> {
    const response = await axiosInstance.post<WeighingOrder>('/weighing-orders/register-batch', payload);
    return response.data;
  }

  async listByBatch(batchId: number): Promise<WeighingOrder[]> {
    const response = await axiosInstance.get<WeighingOrder[]>(`/batches/${batchId}/weighing-orders`);
    return response.data;
  }
}
