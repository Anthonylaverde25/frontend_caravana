export interface Field {
  id: string;
  label: string;
  checked: boolean;
  selectedAlias: string;
}

export interface Mapping {
  id: number;
  alias_name: string;
  target_field: string;
}
