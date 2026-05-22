export interface BatchType {
  id: number;
  company_id: number;
  name: string;
  code: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  is_active: boolean;
}
