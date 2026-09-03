export interface WorkTemplateScanRow {
  id?: string | number;
  caravana: string;
  confidence?: number;
  observations: string;

  // ING-01 specific fields
  category?: string;
  sex?: string;
  breed?: string;
  teeth?: string | number;
  entry_weight?: string | number;

  // TOR-01 specific fields
  ce_cm?: string | number;
  bcs?: string | number;
  libido?: string;
  aplomos?: string;
  scrape_collected?: boolean;
  scrape_tube?: string;
  serology_collected?: boolean;
  serology_tube?: string;
  physical_verdict?: string; // 'A' | 'R' | 'T'
}

export interface Tor01Metadata {
  farm_name: string;
  renspa: string;
  veterinarian_name: string;
  veterinarian_license: string;
  sample_round: number;
  evaluation_date: string;
}

export interface Ing01Metadata {
  batch_name: string;
  activity_name: string;
  entry_date: string;
  provider_cuit: string;
  provider_renspa: string;
  guia_dte: string;
}
