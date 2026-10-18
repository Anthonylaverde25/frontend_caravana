import { Batch } from '@/core/batches/domain/entities/Batch';

export interface FarmDTO {
  id?: number;
  name: string;
  /** Optional: a provider's farm may be loaded before its RENSPA is known. */
  renspa: string | null;
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
    public readonly renspa: string | null,
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
    if (dto.provider_id <= 0) {
      throw new Error('Farm must be associated with a valid provider');
    }

    return new Farm(
      dto.id ?? 0,
      dto.name,
      dto.renspa && dto.renspa.trim() !== '' ? dto.renspa : null,
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
