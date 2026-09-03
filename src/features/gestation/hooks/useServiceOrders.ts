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
  service_type: 'single' | 'rotation' | 'multi';
  is_controlled_service: boolean;
  female_sire_assignments: { female_caravan_id: number; assigned_male_caravan_id: number }[];
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
 * Hook to approve an order (DRAFT -> APPROVED or REJECTED).
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
      queryClient.invalidateQueries({ queryKey: ['caravans'] });
    }
  });
}

/**
 * Hook to complete an order manually (APPROVED -> SUCCESS).
 */
export function useCompleteServiceOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, observations, targetBatchId }: { id: number; observations?: string; targetBatchId?: number | null }) => {
      const response = await axiosInstance.post(`/service-orders/${id}/complete`, { observations, target_batch_id: targetBatchId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-orders'] });
      queryClient.invalidateQueries({ queryKey: ['caravans'] });
    }
  });
}

/**
 * Hook to update service order status dynamically via PATCH toggle.
 */
export function useUpdateServiceOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await axiosInstance.patch(`/service-orders/${id}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-orders'] });
      queryClient.invalidateQueries({ queryKey: ['caravans'] });
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
      empty_destination_batch_id?: number | null;
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

/**
 * Hook to create a new service order.
 */
export function useCreateServiceOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      batch_id: number;
      code: string;
      planned_start_date: string;
      observations: string | null;
      male_caravan_ids: number[];
      female_caravan_ids: number[];
      service_type?: 'single' | 'rotation' | 'multi';
      is_controlled_service?: boolean;
      female_sire_assignments?: { female_caravan_id: number; assigned_male_caravan_id: number }[];
    }) => {
      const response = await axiosInstance.post('/service-orders', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-orders'] });
      queryClient.invalidateQueries({ queryKey: ['caravans'] });
    }
  });
}

/**
 * Hook to fetch a single service order by its ID.
 */
export function useServiceOrder(id: number | undefined | null) {
  return useQuery<ServiceOrder>({
    queryKey: ['service-order', id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/service-orders/${id}`);
      return response.data;
    },
    enabled: !!id
  });
}


