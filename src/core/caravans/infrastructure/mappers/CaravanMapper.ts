import { Caravan, CaravanDTO } from '../../domain/entities/Caravan';

/**
 * CaravanMapper
 * Translates between raw API payloads (from CaravanResource.php) and the Rich Domain Entity.
 */
export class CaravanMapper {
  /**
   * Converts a raw JSON object from the API into a Caravan Rich Entity.
   */
  public static toDomain(raw: any): Caravan {
    const dto: CaravanDTO = {
      id: raw.id,
      identification: raw.identification,
      category: raw.category ?? null,
      teeth: Number(raw.teeth ?? 0),
      entry_weight: raw.entry_weight != null ? Number(raw.entry_weight) : null,
      exit_weight: raw.exit_weight != null ? Number(raw.exit_weight) : null,
      breed: raw.breed ?? null,
      sex: raw.sex ?? null,
      entry_date: raw.entry_date ?? null,
      batch_id: raw.batch?.id != null ? Number(raw.batch.id) : (raw.batch_id != null ? Number(raw.batch_id) : null),
      batch: raw.batch ? {
        id: Number(raw.batch.id),
        name: raw.batch.name
      } : null,
      current_weight: raw.current_weight != null ? Number(raw.current_weight) : null,
    };

    return Caravan.create(dto);
  }

  /**
   * Converts a Caravan Rich Entity back into a plain DTO for serialization.
   */
  public static toDTO(entity: Caravan): CaravanDTO {
    return {
      id: entity.id,
      identification: entity.identification,
      category: entity.category,
      teeth: entity.teeth,
      entry_weight: entity.entry_weight,
      exit_weight: entity.exit_weight,
      breed: entity.breed,
      sex: entity.sex,
      entry_date: entity.entry_date,
      batch_id: entity.batch_id,
      current_weight: entity.current_weight,
    };
  }
}
