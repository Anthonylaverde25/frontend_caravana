export interface ServiceBatchDetailDTO {
  id?: number;
  female_category_id: number;
  female_category_name?: string;
  female_category_code?: string;
  female_subcategory_id?: number | null;
  female_subcategory_name?: string;
  female_subcategory_code?: string;
  male_category_id: number;
  male_category_name?: string;
  male_category_code?: string;
  target_bull_ratio?: number;
  planned_start_date?: string | null;
  planned_end_date?: string | null;
  notes?: string | null;
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
  batch_type_id?: number;
  batch_type_name?: string;
  batch_type_code?: string;
  weight?: number;
  current_weight?: number;
  min_weight?: number | null;
  max_weight?: number | null;
  knows_to_eat?: boolean;
  age_in_months?: number | null;
  caravans_count?: number;
  observaciones?: string;
  is_active: boolean;
  is_system?: boolean;
  is_service_batch?: boolean;
  service_detail?: ServiceBatchDetailDTO | null;
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
  age_in_months?: number | null;
  observaciones?: string;
}

export interface CreateServiceBatchRequest {
  name: string;
  female_category_id: number;
  female_subcategory_id?: number | null;
  male_category_id: number;
  female_caravan_ids?: number[];
  male_caravan_ids?: number[];
  farm_id?: number | null;
  target_bull_ratio?: number;
  planned_start_date?: string | null;
  planned_end_date?: string | null;
  notes?: string | null;
  observaciones?: string | null;
  auto_create_service_order?: boolean;
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
    public readonly batch_type_id?: number,
    public readonly batch_type_name?: string,
    public readonly batch_type_code?: string,
    public readonly weight?: number,
    public readonly current_weight?: number,
    public readonly min_weight?: number | null,
    public readonly max_weight?: number | null,
    public readonly knows_to_eat?: boolean,
    public readonly age_in_months?: number | null,
    public readonly caravans_count?: number,
    public readonly observaciones?: string,
    public readonly is_system: boolean = false,
    public readonly is_service_batch: boolean = false,
    public readonly service_detail?: ServiceBatchDetailDTO | null,
    public readonly created_at?: string,
  ) { }

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
      dto.batch_type_id,
      dto.batch_type_name,
      dto.batch_type_code,
      dto.weight,
      dto.current_weight,
      dto.min_weight,
      dto.max_weight,
      dto.knows_to_eat,
      dto.age_in_months,
      dto.caravans_count,
      dto.observaciones,
      dto.is_system ?? false,
      dto.is_service_batch ?? dto.batch_type_code === 'SERVICE',
      dto.service_detail ?? null,
      dto.created_at
    );
  }

  // Domain Behaviors
  public hasFarm(): boolean {
    return !!this.farm_id && this.farm_id > 0;
  }

  public isActive(): boolean {
    return this.is_active;
  }

  public isService(): boolean {
    return this.is_service_batch || this.batch_type_code === 'SERVICE';
  }

  public getFarm() {
    return {
      id: this.farm_id ?? 0,
      name: this.farm_name,
    }
  }
}
