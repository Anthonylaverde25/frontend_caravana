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
  observaciones?: string;
  is_active: boolean;
  is_system?: boolean;
  created_at?: string;
}

export interface CreateBatchRequest {
  name: string;
  farm_id?: number | null;
  activity_id?: number;
  batch_type_id: number;
  weight?: number;
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
    public readonly batch_type_id?: number,
    public readonly batch_type_name?: string,
    public readonly batch_type_code?: string,
    public readonly weight?: number,
    public readonly current_weight?: number,
    public readonly observaciones?: string,
    public readonly is_system: boolean = false,
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
      dto.observaciones,
      dto.is_system ?? false,
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

  public getFarm() {
    return {
      id: this.farm_id ?? 0,
      name: this.farm_name,
    }
  }
}
