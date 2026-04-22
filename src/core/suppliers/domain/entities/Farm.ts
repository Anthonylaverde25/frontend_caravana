export interface Farm {
  id: number;
  name: string;
  renspa: string;
  location: string | null;
  provider_id: number;
  is_active: boolean;
  caravans_count?: number;
  created_at?: string;
}
