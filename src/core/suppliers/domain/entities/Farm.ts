export interface Farm {
  id: number;
  name: string;
  location: string | null;
  provider_id: number;
  is_active: boolean;
  created_at?: string;
}
