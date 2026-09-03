import { ReproductiveAptitudeStatus, LibidoLevel, DiagnosisStatus, PathogenCategory } from '../enums/PreServiceEnums';

export interface Pathogen {
  id: number;
  code: string;
  name: string;
  category: PathogenCategory;
  is_disqualifying: boolean;
  description: string | null;
}

export interface VeterinaryDiagnosis {
  id: number;
  company_id: number;
  caravan_id: number;
  pathogen_id: number;
  pathogen_code: string | null;
  pathogen_name: string | null;
  pathogen_is_disqualifying: boolean;
  veterinarian_id: number | null;
  veterinarian_name: string | null;
  diagnosis_date: string;
  status: DiagnosisStatus;
  is_active: boolean;
  resolution_date: string | null;
  treatment_notes: string | null;
  source_context: string | null;
}

export interface BullLabSample {
  id: number;
  company_id: number;
  caravan_id: number;
  evaluation_id?: number | null;
  sample_type: 'PREPUCE_SCRAPE' | 'BLOOD_SEROLOGY';
  sample_round: number;
  sample_date: string;
  tube_number?: string | null;
  status: 'PENDING_RESULTS' | 'NEGATIVE_CLEARED' | 'POSITIVE_DETECTED';
  protocol_number?: string | null;
  result_date?: string | null;
  pathogen_id?: number | null;
  pathogen_name?: string | null;
  notes?: string | null;
}

export interface BullHealthEvaluation {
  id: number | null;
  company_id: number;
  caravan_id: number;
  caravan_number: string;
  last_evaluation_date: string | null;
  aplomo_notes: string | null;
  scrotal_circumference_cm: number | null;
  body_condition_score: number | null;
  libido: LibidoLevel | string;
  status: ReproductiveAptitudeStatus;
  is_apt: boolean;
  is_under_treatment: boolean;
  is_unfit: boolean;
  observations: string | null;
  active_diagnoses: VeterinaryDiagnosis[];
  lab_samples?: BullLabSample[];
}

export interface RegisterBullHealthEvaluationInput {
  caravan_id: number;
  last_evaluation_date?: string;
  aplomo_notes?: string | null;
  scrotal_circumference_cm?: number | null;
  body_condition_score?: number | null;
  libido?: string;
  observations?: string | null;
  prepuce_scrape?: boolean;
  prepuce_scrape_tube?: string | null;
  blood_serology?: boolean;
  blood_serology_tube?: string | null;
  sample_round?: number;
  diagnosis?: {
    pathogen_id: number;
    veterinarian_id?: number | null;
    diagnosis_date?: string;
    status?: string;
    treatment_notes?: string | null;
  } | null;
}

export interface CreateVeterinaryDiagnosisInput {
  pathogen_id: number;
  veterinarian_id?: number | null;
  diagnosis_date?: string;
  status: DiagnosisStatus | string;
  treatment_notes?: string | null;
  source_context?: string;
}

export interface ResolveDiagnosisInput {
  resolution_date?: string;
  notes?: string | null;
}
