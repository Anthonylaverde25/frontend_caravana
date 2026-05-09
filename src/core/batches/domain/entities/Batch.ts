export interface BatchDTO {
  id?: number;
  name: string;
  farm_id: number;
  farm_name?: string;
  provider_id?: number;
  provider_name?: string;
  observaciones?: string;
  is_active: boolean;
  created_at?: string;
}

export interface CreateBatchRequest {
  name: string;
  farm_id: number;
  observaciones?: string;
}

/**
 * Rich Entity for Batch (Lote)
 */
export class Batch {
  private constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly farm_id: number,
    public readonly is_active: boolean,
    public readonly farm_name?: string,
    public readonly provider_id?: number,
    public readonly provider_name?: string,
    public readonly observaciones?: string,
    public readonly created_at?: string,
  ) { }

  public static create(dto: BatchDTO): Batch {
    if (!dto.name || dto.name.trim() === '') {
      throw new Error('Batch name cannot be empty');
    }
    if (dto.farm_id === undefined || dto.farm_id === null) {
      throw new Error('Batch must be associated with a valid farm');
    }

    return new Batch(
      dto.id ?? 0,
      dto.name,
      dto.farm_id,
      dto.is_active ?? true,
      dto.farm_name,
      dto.provider_id,
      dto.provider_name,
      dto.observaciones,
      dto.created_at
    );
  }

  // Domain Behaviors
  public hasFarm(): boolean {
    return this.farm_id > 0;
  }

  public isActive(): boolean {
    return this.is_active;
  }

  public getFarm() {
    return {
      id: this.farm_id,
      name: this.farm_name,

    }
  }
}
