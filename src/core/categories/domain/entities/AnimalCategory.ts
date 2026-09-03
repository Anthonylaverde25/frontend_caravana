export interface AnimalSubcategory {
  id: number;
  category_id: number;
  code: string;
  name: string;
  target_weight_min: number | null;
  target_weight_max: number | null;
  description: string | null;
}

export interface AnimalCategory {
  id: number;
  code: string;
  name: string;
  sex: 'M' | 'H' | 'BOTH';
  min_age_months: number;
  max_age_months: number | null;
  min_weight_kg: number | null;
  max_weight_kg: number | null;
  is_reproductive: boolean;
  description: string | null;
  subcategories: AnimalSubcategory[];
}
