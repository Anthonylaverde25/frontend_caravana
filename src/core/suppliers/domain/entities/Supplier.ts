export interface Supplier {
  id: number;
  name: string;
  commercial_name: string | null;
  cuit: string;
  location: string | null;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  created_at?: string;
}
