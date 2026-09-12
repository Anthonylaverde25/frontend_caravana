import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { veterinaryRepository } from "@/core/veterinary/infrastructure/repositories/ApiVeterinaryRepository";
import {
  DiagnosticProtocol,
  PortalPendingActs,
  ProcessVetPortalEvaluationInput,
  InstitutionMeta,
  PendingTube,
  RegisterLabReportInput,
  RegisterSampleShipmentInput,
  SampleDestinationPlan,
  SampleShipment,
  SignExtractionActInput,
  VeterinaryPortalSession,
  VeterinaryPortalWorkspace,
} from "@/core/veterinary/domain/VeterinaryTypes";

/**
 * The portal has two doors and one set of hooks.
 *
 * `accessToken` is null when a staff veterinarian opens the portal from inside the system
 * (identified by the Sanctum token), and holds the temporary grant when an external
 * professional arrives through the public link.
 */
export function useVeterinaryPortalSession(
  accessToken?: string | null,
  enabled = true,
) {
  return useQuery<VeterinaryPortalSession>({
    queryKey: ["veterinary-portal-session", accessToken ?? "internal"],
    queryFn: () => veterinaryRepository.getPortalSession(accessToken),
    enabled,
    retry: false,
  });
}

export function useVeterinaryPortalWorkspace(
  batchId: number | null,
  accessToken?: string | null,
  enabled = true,
) {
  return useQuery<VeterinaryPortalWorkspace>({
    queryKey: [
      "veterinary-portal-workspace",
      accessToken ?? "internal",
      batchId,
    ],
    queryFn: () =>
      veterinaryRepository.getPortalWorkspace(batchId, accessToken),
    enabled,
    retry: false,
  });
}

export function usePortalPathogens(accessToken?: string | null) {
  return useQuery({
    queryKey: ["portal-pathogens", accessToken ?? "internal"],
    queryFn: () => veterinaryRepository.getPortalPathogens(accessToken),
    staleTime: 1000 * 60 * 60,
  });
}

export function useSubmitPortalEvaluation(accessToken?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ProcessVetPortalEvaluationInput) =>
      veterinaryRepository.submitPortalEvaluation(input, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["veterinary-portal-workspace"],
      });
      queryClient.invalidateQueries({ queryKey: ["pre-service-bulls"] });
      queryClient.invalidateQueries({ queryKey: ["diagnostic-protocols"] });
    },
  });
}

/**
 * The professional's inbox. Both doors share it: a staff vet sees every act of theirs, while a
 * link issued for one act (ADR-16) sees only that one.
 */
export function usePortalPendingActs(
  accessToken?: string | null,
  enabled = true,
) {
  return useQuery<PortalPendingActs>({
    queryKey: ["veterinary-portal-acts", accessToken ?? "internal"],
    queryFn: () => veterinaryRepository.getPendingActs(accessToken),
    enabled,
    retry: false,
  });
}

export function usePortalAct(
  actId: number | null,
  accessToken?: string | null,
) {
  return useQuery<DiagnosticProtocol>({
    queryKey: ["veterinary-portal-act", accessToken ?? "internal", actId],
    queryFn: () => veterinaryRepository.getAct(actId as number, accessToken),
    enabled: actId !== null,
    retry: false,
  });
}

/**
 * ADR-30 / ADR-36: everything the professional still holds, across every act at once. You pack a
 * box, not a chute session.
 */
export function usePortalPendingTubes(accessToken?: string | null, enabled = true) {
  return useQuery<PendingTube[]>({
    queryKey: ["veterinary-portal-pending-tubes", accessToken ?? "internal"],
    queryFn: () => veterinaryRepository.getPendingTubes(accessToken),
    enabled,
    retry: false,
  });
}

export function usePortalShipments(accessToken?: string | null, enabled = true) {
  return useQuery<SampleShipment[]>({
    queryKey: ["veterinary-portal-shipments", accessToken ?? "internal"],
    queryFn: () => veterinaryRepository.getShipments(accessToken),
    enabled,
    retry: false,
  });
}

/** ADR-30: the professional declares what they dispatched — a fact they witnessed. */
export function useRegisterShipment(accessToken?: string | null) {
  const queryClient = useQueryClient();

  return useMutation<SampleShipment, unknown, RegisterSampleShipmentInput>({
    mutationFn: (input) => veterinaryRepository.registerShipment(input, accessToken),
    onSuccess: () => invalidatePortal(queryClient),
  });
}

/** ADR-37: free correction while nobody cited it. */
export function useCorrectShipment(accessToken?: string | null) {
  const queryClient = useQueryClient();

  return useMutation<
    SampleShipment,
    unknown,
    { shipmentId: number; input: RegisterSampleShipmentInput }
  >({
    mutationFn: ({ shipmentId, input }) =>
      veterinaryRepository.correctShipment(shipmentId, input, accessToken),
    onSuccess: () => invalidatePortal(queryClient),
  });
}

export function useVoidShipment(accessToken?: string | null) {
  const queryClient = useQueryClient();

  return useMutation<SampleShipment, unknown, { shipmentId: number; reason: string }>({
    mutationFn: ({ shipmentId, reason }) =>
      veterinaryRepository.voidShipment(shipmentId, reason, accessToken),
    onSuccess: () => invalidatePortal(queryClient),
  });
}

/** §3.9: suggested from history — nobody ever registers a laboratory. */
export function useInstitutionSuggestions(search: string, accessToken?: string | null) {
  return useQuery<InstitutionMeta[]>({
    queryKey: ["institution-suggestions", accessToken ?? "internal", search],
    queryFn: () => veterinaryRepository.getInstitutionSuggestions(search, accessToken),
    staleTime: 1000 * 60,
  });
}

/** ADR-13: the one action that closes the chain of custody. Irreversible by design. */
export function useSignExtractionAct(accessToken?: string | null) {
  const queryClient = useQueryClient();

  return useMutation<
    DiagnosticProtocol,
    unknown,
    { actId: number; input: SignExtractionActInput }
  >({
    mutationFn: ({ actId, input }) =>
      veterinaryRepository.signAct(actId, input, accessToken),
    onSuccess: () => invalidatePortal(queryClient),
  });
}

export function useRegisterLabReport(accessToken?: string | null) {
  const queryClient = useQueryClient();

  return useMutation<
    DiagnosticProtocol,
    unknown,
    { actId: number; input: RegisterLabReportInput }
  >({
    mutationFn: ({ actId, input }) =>
      veterinaryRepository.registerLabReport(actId, input, accessToken),
    onSuccess: () => invalidatePortal(queryClient),
  });
}

/** ADR-40: Quick toggle/update of destination plan on an unsigned act. */
export function useUpdateActDestinationPlan(accessToken?: string | null) {
  const queryClient = useQueryClient();

  return useMutation<
    DiagnosticProtocol,
    unknown,
    { actId: number; destinationPlan: SampleDestinationPlan }
  >({
    mutationFn: ({ actId, destinationPlan }) =>
      veterinaryRepository.updateDestinationPlan(actId, destinationPlan, accessToken),
    onSuccess: () => invalidatePortal(queryClient),
  });
}

/** Signing or reporting moves aptitude, so the bull lists have to be refetched too. */
function invalidatePortal(
  queryClient: ReturnType<typeof useQueryClient>,
): void {
  queryClient.invalidateQueries({ queryKey: ["veterinary-portal-acts"] });
  queryClient.invalidateQueries({ queryKey: ["veterinary-portal-pending-tubes"] });
  queryClient.invalidateQueries({ queryKey: ["veterinary-portal-shipments"] });
  queryClient.invalidateQueries({ queryKey: ["veterinary-portal-act"] });
  queryClient.invalidateQueries({ queryKey: ["veterinary-portal-workspace"] });
  queryClient.invalidateQueries({ queryKey: ["pre-service-bulls"] });
  queryClient.invalidateQueries({ queryKey: ["diagnostic-protocols"] });
}
