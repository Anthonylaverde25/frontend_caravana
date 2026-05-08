import { CaravanMovement } from '../../domain/entities/CaravanMovement';

export class CaravanMovementMapper {
  static toDomain(dto: any): CaravanMovement {
    return {
      id: dto.id,
      renspa: dto.renspa,
      type: dto.type,
      movementDate: dto.movement_date,
      observations: dto.observations,
    };
  }
}
