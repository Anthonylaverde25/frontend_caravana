import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { veterinaryRepository } from '@/core/veterinary/infrastructure/repositories/ApiVeterinaryRepository';
import {
  CreateDiagnosticProtocolInput,
  DiagnosticProtocol,
  DiagnosticProtocolFilters,
  IssueVeterinaryPortalTokenInput,
  PortalDirectoryRow,
  ReissuePortalTokenInput,
  Veterinarian,
  VeterinaryPortalAccessToken,
} from '@/core/veterinary/domain/VeterinaryTypes';

/** The catalogues barely change, so they are cached aggressively. */
const CATALOG_STALE_TIME = 1000 * 60 * 30;

export function useVeterinarians(includeInactive = false) {
  return useQuery<Veterinarian[]>({
    queryKey: ['veterinarians', includeInactive],
    queryFn: () => veterinaryRepository.getVeterinarians(includeInactive),
    staleTime: CATALOG_STALE_TIME,
  });
}


/**
 * Quick-create from inside the protocol wizard, so the operator never loses the form just
 * because the professional was missing from the catalogue.
 */
/** ADR-33: the producer hands out the invitation; the professional chooses the password. */
export function useInviteVeterinarian() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ veterinarianId, email }: { veterinarianId: number; email?: string | null }) =>
      veterinaryRepository.inviteVeterinarian(veterinarianId, email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['veterinarians'] });
    },
  });
}

export function useCreateVeterinarian() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Partial<Veterinarian>) => veterinaryRepository.createVeterinarian(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['veterinarians'] });
    },
  });
}


export function useDiagnosticProtocols(filters: DiagnosticProtocolFilters = {}) {
  return useQuery<DiagnosticProtocol[]>({
    queryKey: ['diagnostic-protocols', filters],
    queryFn: () => veterinaryRepository.getProtocols(filters),
  });
}

export function useDiagnosticProtocol(id: number | null) {
  return useQuery<DiagnosticProtocol>({
    queryKey: ['diagnostic-protocol', id],
    queryFn: () => veterinaryRepository.getProtocol(id as number),
    enabled: id !== null,
  });
}

/**
 * Ingesting a protocol reclassifies bulls, so the pre-service board must be refreshed too.
 */
export function useCreateDiagnosticProtocol() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateDiagnosticProtocolInput) => veterinaryRepository.createProtocol(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagnostic-protocols'] });
      queryClient.invalidateQueries({ queryKey: ['pre-service-bulls'] });
    },
  });
}

/** Voiding reverts the derived findings and recomputes aptitude (ADR-9). */
export function useVoidDiagnosticProtocol() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      veterinaryRepository.voidProtocol(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagnostic-protocols'] });
      queryClient.invalidateQueries({ queryKey: ['diagnostic-protocol'] });
      queryClient.invalidateQueries({ queryKey: ['pre-service-bulls'] });
    },
  });
}

/** The establishment's directory of portals, one row per professional. */
export function usePortalDirectory(activeOnly = true) {
  return useQuery<PortalDirectoryRow[]>({
    queryKey: ['veterinary-portal-directory', activeOnly],
    queryFn: () => veterinaryRepository.getPortalDirectory(activeOnly),
  });
}

export function useVeterinaryPortalTokens(activeOnly = false) {
  return useQuery<VeterinaryPortalAccessToken[]>({
    queryKey: ['veterinary-portal-tokens', activeOnly],
    queryFn: () => veterinaryRepository.getPortalTokens(activeOnly),
  });
}

export function useIssueVeterinaryPortalToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: IssueVeterinaryPortalTokenInput) => veterinaryRepository.issuePortalToken(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['veterinary-portal-tokens'] });
      queryClient.invalidateQueries({ queryKey: ['veterinary-portal-directory'] });
    },
  });
}

export function useReissueVeterinaryPortalToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: ReissuePortalTokenInput }) =>
      veterinaryRepository.reissuePortalToken(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['veterinary-portal-tokens'] });
      queryClient.invalidateQueries({ queryKey: ['veterinary-portal-directory'] });
    },
  });
}

export function useRevokeVeterinaryPortalToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      veterinaryRepository.revokePortalToken(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['veterinary-portal-tokens'] });
      queryClient.invalidateQueries({ queryKey: ['veterinary-portal-directory'] });
    },
  });
}
