/**
 * Domain contracts for the hybrid sanitary architecture.
 *
 * Three levels, deliberately kept apart (ADR-1):
 *   DiagnosticProtocol -> the evidentiary document (letterhead, number, signature, photos)
 *   ProtocolSampleLine -> the assay result per bull / pathogen / round
 *   the clinical finding -> derived only from a positive result, never from a negative
 */

export type DiagnosticSourceChannel = 'PORTAL_VET' | 'OWNER_DIGITIZED';

/**
 * ADR-11: the two faces of a sanitary document. An extraction act certifies what came out of
 * which animal and is signed at the chute; a laboratory report states what the tubes yielded and
 * is signed by the laboratory, hanging off the act through `parent_protocol_id`.
 */
export type DiagnosticProtocolType = 'EXTRACTION_ACT' | 'LAB_REPORT';
export type ProtocolStatus = 'DRAFT' | 'CONFIRMED' | 'VOIDED';
export type ProtocolVerificationStatus = 'UNVERIFIED' | 'VERIFIED';
export type LabSampleStatus = 'PENDING_RESULTS' | 'NEGATIVE_CLEARED' | 'POSITIVE_DETECTED';
export type SampleType = 'PREPUCE_SCRAPE' | 'BLOOD_SEROLOGY' | 'SEMEN_CULTURE' | 'TUBERCULIN_TEST';
export type VeterinaryPortalAccessMode = 'INTERNAL_USER' | 'TEMPORARY_TOKEN';

/**
 * ADR-29: an institution as described at the moment it matters — never a catalogue row that
 * somebody had to create beforehand. The CUIT is what identifies it; the name is what a person
 * reads.
 */
/**
 * ADR-40: what the professional INTENDED to do with the tubes, declared at the chute.
 *
 * A plan, never a rule. Nothing validates against it — a report that contradicts it is accepted,
 * because plans change and the intention was real when it was declared. It prefills the report
 * dialog and it lets the producer see what is about to leave.
 */
export type SampleDestinationPlan = 'IN_SITU' | 'TO_BE_DERIVED' | 'UNDECIDED';

export const SAMPLE_DESTINATION_PLAN_LABELS: Record<SampleDestinationPlan, string> = {
  IN_SITU: 'Se procesa en la institución del acta',
  TO_BE_DERIVED: 'Se enviará a otro laboratorio o centro',
  UNDECIDED: 'Todavía no está definido',
};

export interface InstitutionMeta {
  nombre: string;
  cuit?: string | null;
  /**
   * ADR-43: whether the stored CUIT's check digit closes.
   *
   * The number is stored as typed — nothing reads it to decide anything, so refusing to store it
   * bought nothing — and this says whether it checks out, so a reader is never shown a malformed
   * identifier as if it had been verified. Absent on values the client built and has not sent yet.
   */
  cuit_valido?: boolean | null;
  direccion?: string | null;
  codigo_oficial?: string | null;
  contacto?: string | null;
}


export interface Veterinarian {
  id: number;
  company_id: number;
  name: string;
  license_number: string;
  user_id: number | null;
  /** ADR-38: identity of the person, and of the entity they invoice under. */
  cuit: string | null;
  billing_cuit: string | null;
  accreditation_code: string | null;
  phone: string | null;
  email: string | null;
  is_active: boolean;
}

export interface ProtocolAttachment {
  id: number;
  diagnostic_protocol_id: number;
  file_name: string;
  mime_type: string;
  file_size: number;
  checksum_sha256: string | null;
  /** HEIC photos from iPhone are stored but cannot be rendered by the browser. */
  needs_conversion: boolean;
  /** Short lived signed URL; never a public path. */
  download_url: string | null;
}

export interface ProtocolLabSample {
  id: number;
  caravan_id: number;
  caravan_number: string | null;
  pathogen_id: number | null;
  pathogen_code: string | null;
  pathogen_name: string | null;
  sample_type: SampleType;
  sample_round: number;
  sample_date: string | null;
  result_date: string | null;
  tube_number: string | null;
  status: LabSampleStatus;
  /** ADR-26: the day this tube was drawn, which may differ from the act's opening date. */
  extracted_on: string | null;
  /** ADR-30: NULL means the tube never left the professional's hands. */
  sample_shipment_id: number | null;
  notes: string | null;
}

/**
 * ADR-30 / ADR-36: one dispatch of tubes, declared by the professional who made it. It belongs
 * to the establishment, not to an act: one cooler is one row even carrying several chute
 * sessions.
 */
export interface SampleShipment {
  id: number;
  company_id: number;
  shipped_on: string;
  institution: InstitutionMeta;
  cold_chain_ok: boolean;
  condition_notes: string | null;
  declared_by_veterinarian_id: number;
  declared_by_name: string;
  declared_at: string;
  samples_count: number;
  /** ADR-36: how many chute sessions this box covers. */
  acts_covered: number;
  samples: {
    id: number;
    caravan_id: number;
    caravan_number: string | null;
    extraction_act_id: number | null;
    sample_type: SampleType;
    tube_number: string | null;
    extracted_on: string | null;
    status: LabSampleStatus;
  }[];
  is_voided: boolean;
  void_reason: string | null;
  voided_at: string | null;
  /** ADR-37: once a report cited it, corrections go through void and reissue. */
  is_cited_by_report: boolean;
  is_editable: boolean;
}

/** A tube still in the professional's hands, across every act of theirs at once. */
export interface PendingTube {
  id: number;
  caravan_id: number;
  caravan_number: string | null;
  extraction_act_id: number;
  act_number: string | null;
  sample_type: SampleType;
  tube_number: string | null;
  extracted_on: string | null;
  destination_plan?: SampleDestinationPlan | null;
  /** ADR-39 rev.: a dónde declaró el acta que iban estos tubos. Null si todavía nadie lo dijo. */
  destination_institution?: InstitutionMeta | null;
}

export interface RegisterSampleShipmentInput {
  shipped_on: string;
  cold_chain_ok: boolean;
  institution: InstitutionMeta;
  /** §4: mandatory when the cold chain broke — the professional's judgement in writing. */
  condition_notes?: string | null;
  sample_ids: number[];
}

export interface DiagnosticProtocol {
  id: number;
  company_id: number;
  protocol_number: string;
  protocol_type: DiagnosticProtocolType;
  protocol_type_label: string;
  parent_protocol_id: number | null;
  sample_date: string;
  /** Null on an extraction act: the laboratory has not spoken yet. */
  result_date: string | null;
  dispatch_note_number: string | null;
  dispatched_at: string | null;
  source_channel: DiagnosticSourceChannel;
  status: ProtocolStatus;
  verification_status: ProtocolVerificationStatus;
  veterinarian_id: number | null;
  veterinarian_name: string | null;

  signed_at: string | null;
  signed_license_number: string | null;
  signed_veterinarian_name: string | null;
  /** ADR-38: the signature attests a person; both CUITs travel frozen with it. */
  signed_cuit: string | null;
  signed_billing_cuit: string | null;
  is_signed: boolean;
  can_be_signed: boolean;
  can_receive_lab_report: boolean;

  /** ADR-39: the centre the act was drawn at, and what the professional planned to do. */
  act_institution: InstitutionMeta | null;
  destination_plan: SampleDestinationPlan;
  destination_plan_label: string;
  /** ADR-39 rev.: el destinatario declarado al despachar. No es act_institution, que es el remitente. */
  destination_institution: InstitutionMeta | null;

  /** ADR-29: the centre the report was filed from. Present on every report. */
  reporting_institution: InstitutionMeta | null;
  /** ADR-31 (rev.): the third party that ran the assay. Only on a declared derivation. */
  analysing_institution: InstitutionMeta | null;
  is_derived: boolean;
  requires_analysis_attachment: boolean;

  // ADR-30: where the tubes are, read from the tubes themselves.
  shipped_samples_count: number;
  unshipped_samples_count: number;
  has_unshipped_samples: boolean;

  observations: string | null;
  created_by_user_id: number | null;
  voided_at: string | null;
  void_reason: string | null;
  samples_count: number;
  pending_samples_count: number;
  positive_findings_count: number;
  attachments: ProtocolAttachment[];
  lab_samples: ProtocolLabSample[];
}

/** One cell of the results grid. Negatives are persisted exactly like positives. */
export interface ProtocolSampleLineInput {
  caravan_id: number;
  pathogen_id: number;
  sample_type: SampleType;
  sample_round: number;
  status: LabSampleStatus;
  tube_number?: string | null;
  notes?: string | null;
}

export interface CreateDiagnosticProtocolInput {
  protocol_number: string;
  veterinarian_id: number | null;
  sample_date: string;
  result_date: string;
  source_channel: DiagnosticSourceChannel;
  observations?: string | null;
  samples: ProtocolSampleLineInput[];
  attachments: File[];
}

export interface DiagnosticProtocolFilters {
  status?: ProtocolStatus | '';
  source_channel?: DiagnosticSourceChannel | '';
  verification_status?: ProtocolVerificationStatus | '';
  veterinarian_id?: number | '';
  from_date?: string;
  to_date?: string;
  search?: string;
}

/** The institution answering for the samples handled in this portal session (ADR-15). */

export interface VeterinaryPortalSession {
  /** ADR-38: both CUITs travel with the session, for the attachment rule. */
  veterinarian: {
    id: number;
    name: string;
    license_number: string;
    cuit: string | null;
    billing_cuit: string | null;
  };
  access_mode: VeterinaryPortalAccessMode;
  company_id: number;
  /** True when a management user is looking at this portal: reads everything, writes nothing. */
  is_read_only: boolean;
  allowed_batch_ids: number[];
  /** Non empty when the link was issued for specific extraction acts (ADR-16). */
  scoped_to_act_ids: number[];
}

/** One row of the professional's inbox. */
export interface PendingActSummary {
  id: number;
  protocol_number: string;
  sample_date: string;
  status: ProtocolStatus;
  verification_status: ProtocolVerificationStatus;
  is_signed: boolean;
  bulls_count: number;
  samples_count: number;
  pending_samples_count: number;
  dispatch_note_number: string | null;
  observations: string | null;
}

export interface PortalBull {
  caravan_id: number;
  identification: string;
  batch_id: number | null;
  aptitude_status: string;
  scrotal_circumference_cm: number | null;
  body_condition_score: number | null;
  last_evaluation_date: string | null;
}

export interface VeterinaryPortalWorkspace {
  veterinarian: { id: number; name: string; license_number: string };
  access_mode: VeterinaryPortalAccessMode;
  company_id: number;
  scoped_to_act_ids: number[];
  batches: { id: number; name: string }[];
  bulls: PortalBull[];
  /** Acts of this professional still awaiting their signature. */
  pending_signature: PendingActSummary[];
  /** Signed acts whose tubes are still awaiting a laboratory report. */
  pending_lab_report: PendingActSummary[];
}

export interface PortalBullEvaluationInput {
  caravan_id: number;
  scrotal_circumference_cm?: number | null;
  body_condition_score?: number | null;
  aplomo_notes?: string | null;
  libido?: string;
  observations?: string | null;
  samples: Omit<ProtocolSampleLineInput, 'caravan_id'>[];
}

export interface ProcessVetPortalEvaluationInput {
  batch_id: number;
  protocol_number: string;
  sample_date: string;
  result_date: string;
  observations?: string | null;
  bulls: PortalBullEvaluationInput[];
}

export interface VeterinaryPortalAccessToken {
  id: number;
  veterinarian_id: number;
  veterinarian_name: string | null;
  license_number: string | null;
  batch_id: number | null;
  batch_name: string | null;
  diagnostic_protocol_id: number | null;
  protocol_number: string | null;
  is_scoped_to_act: boolean;
  allowed_batch_ids: number[];
  label: string | null;
  token_prefix: string;
  expires_at: string;
  max_uses: number | null;
  used_count: number;
  last_used_at: string | null;
  revoked_at: string | null;
  is_usable: boolean;
  /** Returned only on the response that mints the grant. Never retrievable again. */
  plain_token: string | null;
  access_url: string | null;
}

export interface IssueVeterinaryPortalTokenInput {
  veterinarian_id: number;
  batch_id?: number | null;
  /** ADR-16: narrowest and preferred scope — this link opens one extraction act. */
  diagnostic_protocol_id?: number | null;
  /** Delivery happens here or never: the plaintext link exists only in this response. */
  send_email?: boolean;
  recipient_email?: string | null;
  sender_note?: string | null;
  label?: string | null;
  ttl_hours?: number;
  max_uses?: number | null;
}


/* -------------------------------------------------------------------------
 * Chute sheet -> extraction act (ADR-11 / ADR-12 / ADR-13)
 * ---------------------------------------------------------------------- */

/** One row of the chute sheet: what was measured, and which tubes were drawn. */
export interface EvaluationSheetLineInput {
  caravan_id: number;
  scrotal_circumference_cm?: number | null;
  body_condition_score?: number | null;
  libido?: string;
  aplomo_notes?: string | null;
  observations?: string | null;
  prepuce_scrape: boolean;
  prepuce_scrape_tube?: string | null;
  blood_serology: boolean;
  blood_serology_tube?: string | null;
  /** ADR-26: this animal's own chute day. Omitted, it inherits the act's opening date. */
  extracted_on?: string | null;
}

/**
 * Note what is absent: no protocol number. The act number is minted by the backend and the
 * laboratory report number does not exist yet — the tubes have not left the farm.
 */
export interface RegisterEvaluationSheetInput {
  veterinarian_id: number;
  evaluation_date: string;
  sample_round: number;
  /** ADR-39: optional — a field sampling may have no centre behind it. */
  institution?: InstitutionMeta | null;
  destination_plan?: SampleDestinationPlan | null;
  dispatch_note_number?: string | null;
  dispatched_at?: string | null;
  observations?: string | null;
  bulls: EvaluationSheetLineInput[];
}

export interface SignExtractionActInput {
  observations?: string | null;
  /** ADR-39: last chance to correct what the chute declared, before it is frozen. */
  institution?: InstitutionMeta | null;
  destination_plan?: SampleDestinationPlan | null;
  dispatch_note_number?: string | null;
  dispatched_at?: string | null;
}

export interface LabReportLineInput {
  sample_id: number;
  status: LabSampleStatus;
  notes?: string | null;
}

export interface RegisterLabReportInput {
  /** ADR-35 (rev.): mandatory on a declared derivation. */
  attachments?: File[];
  /** ADR-29: the centre the report is filed from. Always required. */
  reporting_institution: InstitutionMeta;
  /** ADR-31 (rev.): declared by the professional, never deduced from a CUIT. */
  is_derived?: boolean;
  /** ADR-31 (rev.): who processed it, when it was derived. */
  analysing_institution?: InstitutionMeta | null;
  lab_report_number: string;
  result_date: string;
  observations?: string | null;
  lines: LabReportLineInput[];
}

export interface PortalPendingActs {
  pending_signature: DiagnosticProtocol[];
  pending_lab_report: DiagnosticProtocol[];
}

/** Outcome of the email delivery attached to an issue/reissue response. */
export interface PortalAccessEmailResult {
  sent: boolean;
  recipient: string | null;
  error: string | null;
}

/**
 * One row of the establishment's directory of portals.
 *
 * Organised by PROFESSIONAL, not by token: the screen exists to answer "what is going on in each
 * of my professionals' portals", and a professional holding no key is precisely the case the
 * token-centric screen could not show.
 */
export interface PortalDirectoryRow {
  veterinarian_id: number;
  name: string;
  license_number: string;
  email: string | null;
  phone: string | null;
  is_active: boolean;

  /** ADR-33: without an account the professional depends on a temporary link. */
  user_id: number | null;
  has_portal_account: boolean;

  /** What the portal owes: acts to sign, signed acts with no result, tubes still in hand. */
  pending_signature_count: number;
  pending_lab_report_count: number;
  unshipped_samples_count: number;

  /** ADR-34: the temporary link survives as a secondary way in. */
  active_token_count: number;
  token_expires_at: string | null;
  last_portal_access_at: string | null;
}

export interface IssuedPortalToken {
  token: VeterinaryPortalAccessToken;
  email: PortalAccessEmailResult;
}

export interface ReissuePortalTokenInput {
  send_email?: boolean;
  recipient_email?: string | null;
  sender_note?: string | null;
  ttl_hours?: number;
}
