import { Batch } from '@/core/batches/domain/entities/Batch';

export interface Farm {
  id: number;
  name: string;
  renspa: string;
  location: string | null;
  provider_id: number;
  is_active: boolean;
  caravans_count?: number;
  batches?: Batch[];
  created_at?: string;
}
