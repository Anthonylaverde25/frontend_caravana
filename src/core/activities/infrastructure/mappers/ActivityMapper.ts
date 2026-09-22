import { Activity } from '../../domain/entities/Activity';

export class ActivityMapper {
  static toDomain(raw: any): Activity {
    return {
      id: raw.id,
      name: raw.name,
      code: raw.code,
      isEnabled: !!raw.is_enabled,
      isInitial: !!raw.is_initial,
      isFinal: !!raw.is_final,
      sortOrder: Number(raw.sort_order ?? 1),
      batches: (raw.batches || []).map((b: any) => ({
        id: b.id,
        name: b.name,
        farmName: b.farm_name,
        count: b.count,
        current_weight: b.current_weight ?? null,
        total_weight: b.total_weight ?? null,
        weighed_count: b.weighed_count ?? null,
        activityId: b.activity_id,
        batchTypeId: b.batch_type_id ?? null,
        batchTypeName: b.batch_type_name ?? null,
        batchTypeCode: b.batch_type_code ?? null,
        isConfined: b.is_confined ?? null,
        wasEmptied: !!b.was_emptied,
      })),
    };
  }
}
