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

/** Why a female stopped being exposed to the bulls of a service. */
export type ServiceExposureExitReason = 'TRANSFERRED_OUT' | 'BULLS_WITHDRAWN' | 'SERVICE_CLOSED' | 'DEATH' | 'SALE';

/**
 * Current verdict of a female for one order. UNCHECKED blocks the closing; NOT_DIAGNOSED is declared
 * with a reason; EXITED means she died or was sold before any verdict.
 */
export type FemaleReproductiveVerdict = 'UNCHECKED' | 'PREGNANT' | 'EMPTY' | 'NOT_DIAGNOSED' | 'EXITED';

export type NotDiagnosedReason = 'NOT_GATHERED' | 'NOT_FOUND' | 'OTHER';

/** Exposure window of a female: from the day she shared the paddock with the bulls until she left. */
export interface ServiceOrderFemaleExposure {
  female_caravan_id: number;
  exposed_from: string | null;
  exposed_until: string | null;
  exit_reason: ServiceExposureExitReason | null;
  /** Entered the batch with the service already running. */
  joined_after_start: boolean;
  reproductive_status?: FemaleReproductiveVerdict;
  diagnosed_at?: string | null;
  /** AI only (semen S-B): latest live insemination; null = not inseminated. */
  last_insemination_on?: string | null;
  planned_semen_item_id?: number | null;
  not_inseminated_reason?: NotInseminatedReason | null;
}

/** How the females of an order are served (semen S-B). */
export type ServiceMethod = 'NATURAL' | 'AI';

/** Optional note on why a female of an AI order was never inseminated (IA12). */
export type NotInseminatedReason = 'NOT_PRESENTED' | 'DEVICE_LOST' | 'DISCARDED' | 'OTHER';

/** Where the inseminations of an AI order stand, derived by the backend. */
export interface InseminationSummary {
  females: number;
  inseminated: number;
  not_inseminated: number;
  last_insemination_on: string | null;
  repaso_bulls_active: number;
  had_repaso_bulls: boolean;
}

/**
 * Where the pregnancy diagnosis of the order stands, computed by the backend from the verdict of
 * every female. A provisional empty (scanned while still with the bulls) counts as pending.
 */
export interface ServiceOrderDiagnosisSummary {
  total: number;
  unchecked: number;
  pregnant: number;
  empty: number;
  provisional_empty: number;
  not_diagnosed: number;
  exited: number;
  evaluated: number;
  pending: number;
  pending_female_ids: number[];
  provisional_empty_female_ids: number[];
  /** Pregnant over pregnant + final empty, in percent; null while nobody has a final verdict. */
  partial_rate: number | null;
  /** AI without repaso: females never inseminated, out of the total and of the rate. */
  not_inseminated?: number;
}

/**
 * A service is an order over an operational Cría batch (batch_id): the batch keeps its animals,
 * the order keeps the policies, the exposure of every female and the trace of the campaign.
 */
export interface ServiceOrder {
  id: number;
  company_id: number;
  batch_id: number;
  batch_name?: string | null;
  code: string;
  status: string;
  requested_by_user_id: number | null;
  reviewed_by_user_id: number | null;
  approved_by_user_id: number | null;
  reviewed_at: string | null;
  approved_at: string | null;
  executed_at: string | null;
  planned_start_date: string;
  planned_end_date?: string | null;
  actual_start_date: string | null;
  actual_end_date: string | null;
  /** Day the pregnancy diagnosis was closed (status SUCCESS). */
  diagnosis_completed_at?: string | null;
  /** Bull withdrawal + 45 days: from then a pregnancy is reliably detected. Informative only. */
  suggested_diagnosis_date?: string | null;
  /** The order this one continues (the bulls stayed with the empty females). */
  parent_service_order_id?: number | null;
  diagnosis_summary?: ServiceOrderDiagnosisSummary;
  /** Females still without a final verdict if the order were closed today. */
  pending_if_closed_today?: number;
  observations: string | null;
  rejection_reason: string | null;
  male_caravan_ids: number[];
  active_male_caravan_ids?: number[];
  all_male_caravan_ids?: number[];
  female_caravan_ids: number[];
  female_exposures?: ServiceOrderFemaleExposure[];
  target_bull_ratio?: number | null;
  final_pregnancy_rate?: number | null;
  male_details?: {
    male_caravan_id: number;
    status: 'ACTIVE' | 'RETIRED_INJURED' | 'RETIRED_SANITARY' | 'REPLACED' | 'COMPLETED' | string;
    retired_at?: string | null;
    scrotal_circumference?: number | null;
    service_capacity?: string | null;
  }[];
  bull_replacements?: any[];
  service_type: 'single' | 'rotation' | 'multi';
  service_method?: ServiceMethod;
  insemination_summary?: InseminationSummary | null;
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
 * Service history of a batch: every service it went through, newest first.
 */
export function useBatchServiceOrders(batchId: number | null | undefined) {
  return useQuery<ServiceOrder[]>({
    queryKey: ['service-orders', 'batch', batchId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/batches/${batchId}/service-orders`);
      return response.data;
    },
    enabled: Boolean(batchId),
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
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['caravans'] });
    }
  });
}

/**
 * Withdraws the whole torada before the diagnosis: the order waits for it (BULLS_WITHDRAWN).
 */
export function useCloseServiceOrderWithBullWithdrawal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      withdrawalDate,
      observations,
      defaultDestinationBatchId,
      bullDestinations,
    }: {
      id: number;
      withdrawalDate: string;
      observations?: string;
      defaultDestinationBatchId?: number | null;
      bullDestinations?: { male_caravan_id: number; destination_batch_id: number }[];
    }) => {
      const response = await axiosInstance.post(`/service-orders/${id}/close-service`, {
        withdrawal_date: withdrawalDate,
        observations,
        default_destination_batch_id: defaultDestinationBatchId,
        bull_destinations: bullDestinations,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-orders'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['caravans'] });
    },
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
      queryClient.invalidateQueries({ queryKey: ['batches'] });
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
      diagnosisDate
    }: {
      caravanId: number;
      serviceOrderId: number;
      isPregnant: boolean;
      gestationStage?: string | null;
      gestationMonths?: number | null;
      diagnosisDate: string;
    }) => {
      const response = await axiosInstance.post(`/caravans/${caravanId}/gestation-diagnosis`, {
        service_order_id: serviceOrderId,
        is_pregnant: isPregnant,
        gestation_stage: gestationStage,
        gestation_months: gestationMonths,
        diagnosis_date: diagnosisDate
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caravans'] });
      queryClient.invalidateQueries({ queryKey: ['service-orders'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
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
      queryClient.invalidateQueries({ queryKey: ['batches'] });
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
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['caravans'] });
    }
  });
}

/** One diagnosis day of an order, with what was loaded in it. */
export interface DiagnosisRound {
  id: number;
  number: number;
  round_date: string;
  diagnosed: number;
  pregnant: number;
  empty: number;
  not_diagnosed: number;
  rechecks: number;
}

export interface DiagnosisFemale {
  female_caravan_id: number;
  identification: string;
  current_batch_id: number | null;
  current_batch_name: string | null;
  reproductive_status: FemaleReproductiveVerdict;
  diagnosed_at: string | null;
  exposed_from: string | null;
  exposed_until: string | null;
  exit_reason: ServiceExposureExitReason | null;
  gestation_id: number | null;
  gestation_stage: 'head' | 'body' | 'tail' | null;
  gestation_months: number | null;
  not_diagnosed_reason: NotDiagnosedReason | null;
  not_diagnosed_notes: string | null;
  assigned_male_caravan_id: number | null;
  /** Bulls whose stay in the order overlapped her exposure: her candidate sires. */
  sire_candidates?: { id: number; identification: string }[];
  /** Confirmed at the chute only when the order had a single bull all along; else settled on the calf. */
  confirmed_sire_id?: number | null;
  /** The verdict before the current one (or the last one, when she was reopened as pending). */
  previous_diagnosis: { verdict: FemaleReproductiveVerdict; round_number: number | null; round_date: string | null } | null;
  diagnoses_count: number;
  /** Empty scanned while still exposed to the bulls. */
  is_provisional_empty: boolean;
  is_final_if_closed_today: boolean;
  /** AI (semen S-B): latest live insemination. */
  last_insemination_on?: string | null;
  not_inseminated_reason?: NotInseminatedReason | null;
  /** AI without repaso: never inseminated, so neither scanned nor counted (IA12). */
  is_not_inseminated?: boolean;
  /** AI without repaso: an empty scanned on or after this day is final (IA11). */
  empty_final_after?: string | null;
}

export interface ServiceOrderIncident {
  id: number;
  type: string;
  type_label: string;
  female_caravan_id: number | null;
  female_identification: string | null;
  detail: string;
  status: 'OPEN' | 'RESOLVED';
  status_label: string;
  resolution: string | null;
  resolved_at: string | null;
  created_at: string | null;
}

export interface ServiceOrderDiagnosis {
  order_id: number;
  status: string;
  suggested_diagnosis_date: string | null;
  /** The only bull the order ever had (no AI): the sire is confirmed on the pregnant verdict. */
  sole_bull_id: number | null;
  summary: ServiceOrderDiagnosisSummary;
  pending_if_closed_today: number;
  rounds: DiagnosisRound[];
  females: DiagnosisFemale[];
  incidents: ServiceOrderIncident[];
}

/**
 * Query keys of one order hang from ['service-orders']: every mutation that touches orders
 * already invalidates that key, so the detail and the diagnosis of an order (the tacto screen,
 * the drawer) refresh with it — a bull withdrawal, a replaced bull, a closing.
 */
export const serviceOrderKeys = {
  all: ['service-orders'] as const,
  detail: (id: number | null | undefined) => ['service-orders', 'detail', id] as const,
  diagnosis: (id: number | null | undefined) => ['service-orders', 'diagnosis', id] as const,
};

/**
 * Rounds, the verdict of every female (current and previous) and the incidents of an order.
 */
export function useServiceOrderDiagnosis(orderId: number | null | undefined) {
  return useQuery<ServiceOrderDiagnosis>({
    queryKey: serviceOrderKeys.diagnosis(orderId),
    queryFn: async () => {
      const response = await axiosInstance.get(`/service-orders/${orderId}/diagnosis`);
      return response.data;
    },
    enabled: Boolean(orderId),
  });
}

function invalidateServiceOrderQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: serviceOrderKeys.all });
  queryClient.invalidateQueries({ queryKey: ['batches'] });
  queryClient.invalidateQueries({ queryKey: ['caravans'] });
}

export type ServiceClosureBullAction = 'MOVE_NOW' | 'SCHEDULE' | 'STAY';
export type ServiceClosureRemainingFemalesAction = 'MOVE_OUT' | 'CONTINUE_SERVICE';

export interface ScreenDiagnosisPayload {
  caravan_id: number;
  is_pregnant: boolean;
  gestation_stage?: 'head' | 'body' | 'tail' | null;
  gestation_months?: number | null;
  empty_destination_batch_id?: number | null;
}

export interface NotDiagnosedPayload {
  female_caravan_id: number;
  reason: NotDiagnosedReason;
  notes?: string | null;
}

export interface CloseServiceOrderDiagnosisPayload {
  closing_date: string;
  round_date?: string;
  observations?: string | null;
  diagnoses: ScreenDiagnosisPayload[];
  not_diagnosed: NotDiagnosedPayload[];
  empties_target_batch_id?: number | null;
  bull_action?: ServiceClosureBullAction | null;
  bull_destination_batch_id?: number | null;
  scheduled_movement_date?: string | null;
  remaining_females_action?: ServiceClosureRemainingFemalesAction | null;
  remaining_females_target_batch_id?: number | null;
  /** AI (semen S-B): optional note per never inseminated female (IA12). */
  not_inseminated_reasons?: { female_caravan_id: number; reason: NotInseminatedReason | null }[];
}

export interface CloseServiceOrderDiagnosisResult {
  message: string;
  order: ServiceOrder;
  continuation_order: { id: number; code: string } | null;
  transfer_order: { id: number; code: string } | null;
  moved_female_ids: number[];
}

/**
 * "Cerrar orden": the missing verdicts, the decision on the bulls and the closing, at once.
 * A 422 with code PENDING_DIAGNOSES carries the pending female ids.
 */
export function useCloseServiceOrderDiagnosis() {
  const queryClient = useQueryClient();
  return useMutation<CloseServiceOrderDiagnosisResult, unknown, { id: number; payload: CloseServiceOrderDiagnosisPayload }>({
    mutationFn: async ({ id, payload }) => {
      const response = await axiosInstance.post(`/service-orders/${id}/close-diagnosis`, payload);
      return response.data;
    },
    onSuccess: () => invalidateServiceOrderQueries(queryClient),
  });
}

/**
 * "Guardar avance": females declared without diagnosis (only once the bulls are gone).
 */
export function useMarkNotDiagnosed() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, roundDate, females }: { id: number; roundDate: string; females: NotDiagnosedPayload[] }) => {
      const response = await axiosInstance.post(`/service-orders/${id}/not-diagnosed`, {
        round_date: roundDate,
        females,
      });
      return response.data;
    },
    onSuccess: () => invalidateServiceOrderQueries(queryClient),
  });
}

export function useResolveServiceOrderIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, incidentId, resolution }: { orderId: number; incidentId: number; resolution: string }) => {
      const response = await axiosInstance.post(`/service-orders/${orderId}/incidents/${incidentId}/resolve`, { resolution });
      return response.data;
    },
    onSuccess: () => invalidateServiceOrderQueries(queryClient),
  });
}

/**
 * Hook to fetch a single service order by its ID.
 */
export function useServiceOrder(id: number | undefined | null) {
  return useQuery<ServiceOrder>({
    queryKey: serviceOrderKeys.detail(id),
    queryFn: async () => {
      const response = await axiosInstance.get(`/service-orders/${id}`);
      return response.data;
    },
    enabled: !!id
  });
}


