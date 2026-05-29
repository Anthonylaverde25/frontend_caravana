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
      female_details: raw.female_details ? {
        is_empty: Boolean(raw.female_details.is_empty),
        arrival_category: raw.female_details.arrival_category,
      } : null,
      active_gestation: raw.active_gestation ? {
        id: raw.active_gestation.id ? Number(raw.active_gestation.id) : undefined,
        start_date: raw.active_gestation.start_date,
        estimated_due_date: raw.active_gestation.estimated_due_date,
        gestation_stage: raw.active_gestation.gestation_stage,
        gestation_months: Number(raw.active_gestation.gestation_months),
        is_current: Boolean(raw.active_gestation.is_current),
        notes: raw.active_gestation.notes,
        sires: raw.active_gestation.sires ? raw.active_gestation.sires.map((s: any) => ({
          id: Number(s.id),
          identification: s.identification,
          is_confirmed: Boolean(s.is_confirmed)
        })) : []
      } : null,
      lineage: raw.lineage ? {
        mother_id: raw.lineage.mother_id ? Number(raw.lineage.mother_id) : null,
        mother_identification: raw.lineage.mother_identification ?? null,
        father_id: raw.lineage.father_id ? Number(raw.lineage.father_id) : null,
        father_identification: raw.lineage.father_identification ?? null,
        birth_date: raw.lineage.birth_date ?? null,
        is_nursing: raw.lineage.is_nursing != null ? Boolean(raw.lineage.is_nursing) : null,
      } : null
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
      active_gestation: entity.active_gestation,
      lineage: entity.lineage
    };
  }
}
