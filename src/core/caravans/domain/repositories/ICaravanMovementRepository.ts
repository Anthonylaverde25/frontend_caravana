import { CaravanMovement } from '../entities/CaravanMovement';

export interface ICaravanMovementRepository {
  findByCaravanId(caravanId: number): Promise<CaravanMovement[]>;
}
