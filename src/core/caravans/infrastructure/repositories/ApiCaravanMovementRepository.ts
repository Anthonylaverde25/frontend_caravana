import axiosInstance from '@/utils/axios';
import { CaravanMovement } from '../../domain/entities/CaravanMovement';
import { ICaravanMovementRepository } from '../../domain/repositories/ICaravanMovementRepository';
import { CaravanMovementMapper } from '../mappers/CaravanMovementMapper';

export class ApiCaravanMovementRepository implements ICaravanMovementRepository {
  async findByCaravanId(caravanId: number): Promise<CaravanMovement[]> {
    const response = await axiosInstance.get<any[]>(`/caravans/${caravanId}/movements`);
    return response.data.map(CaravanMovementMapper.toDomain);
  }
}
