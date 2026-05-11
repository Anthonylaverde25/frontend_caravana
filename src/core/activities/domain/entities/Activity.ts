export interface Activity {
  id: number;
  name: string;
  code: string;
  isEnabled: boolean;
  isFinal: boolean;
  batches: Array<{
    id: number;
    name: string;
    farmName: string;
    count: number;
    current_weight?: number;
  }>;
}
