import { Activity } from '../../domain/entities/Activity';

export class ActivityMapper {
  static toDomain(raw: any): Activity {
    return {
      id: raw.id,
      name: raw.name,
      code: raw.code,
      isEnabled: !!raw.is_enabled,
      isFinal: !!raw.is_final,
      batches: (raw.batches || []).map((b: any) => ({
        id: b.id,
        name: b.name,
        farmName: b.farm_name,
        count: b.count,
        weight: b.weight || 'N/A',
      })),
    };
  }
}
