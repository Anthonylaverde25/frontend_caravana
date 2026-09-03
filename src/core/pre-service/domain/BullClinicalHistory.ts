export interface ClinicalCaravanInfo {
  id: number;
  identification: string;
  sex: string;
  teeth?: number;
  entry_weight?: number | string;
  current_weight?: number | string;
  entry_date?: string;
  breed: string;
  color: string;
  category: string;
  batch_name: string;
  farm_name: string;
  renspa?: string;
}

export interface ClinicalMetrics {
  latest_ce_cm: number | null;
  oldest_ce_cm: number | null;
  ce_delta_cm: number;
  is_ce_compliant: boolean;
  evaluations_count: number;
  lab_samples_count: number;
  active_diagnoses_count: number;
  total_diagnoses_count: number;
}

export interface HistoricalEvaluation {
  id: number;
  last_evaluation_date: string;
  scrotal_circumference_cm: number | null;
  body_condition_score: number | null;
  libido: string;
  aplomo_notes?: string;
  status: string;
  observations?: string;
}

export interface HistoricalLabSample {
  id: number;
  sample_type: 'PREPUCE_SCRAPE' | 'BLOOD_SEROLOGY';
  sample_round: number;
  sample_date: string;
  tube_number?: string;
  status: 'PENDING_RESULTS' | 'NEGATIVE_CLEARED' | 'POSITIVE_DETECTED';
  protocol_number?: string;
  result_date?: string;
  pathogen_name?: string;
}

export interface HistoricalDiagnosis {
  id: number;
  pathogen_code: string;
  pathogen_name: string;
  pathogen_is_disqualifying: boolean;
  veterinarian_name?: string;
  diagnosis_date: string;
  resolution_date?: string;
  status: 'ACTIVE' | 'RESOLVED';
  treatment_notes?: string;
}

export interface ClinicalTimelineItem {
  id: string;
  type: 'ANDROLOGICAL_EXAM' | 'LAB_SAMPLE' | 'VETERINARY_DIAGNOSIS';
  date: string;
  title: string;
  description: string;
  status: string;
  meta?: Record<string, unknown>;
}

export interface BullClinicalHistoryResponse {
  caravan: ClinicalCaravanInfo;
  computed_status: 'APT' | 'UNFIT' | 'IN_TREATMENT' | 'PENDING_EVALUATION';
  metrics: ClinicalMetrics;
  evaluations: HistoricalEvaluation[];
  lab_samples: HistoricalLabSample[];
  diagnoses: HistoricalDiagnosis[];
  timeline: ClinicalTimelineItem[];
}
