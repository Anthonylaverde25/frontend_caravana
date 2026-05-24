import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/utils/axios';

export interface ServiceOrderHistory {
  id: number;
  from_status: string | null;
  to_status: string;
  action_user_id: number;
  action_reason: string | null;
  created_at: string;
}

export interface ServiceOrder {
  id: number;
  company_id: number;
  batch_id: number;
  code: string;
  status: string;
  requested_by_user_id: number | null;
  reviewed_by_user_id: number | null;
  approved_by_user_id: number | null;
  reviewed_at: string | null;
  approved_at: string | null;
  executed_at: string | null;
  planned_start_date: string;
  actual_start_date: string | null;
  actual_end_date: string | null;
  observations: string | null;
  rejection_reason: string | null;
  male_caravan_ids: number[];
  female_caravan_ids: number[];
  history: ServiceOrderHistory[];
  created_at: string;
}

/**
 * Hook to fetch all service orders of the current tenant company.
 */
export function useServiceOrders() {
  return useQuery<ServiceOrder[]>({
    queryKey: ['service-orders'],
    queryFn: async () => {
      const response = await axiosInstance.get('/service-orders');
      return response.data;
    }
  });
}

/**
 * Hook to submit an order for review (DRAFT -> PENDING_REVIEW).
 */
export function useSubmitServiceOrderReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await axiosInstance.post(`/service-orders/${id}/submit-review`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-orders'] });
    }
  });
}

/**
 * Hook to review/observe an order (PENDING_REVIEW -> PENDING_APPROVAL or REJECTED).
 */
export function useReviewServiceOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, approve, reason }: { id: number; approve: boolean; reason?: string }) => {
      const response = await axiosInstance.post(`/service-orders/${id}/review`, { approve, reason });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-orders'] });
    }
  });
}

/**
 * Hook to approve an order (PENDING_APPROVAL -> APPROVED or REJECTED).
 */
export function useApproveServiceOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, approve, reason }: { id: number; approve: boolean; reason?: string }) => {
      const response = await axiosInstance.post(`/service-orders/${id}/approve`, { approve, reason });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-orders'] });
    }
  });
}

/**
 * Hook to execute an order (APPROVED -> IN_PROGRESS), which transfers the animals in the DB.
 */
export function useExecuteServiceOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await axiosInstance.post(`/service-orders/${id}/execute`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-orders'] });
      queryClient.invalidateQueries({ queryKey: ['caravans'] });
    }
  });
}

/**
 * Hook to complete an order manually (IN_PROGRESS -> COMPLETED).
 */
export function useCompleteServiceOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, observations }: { id: number; observations?: string }) => {
      const response = await axiosInstance.post(`/service-orders/${id}/complete`, { observations });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-orders'] });
    }
  });
}

/**
 * Hook to record gestation diagnosis for a caravan.
 */
export function useRegisterGestationDiagnosis() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      caravanId,
      serviceOrderId,
      isPregnant,
      gestationStage,
      gestationMonths,
      confirmedSireId,
      diagnosisDate
    }: {
      caravanId: number;
      serviceOrderId: number;
      isPregnant: boolean;
      gestationStage?: string | null;
      gestationMonths?: number | null;
      confirmedSireId?: number | null;
      diagnosisDate: string;
    }) => {
      const response = await axiosInstance.post(`/caravans/${caravanId}/gestation-diagnosis`, {
        service_order_id: serviceOrderId,
        is_pregnant: isPregnant,
        gestation_stage: gestationStage,
        gestation_months: gestationMonths,
        confirmed_sire_id: confirmedSireId,
        diagnosis_date: diagnosisDate
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caravans'] });
      queryClient.invalidateQueries({ queryKey: ['service-orders'] });
    }
  });
}

/**
 * Hook to record bulk gestation diagnosis for multiple caravans.
 */
export function useBulkRegisterGestationDiagnosis() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (diagnoses: Array<{
      caravan_id: number;
      service_order_id: number;
      is_pregnant: boolean;
      gestation_stage?: string | null;
      gestation_months?: number | null;
      confirmed_sire_id?: number | null;
      diagnosis_date: string;
    }>) => {
      const response = await axiosInstance.post('/caravans/bulk-gestation-diagnosis', {
        diagnoses
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caravans'] });
      queryClient.invalidateQueries({ queryKey: ['service-orders'] });
    }
  });
}
