import { Farm } from './Farm';

export interface Supplier {
  id: number;
  name: string;
  commercial_name: string | null;
  cuit: string;
  location: string | null;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  farms?: Farm[];
  created_at?: string;
}
