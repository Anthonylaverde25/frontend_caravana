/**
 * The service running on a batch (DRAFT or APPROVED). A service is an order over the batch, not a
 * batch of its own: the batch keeps its animals and the order keeps the policies and the trace.
 */
export interface ActiveServiceOrderSummary {
  id: number;
  code: string;
  status: 'DRAFT' | 'APPROVED';
  planned_start_date?: string | null;
  is_controlled_service: boolean;
}

/** The entry order an external batch was born from (a purchase waiting for, or fed by, its DTEs). */
export interface BatchEntryOrderSummary {
  id: number;
  code: string;
  status: 'DRAFT' | 'AWAITING_DTE' | 'IN_TRANSIT' | 'RECEIVED' | 'COMPLETED' | 'CLOSED_INCOMPLETE' | 'CANCELLED';
  status_label: string;
  head_count: number;
  with_dte_count: number;
  received_count: number;
  in_transit_count: number;
  open_incidents_count: number;
}

/**
 * An open purchase that brings animals to an own batch: by a destination rule of its order
 * ("Ternero · machos"), or with head already received there that still wait for their caravan.
 */
export interface BatchIncomingEntryOrder {
  id: number;
  code: string;
  status: string;
  status_label: string;
  /** The rules of the order that send animals to this batch. */
  rules: string[];
  /** Head of the whole order still on their way (not split by batch when it has several). */
  in_transit_count: number;
  /** Head received by count in this batch, their caravans still to write. */
  pending_count: number;
  /** The order sends all its animals to this batch. */
  single_destination: boolean;
}

export interface BatchDTO {
  id?: number;
  name: string;
  farm_id?: number | null;
  farm_name?: string;
  provider_id?: number;
  provider_name?: string;
  activity_id?: number;
  activity_name?: string;
  activity_code?: string;
  batch_type_id?: number;
  batch_type_name?: string;
  batch_type_code?: string;
  weight?: number;
  current_weight?: number;
  min_weight?: number | null;
  max_weight?: number | null;
  knows_to_eat?: boolean;
  is_confined?: boolean | null;
  age_in_months?: number | null;
  caravans_count?: number;
  /** Head received by count whose caravans are still to write: in the batch, not yet caravans. */
  pending_identification_count?: number;
  /** Caravans plus head pending identification: what the stock views count. */
  head_count?: number | null;
  /** Measured mass: the sum over the animals with a current weight (additive, unlike the average). */
  total_weight?: number | null;
  /** Head with a current weight: the set the average is computed over. */
  weighed_count?: number | null;
  /** Calves at foot (unweaned) inside head_count: born into their mother's batch. */
  nursing_count?: number | null;
  /** Calves at foot inside weighed_count. */
  nursing_weighed_count?: number | null;
  /** Kilos of the calves at foot inside total_weight. */
  nursing_total_weight?: number | null;
  /** The batch's RENSPA: its provider farm's when external, the company's when own. */
  renspa?: string | null;
  incoming_entry_orders?: BatchIncomingEntryOrder[];
  observaciones?: string;
  is_active: boolean;
  is_system?: boolean;
  is_weaning_batch?: boolean;
  /** An APPROVED service runs on the batch (the bulls are with the females). */
  is_in_service?: boolean;
  active_service_order?: ActiveServiceOrderSummary | null;
  entry_order?: BatchEntryOrderSummary | null;
  created_at?: string;
}

export interface CreateBatchRequest {
  name: string;
  farm_id?: number | null;
  activity_id?: number;
  batch_type_id: number;
  weight?: number;
  min_weight?: number | null;
  max_weight?: number | null;
  knows_to_eat?: boolean;
  /**
   * Management system: true = confined (pen), false = extensive (pasture),
   * null = nobody declared it yet. The null is load-bearing: collapsing it into
   * false makes the screen assert a fact only the producer knows.
   */
  is_confined?: boolean | null;
  age_in_months?: number | null;
  observaciones?: string;
}

/**
 * Rich Entity for Batch (Lote)
 */
export class Batch {
  private constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly farm_id: number | null | undefined,
    public readonly is_active: boolean,
    public readonly farm_name?: string,
    public readonly provider_id?: number,
    public readonly provider_name?: string,
    public readonly activity_id?: number,
    public readonly activity_name?: string,
    public readonly activity_code?: string,
    public readonly batch_type_id?: number,
    public readonly batch_type_name?: string,
    public readonly batch_type_code?: string,
    public readonly weight?: number,
    public readonly current_weight?: number,
    public readonly min_weight?: number | null,
    public readonly max_weight?: number | null,
    public readonly knows_to_eat?: boolean,
    public readonly is_confined?: boolean | null,
    public readonly age_in_months?: number | null,
    public readonly caravans_count?: number,
    public readonly observaciones?: string,
    public readonly is_system: boolean = false,
    public readonly is_weaning_batch: boolean = false,
    public readonly is_in_service: boolean = false,
    public readonly active_service_order: ActiveServiceOrderSummary | null = null,
    public readonly created_at?: string,
    public readonly entry_order: BatchEntryOrderSummary | null = null,
    public readonly pending_identification_count = 0,
    public readonly incoming_entry_orders: BatchIncomingEntryOrder[] = [],
    public readonly total_weight: number | null = null,
    public readonly weighed_count: number | null = null,
    public readonly renspa: string | null = null,
    public readonly nursing_count = 0,
    public readonly nursing_weighed_count = 0,
    public readonly nursing_total_weight = 0
  ) {}

  public static create(dto: BatchDTO): Batch {
    if (!dto.name || dto.name.trim() === '') {
      throw new Error('Batch name cannot be empty');
    }

    return new Batch(
      dto.id ?? 0,
      dto.name,
      dto.farm_id ?? null,
      dto.is_active ?? true,
      dto.farm_name,
      dto.provider_id,
      dto.provider_name,
      dto.activity_id,
      dto.activity_name,
      dto.activity_code,
      dto.batch_type_id,
      dto.batch_type_name,
      dto.batch_type_code,
      dto.weight,
      dto.current_weight,
      dto.min_weight,
      dto.max_weight,
      dto.knows_to_eat,
      dto.is_confined ?? null,
      dto.age_in_months,
      dto.caravans_count,
      dto.observaciones,
      dto.is_system ?? false,
      dto.is_weaning_batch ?? (dto.batch_type_code === 'WEANING' || (dto.name ? dto.name.toLowerCase().includes('destete') : false)),
      dto.is_in_service ?? false,
      dto.active_service_order ?? null,
      dto.created_at,
      dto.entry_order ?? null,
      dto.pending_identification_count ?? 0,
      dto.incoming_entry_orders ?? [],
      dto.total_weight ?? null,
      dto.weighed_count ?? null,
      dto.renspa && dto.renspa !== 'NO_DEFINIDO' ? dto.renspa : null,
      dto.nursing_count ?? 0,
      dto.nursing_weighed_count ?? 0,
      dto.nursing_total_weight ?? 0
    );
  }

  /**
   * The head the batch holds: its caravans plus the head received by count still waiting for their
   * caravan. Operations on animals (transfers, weaning, services) count caravans instead.
   */
  public get head_count(): number {
    return (this.caravans_count ?? 0) + this.pending_identification_count;
  }

  // Domain Behaviors
  public hasFarm(): boolean {
    return !!this.farm_id && this.farm_id > 0;
  }

  public isActive(): boolean {
    return this.is_active;
  }

  /** A Cría batch is the only kind that can enter service. */
  public isCria(): boolean {
    return (this.activity_code ?? '').toUpperCase() === 'CRIA';
  }

  /** A service (DRAFT or APPROVED) is open on the batch, so another one cannot start. */
  public hasActiveService(): boolean {
    return this.active_service_order != null;
  }

  public isWeaning(): boolean {
    return this.is_weaning_batch || this.batch_type_code === 'WEANING' || (this.name ? this.name.toLowerCase().includes('destete') : false);
  }

  public getFarm() {
    return {
      id: this.farm_id ?? 0,
      name: this.farm_name,
    }
  }
}
