import axiosInstance from '@/utils/axios';
import {
  BullHealthEvaluation,
  Pathogen,
  VeterinaryDiagnosis,
  RegisterBullHealthEvaluationInput,
  CreateVeterinaryDiagnosisInput,
  ResolveDiagnosisInput,
} from '../../domain/BullHealthEvaluation';

import { BullClinicalHistoryResponse } from '../../domain/BullClinicalHistory';

export class ApiPreServiceRepository {
  async getBulls(): Promise<BullHealthEvaluation[]> {
    const response = await axiosInstance.get<{ data: BullHealthEvaluation[] }>('/pre-service/bulls');
    return response.data?.data ?? [];
  }

  async getBullClinicalHistory(caravanId: number): Promise<BullClinicalHistoryResponse> {
    const response = await axiosInstance.get<{ data: BullClinicalHistoryResponse }>(`/pre-service/bulls/${caravanId}/clinical-history`);
    return response.data?.data;
  }

  async getPathogens(): Promise<Pathogen[]> {
    const response = await axiosInstance.get<{ data: Pathogen[] }>('/pathogens');
    return response.data?.data ?? [];
  }

  async registerBullEvaluation(input: RegisterBullHealthEvaluationInput): Promise<BullHealthEvaluation> {
    const response = await axiosInstance.post<{ data: BullHealthEvaluation }>('/pre-service/bull-evaluations', input);
    return response.data?.data;
  }

  async createDiagnosis(caravanId: number, input: CreateVeterinaryDiagnosisInput): Promise<VeterinaryDiagnosis> {
    const response = await axiosInstance.post<{ data: VeterinaryDiagnosis }>(`/caravans/${caravanId}/diagnoses`, input);
    return response.data?.data;
  }

  async resolveDiagnosis(diagnosisId: number, input: ResolveDiagnosisInput): Promise<boolean> {
    const response = await axiosInstance.patch<{ success: boolean; message: string }>(`/diagnoses/${diagnosisId}/resolve`, input);
    return response.data?.success ?? true;
  }
}

export const preServiceRepository = new ApiPreServiceRepository();
