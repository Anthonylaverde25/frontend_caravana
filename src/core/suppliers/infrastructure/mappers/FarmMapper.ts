import { Farm, FarmDTO } from '../../domain/entities/Farm';

export class FarmMapper {
  public static toDomain(raw: any): Farm {
    const dto: FarmDTO = {
      id: raw.id,
      name: raw.name,
      renspa: raw.renspa,
      location: raw.location,
      provider_id: raw.provider_id,
      is_active: raw.is_active !== undefined ? Boolean(raw.is_active) : true,
      caravans_count: raw.caravans_count,
      batches: raw.batches, // In a real scenario, map these to Batch entities if needed using BatchMapper
      created_at: raw.created_at,
    };
    return Farm.create(dto);
  }

  public static toDTO(entity: Farm): FarmDTO {
    return {
      id: entity.id,
      name: entity.name,
      renspa: entity.renspa,
      location: entity.location,
      provider_id: entity.provider_id,
      is_active: entity.is_active,
      caravans_count: entity.caravans_count,
      batches: entity.batches,
      created_at: entity.created_at,
    };
  }
}
