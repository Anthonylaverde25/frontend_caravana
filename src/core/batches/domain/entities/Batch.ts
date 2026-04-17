export interface Batch {
  id: number;
  name: string;
  farm_id: number;
  farm_name?: string;
  provider_id?: number;
  provider_name?: string;
  observaciones?: string;
  is_active: boolean;
  created_at?: string;
}

export interface CreateBatchRequest {
  name: string;
  farm_id: number;
  observaciones?: string;
}
