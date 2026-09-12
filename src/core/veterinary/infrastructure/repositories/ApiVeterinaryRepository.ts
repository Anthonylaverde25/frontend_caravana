import axiosInstance from '@/utils/axios';
import {
  CreateDiagnosticProtocolInput,
  DiagnosticProtocol,
  DiagnosticProtocolFilters,
  IssuedPortalToken,
  IssueVeterinaryPortalTokenInput,
  PortalAccessEmailResult,
  PortalDirectoryRow,
  PortalPendingActs,
  ReissuePortalTokenInput,
  ProcessVetPortalEvaluationInput,
  RegisterEvaluationSheetInput,
  InstitutionMeta,
  PendingTube,
  RegisterLabReportInput,
  RegisterSampleShipmentInput,
  SampleDestinationPlan,
  SampleShipment,
  SignExtractionActInput,
  Veterinarian,
  VeterinaryPortalAccessToken,
  VeterinaryPortalSession,
  VeterinaryPortalWorkspace,
} from '../../domain/VeterinaryTypes';

/**
 * Header carrying the temporary grant. Present only when the portal is reached through the
 * public link; an in-system veterinarian is identified by the Sanctum token instead.
 */
const PORTAL_TOKEN_HEADER = 'X-Vet-Access-Token';

/**
 * Names the professional whose portal a management user is looking at. The server answers with
 * their screens and refuses every write: reading somebody's work is not acting in their name.
 */
const VIEW_AS_HEADER = 'X-View-Veterinarian-Id';

/** Set once by the portal view; every portal call carries it from then on. */
let viewingVeterinarianId: number | null = null;

export function setPortalViewAs(veterinarianId: number | null): void {
  viewingVeterinarianId = veterinarianId;
}

export class ApiVeterinaryRepository {
  // ---------------------------------------------------------------- Catalogues

  async getVeterinarians(includeInactive = false): Promise<Veterinarian[]> {
    const response = await axiosInstance.get<{ data: Veterinarian[] }>('/veterinarians', {
      params: includeInactive ? { include_inactive: 1 } : undefined,
    });
    return response.data?.data ?? [];
  }

  /**
   * ADR-33: giving the professional a way in. The plaintext link comes back once and never
   * again — only its hash is stored.
   */
  async inviteVeterinarian(
    veterinarianId: number,
    email?: string | null
  ): Promise<{ email: string; expires_at: string; accept_url: string }> {
    const response = await axiosInstance.post<{
      data: { email: string; expires_at: string; accept_url: string };
    }>(`/veterinarians/${veterinarianId}/invite`, email ? { email } : {});

    return response.data?.data;
  }

  async createVeterinarian(input: Partial<Veterinarian>): Promise<Veterinarian> {
    const response = await axiosInstance.post<{ data: Veterinarian }>('/veterinarians', input);
    return response.data?.data;
  }


  // ------------------------------------------------------- Diagnostic protocols

  async getProtocols(filters: DiagnosticProtocolFilters = {}): Promise<DiagnosticProtocol[]> {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== '' && value !== undefined && value !== null)
    );
    const response = await axiosInstance.get<{ data: DiagnosticProtocol[] }>('/diagnostic-protocols', { params });
    return response.data?.data ?? [];
  }

  async getProtocol(id: number): Promise<DiagnosticProtocol> {
    const response = await axiosInstance.get<{ data: DiagnosticProtocol }>(`/diagnostic-protocols/${id}`);
    return response.data?.data;
  }

  /**
   * Multipart because the original evidence travels with the transcription. `samples` is sent
   * as a JSON string: a nested array cannot survive a multipart body intact.
   */
  async createProtocol(input: CreateDiagnosticProtocolInput): Promise<DiagnosticProtocol> {
    const formData = new FormData();

    formData.append('protocol_number', input.protocol_number);
    formData.append('sample_date', input.sample_date);
    formData.append('result_date', input.result_date);
    formData.append('source_channel', input.source_channel);
    formData.append('samples', JSON.stringify(input.samples));

    if (input.veterinarian_id) formData.append('veterinarian_id', String(input.veterinarian_id));
    if (input.observations) formData.append('observations', input.observations);

    input.attachments.forEach((file) => formData.append('attachments[]', file));

    const response = await axiosInstance.post<{ data: DiagnosticProtocol }>('/diagnostic-protocols', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data?.data;
  }

  async voidProtocol(id: number, reason: string): Promise<DiagnosticProtocol> {
    const response = await axiosInstance.post<{ data: DiagnosticProtocol }>(
      `/diagnostic-protocols/${id}/void`,
      { reason }
    );
    return response.data?.data;
  }

  // ------------------------------------------------------------ Veterinary portal

  async getPortalSession(accessToken?: string | null): Promise<VeterinaryPortalSession> {
    const response = await axiosInstance.get<{ data: VeterinaryPortalSession }>(
      '/veterinary-portal/session',
      { headers: this.portalHeaders(accessToken) }
    );
    return response.data?.data;
  }

  async getPortalWorkspace(batchId?: number | null, accessToken?: string | null): Promise<VeterinaryPortalWorkspace> {
    const response = await axiosInstance.get<{ data: VeterinaryPortalWorkspace }>(
      '/veterinary-portal/workspace',
      {
        params: batchId ? { batch_id: batchId } : undefined,
        headers: this.portalHeaders(accessToken),
      }
    );
    return response.data?.data;
  }

  async getPortalPathogens(accessToken?: string | null): Promise<Array<{ id: number; code: string; name: string; category: string }>> {
    const response = await axiosInstance.get<{ data: Array<{ id: number; code: string; name: string; category: string }> }>(
      '/veterinary-portal/pathogens',
      { headers: this.portalHeaders(accessToken) }
    );
    return response.data?.data ?? [];
  }

  async submitPortalEvaluation(
    input: ProcessVetPortalEvaluationInput,
    accessToken?: string | null
  ): Promise<DiagnosticProtocol> {
    const response = await axiosInstance.post<{ data: DiagnosticProtocol }>(
      '/veterinary-portal/evaluations',
      input,
      { headers: this.portalHeaders(accessToken) }
    );
    return response.data?.data;
  }

  // ------------------------------------------- Chute sheet and extraction acts

  /**
   * One chute session, one request, one extraction act. Replaces the per-bull loop that
   * silently dropped the sampling checkboxes.
   */
  async registerEvaluationSheet(input: RegisterEvaluationSheetInput): Promise<DiagnosticProtocol> {
    const response = await axiosInstance.post<{ data: DiagnosticProtocol }>(
      '/pre-service/evaluation-sheets',
      input
    );
    return response.data?.data;
  }

  /** The professional's inbox: acts to sign, and signed acts awaiting the laboratory. */
  async getPendingActs(accessToken?: string | null): Promise<PortalPendingActs> {
    const response = await axiosInstance.get<{ data: PortalPendingActs }>('/veterinary-portal/acts', {
      headers: this.portalHeaders(accessToken),
    });
    return response.data?.data ?? { pending_signature: [], pending_lab_report: [] };
  }

  async getAct(actId: number, accessToken?: string | null): Promise<DiagnosticProtocol> {
    const response = await axiosInstance.get<{ data: DiagnosticProtocol }>(
      `/veterinary-portal/acts/${actId}`,
      { headers: this.portalHeaders(accessToken) }
    );
    return response.data?.data;
  }

  /** ADR-13: from here the act is immutable. */
  async signAct(
    actId: number,
    input: SignExtractionActInput,
    accessToken?: string | null
  ): Promise<DiagnosticProtocol> {
    const response = await axiosInstance.post<{ data: DiagnosticProtocol }>(
      `/veterinary-portal/acts/${actId}/sign`,
      input,
      { headers: this.portalHeaders(accessToken) }
    );
    return response.data?.data;
  }

  /** ADR-40: Update the destination plan of an unsigned extraction act. */
  async updateDestinationPlan(
    actId: number,
    destinationPlan: SampleDestinationPlan,
    accessToken?: string | null
  ): Promise<DiagnosticProtocol> {
    const response = await axiosInstance.patch<{ data: DiagnosticProtocol }>(
      `/veterinary-portal/acts/${actId}/destination-plan`,
      { destination_plan: destinationPlan },
      { headers: this.portalHeaders(accessToken) }
    );
    return response.data?.data;
  }

  /**
   * ADR-27: when the act was derived to an external laboratory, the transcription travels with
   * that laboratory's PDF. Multipart only in that case, so the plain JSON path stays untouched;
   * `lines` goes as a JSON string because a nested array cannot survive a multipart body.
   */
  async registerLabReport(
    actId: number,
    input: RegisterLabReportInput,
    accessToken?: string | null
  ): Promise<DiagnosticProtocol> {
    const { attachments = [], ...payload } = input;
    const url = `/veterinary-portal/acts/${actId}/lab-report`;

    if (attachments.length === 0) {
      const response = await axiosInstance.post<{ data: DiagnosticProtocol }>(url, payload, {
        headers: this.portalHeaders(accessToken),
      });
      return response.data?.data;
    }

    const formData = new FormData();
    formData.append('lab_report_number', payload.lab_report_number);
    formData.append('result_date', payload.result_date);
    formData.append('lines', JSON.stringify(payload.lines));
    formData.append('reporting_institution', JSON.stringify(payload.reporting_institution));
    // A string here, so "0" must never be sent: PHP would read it as true before the request
    // normalises it. Send the flag only when it is set.
    if (payload.is_derived) formData.append('is_derived', '1');

    if (payload.is_derived && payload.analysing_institution) {
      formData.append('analysing_institution', JSON.stringify(payload.analysing_institution));
    }

    if (payload.observations) formData.append('observations', payload.observations);

    attachments.forEach((file) => formData.append('attachments[]', file));

    const response = await axiosInstance.post<{ data: DiagnosticProtocol }>(url, formData, {
      headers: { ...(this.portalHeaders(accessToken) ?? {}), 'Content-Type': 'multipart/form-data' },
    });

    return response.data?.data;
  }

  // ------------------------------------------------- Envíos de muestras (ADR-30 / ADR-36)

  /** Everything the professional still holds, across every act of theirs at once. */
  async getPendingTubes(accessToken?: string | null): Promise<PendingTube[]> {
    const response = await axiosInstance.get<{ data: PendingTube[] }>(
      '/veterinary-portal/pending-tubes',
      { headers: this.portalHeaders(accessToken) }
    );
    return response.data?.data ?? [];
  }

  async getShipments(accessToken?: string | null): Promise<SampleShipment[]> {
    const response = await axiosInstance.get<{ data: SampleShipment[] }>(
      '/veterinary-portal/shipments',
      { headers: this.portalHeaders(accessToken) }
    );
    return response.data?.data ?? [];
  }

  async registerShipment(
    input: RegisterSampleShipmentInput,
    accessToken?: string | null
  ): Promise<SampleShipment> {
    const response = await axiosInstance.post<{ data: SampleShipment }>(
      '/veterinary-portal/shipments',
      input,
      { headers: this.portalHeaders(accessToken) }
    );
    return response.data?.data;
  }

  /** ADR-37: free correction while no report has cited this box. */
  async correctShipment(
    shipmentId: number,
    input: RegisterSampleShipmentInput,
    accessToken?: string | null
  ): Promise<SampleShipment> {
    const response = await axiosInstance.patch<{ data: SampleShipment }>(
      `/veterinary-portal/shipments/${shipmentId}`,
      input,
      { headers: this.portalHeaders(accessToken) }
    );
    return response.data?.data;
  }

  async voidShipment(
    shipmentId: number,
    reason: string,
    accessToken?: string | null
  ): Promise<SampleShipment> {
    const response = await axiosInstance.post<{ data: SampleShipment }>(
      `/veterinary-portal/shipments/${shipmentId}/void`,
      { reason },
      { headers: this.portalHeaders(accessToken) }
    );
    return response.data?.data;
  }

  /** §3.9: suggested from history, because there is no catalogue to read from. */
  async getInstitutionSuggestions(
    search: string,
    accessToken?: string | null
  ): Promise<InstitutionMeta[]> {
    const response = await axiosInstance.get<{ data: InstitutionMeta[] }>(
      '/veterinary-portal/institutions/suggestions',
      { params: search ? { search } : undefined, headers: this.portalHeaders(accessToken) }
    );
    return response.data?.data ?? [];
  }

  // ------------------------------------------------------- Temporary access links

  /** One row per professional: their portal's state and what is waiting in it. */
  async getPortalDirectory(activeOnly = true): Promise<PortalDirectoryRow[]> {
    const response = await axiosInstance.get<{ data: PortalDirectoryRow[] }>(
      '/veterinary-portal-directory',
      { params: { active_only: activeOnly ? 1 : 0 } }
    );
    return response.data?.data ?? [];
  }

  async getPortalTokens(activeOnly = false): Promise<VeterinaryPortalAccessToken[]> {
    const response = await axiosInstance.get<{ data: VeterinaryPortalAccessToken[] }>(
      '/veterinary-portal-tokens',
      { params: activeOnly ? { active_only: 1 } : undefined }
    );
    return response.data?.data ?? [];
  }

  async issuePortalToken(input: IssueVeterinaryPortalTokenInput): Promise<IssuedPortalToken> {
    const response = await axiosInstance.post<{
      data: VeterinaryPortalAccessToken;
      meta?: { email?: PortalAccessEmailResult };
    }>('/veterinary-portal-tokens', input);

    return {
      token: response.data?.data,
      email: response.data?.meta?.email ?? { sent: false, recipient: null, error: null },
    };
  }

  /**
   * A lost link cannot be resent — only its hash is stored — so this mints a replacement with
   * the same scope and revokes the previous grant.
   */
  async reissuePortalToken(id: number, input: ReissuePortalTokenInput): Promise<IssuedPortalToken> {
    const response = await axiosInstance.post<{
      data: VeterinaryPortalAccessToken;
      meta?: { email?: PortalAccessEmailResult };
    }>(`/veterinary-portal-tokens/${id}/reissue`, input);

    return {
      token: response.data?.data,
      email: response.data?.meta?.email ?? { sent: false, recipient: null, error: null },
    };
  }

  async revokePortalToken(id: number, reason?: string): Promise<boolean> {
    const response = await axiosInstance.delete<{ success: boolean }>(`/veterinary-portal-tokens/${id}`, {
      data: { reason },
    });
    return response.data?.success ?? true;
  }

  private portalHeaders(accessToken?: string | null): Record<string, string> | undefined {
    const headers: Record<string, string> = {};

    if (accessToken) headers[PORTAL_TOKEN_HEADER] = accessToken;
    // A temporary link already names its professional; the supervision header would be noise.
    if (!accessToken && viewingVeterinarianId !== null) {
      headers[VIEW_AS_HEADER] = String(viewingVeterinarianId);
    }

    return Object.keys(headers).length > 0 ? headers : undefined;
  }
}

export const veterinaryRepository = new ApiVeterinaryRepository();
