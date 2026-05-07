import { Batch, BatchDTO } from '../../domain/entities/Batch';

/**
 * BatchMapper
 * Translates data between the raw API DTO structure and the Rich Entity Class.
 */
export class BatchMapper {
  /**
   * Translates a raw JSON payload into a Batch Rich Entity.
   */
  public static toDomain(raw: any): Batch {
    const dto: BatchDTO = {
      id: raw.id,
      name: raw.name,
      farm_id: raw.farm_id,
      farm_name: raw.farm_name,
      provider_id: raw.provider_id,
      provider_name: raw.provider_name,
      observaciones: raw.observaciones,
      is_active: raw.is_active !== undefined ? Boolean(raw.is_active) : true,
      created_at: raw.created_at,
    };
    return Batch.create(dto);
  }

  /**
   * Translates a Batch Rich Entity back into a raw JSON DTO.
   */
  public static toDTO(entity: Batch): BatchDTO {
    return {
      id: entity.id,
      name: entity.name,
      farm_id: entity.farm_id,
      farm_name: entity.farm_name,
      provider_id: entity.provider_id,
      provider_name: entity.provider_name,
      observaciones: entity.observaciones,
      is_active: entity.is_active,
      created_at: entity.created_at,
    };
  }
}
