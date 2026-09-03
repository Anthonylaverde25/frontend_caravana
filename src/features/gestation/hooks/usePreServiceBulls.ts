import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { preServiceRepository } from '@/core/pre-service/infrastructure/repositories/ApiPreServiceRepository';
import {
  BullHealthEvaluation,
  Pathogen,
  RegisterBullHealthEvaluationInput,
  CreateVeterinaryDiagnosisInput,
  ResolveDiagnosisInput,
} from '@/core/pre-service/domain/BullHealthEvaluation';

/**
 * Hook to fetch all bulls with their andrological health status and active diagnoses.
 */
export function usePreServiceBulls() {
  return useQuery<BullHealthEvaluation[]>({
    queryKey: ['pre-service-bulls'],
    queryFn: async () => {
      return preServiceRepository.getBulls();
    },
  });
}

/**
 * Hook to fetch the catalog of bovine pathogens.
 */
export function usePathogens() {
  return useQuery<Pathogen[]>({
    queryKey: ['pathogens'],
    queryFn: async () => {
      return preServiceRepository.getPathogens();
    },
    staleTime: 1000 * 60 * 60, // 1 hour caching for static pathology catalog
  });
}

/**
 * Hook to register an andrological physical evaluation (and optional diagnosis) in manga.
 */
export function useSaveBullHealthEvaluation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RegisterBullHealthEvaluationInput) => {
      return preServiceRepository.registerBullEvaluation(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pre-service-bulls'] });
    },
  });
}

/**
 * Hook to record a clinical diagnosis on a caravan.
 */
export function useCreateDiagnosis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      caravanId,
      input,
    }: {
      caravanId: number;
      input: CreateVeterinaryDiagnosisInput;
    }) => {
      return preServiceRepository.createDiagnosis(caravanId, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pre-service-bulls'] });
    },
  });
}

/**
 * Hook to discharge a diagnosis (Alta Médica) and reactively restore bull aptitude.
 */
export function useResolveDiagnosis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      diagnosisId,
      input,
    }: {
      diagnosisId: number;
      input: ResolveDiagnosisInput;
    }) => {
      return preServiceRepository.resolveDiagnosis(diagnosisId, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pre-service-bulls'] });
    },
  });
}
