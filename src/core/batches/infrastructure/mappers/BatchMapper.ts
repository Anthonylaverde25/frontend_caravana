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
      activity_id: raw.activity_id,
      activity_name: raw.activity_name,
      batch_type_id: raw.batch_type_id,
      batch_type_name: raw.batch_type_name,
      batch_type_code: raw.batch_type_code,
      weight: raw.weight,
      current_weight: raw.current_weight,
      min_weight: raw.min_weight,
      max_weight: raw.max_weight,
      knows_to_eat: raw.knows_to_eat,
      age_in_months: raw.age_in_months,
      observaciones: raw.observaciones,
      is_active: raw.is_active !== undefined ? Boolean(raw.is_active) : true,
      is_service_batch: raw.is_service_batch ?? raw.batch_type_code === 'SERVICE',
      service_detail: raw.service_detail ?? null,
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
      activity_id: entity.activity_id,
      activity_name: entity.activity_name,
      batch_type_id: entity.batch_type_id,
      batch_type_name: entity.batch_type_name,
      batch_type_code: entity.batch_type_code,
      weight: entity.weight,
      current_weight: entity.current_weight,
      min_weight: entity.min_weight,
      max_weight: entity.max_weight,
      knows_to_eat: entity.knows_to_eat,
      age_in_months: entity.age_in_months,
      observaciones: entity.observaciones,
      is_active: entity.is_active,
      is_service_batch: entity.is_service_batch,
      service_detail: entity.service_detail,
      created_at: entity.created_at,
    };
  }
}
