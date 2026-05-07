import { Batch } from '@/core/batches/domain/entities/Batch';

export interface FarmDTO {
  id?: number;
  name: string;
  renspa: string;
  location: string | null;
  provider_id: number;
  is_active: boolean;
  caravans_count?: number;
  batches?: Batch[];
  created_at?: string;
}

export class Farm {
  private constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly renspa: string,
    public readonly provider_id: number,
    public readonly is_active: boolean,
    public readonly location: string | null,
    public readonly caravans_count?: number,
    public readonly batches?: Batch[],
    public readonly created_at?: string,
  ) {}

  public static create(dto: FarmDTO): Farm {
    if (!dto.name || dto.name.trim() === '') {
      throw new Error('Farm name cannot be empty');
    }
    if (!dto.renspa || dto.renspa.trim() === '') {
      throw new Error('Farm RENSPA cannot be empty');
    }
    if (dto.provider_id <= 0) {
      throw new Error('Farm must be associated with a valid provider');
    }

    return new Farm(
      dto.id ?? 0,
      dto.name,
      dto.renspa,
      dto.provider_id,
      dto.is_active ?? true,
      dto.location,
      dto.caravans_count,
      dto.batches,
      dto.created_at
    );
  }

  // Domain Behaviors
  public hasBatches(): boolean {
    return this.batches !== undefined && this.batches.length > 0;
  }

  public isActive(): boolean {
    return this.is_active;
  }
}
