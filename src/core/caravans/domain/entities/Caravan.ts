/**
 * CaravanDTO
 * Mirrors the shape returned by the backend's CaravanResource.
 */
export interface CaravanDTO {
  id?: number;
  identification: string;
  category?: string | null;
  teeth: number;
  entry_weight?: number | null;
  exit_weight?: number | null;
  breed?: string | null;
  sex?: string | null;
  entry_date?: string | null;
  batch_id?: number | null;
  batch?: {
    id: number;
    name: string;
  } | null;
}

/**
 * CreateCaravanRequest
 * Payload sent to POST /caravans (upsert).
 */
export interface CreateCaravanRequest {
  identification: string;
  category?: string | null;
  teeth: number;
  entry_weight?: number | null;
  breed?: string | null;
  breed_id?: number | null;
  sex?: string | null;
  batch_id?: number | null;
  farm_id?: number | null;
}

/**
 * Caravan — Rich Domain Entity
 * Encapsulates business rules for a tagged animal (caravana).
 */
export class Caravan {
  private constructor(
    public readonly id: number,
    public readonly identification: string,
    public readonly teeth: number,
    public readonly sex: string | null,
    public readonly category: string | null,
    public readonly breed: string | null,
    public readonly entry_weight: number | null,
    public readonly exit_weight: number | null,
    public readonly entry_date: string | null,
    public readonly batch_id: number | null,
    public readonly batch_name: string | null,
  ) {}

  public static create(dto: CaravanDTO): Caravan {
    if (!dto.identification || dto.identification.trim() === '') {
      throw new Error('Caravan identification cannot be empty.');
    }
    if (dto.teeth < 0 || dto.teeth > 99) {
      throw new Error('Teeth count must be between 0 and 99.');
    }

    return new Caravan(
      dto.id ?? 0,
      dto.identification.trim(),
      dto.teeth,
      dto.sex ?? null,
      dto.category ?? null,
      dto.breed ?? null,
      dto.entry_weight ?? null,
      dto.exit_weight ?? null,
      dto.entry_date ?? null,
      dto.batch_id ?? null,
      dto.batch?.name ?? null,
    );
  }

  // ── Domain Behaviors ──────────────────────────────────────────

  /** Whether the animal has been weighed at exit. */
  public hasExitWeight(): boolean {
    return this.exit_weight !== null;
  }

  /** Whether the animal belongs to a batch. */
  public isAssignedToBatch(): boolean {
    return this.batch_id !== null && this.batch_id > 0;
  }

  /**
   * Calculates total weight gain in kg.
   * Returns null if either weight is missing.
   */
  public weightGain(): number | null {
    if (this.entry_weight === null || this.exit_weight === null) {
      return null;
    }
    return this.exit_weight - this.entry_weight;
  }

  /** Whether this record has all required data for a complete report. */
  public isComplete(): boolean {
    return (
      this.identification !== '' &&
      this.sex !== null &&
      this.entry_weight !== null
    );
  }
}
