export interface SireDTO {
  id: number;
  identification: string;
  is_confirmed: boolean;
}

export interface GestationDTO {
  id?: number;
  start_date: string | null;
  estimated_due_date: string | null;
  gestation_stage: string;
  gestation_months: number;
  is_current: boolean;
  notes?: string | null;
  sires?: SireDTO[];
}

export interface RegisterBirthDTO {
  calf_identification: string;
  calf_sex: 'M' | 'H';
  calf_category?: string | null;
  calf_teeth?: number | null;
  calf_weight?: number | null;
  calf_breed_id?: number | null;
  birth_date: string;
  batch_id: number;
  mother_id: number;
  father_id?: number | null;
  gestation_id?: number | null;
}

export interface LineageDTO {
  mother_id?: number | null;
  mother_identification?: string | null;
  father_id?: number | null;
  father_identification?: string | null;
  birth_date?: string | null;
  is_nursing?: boolean | null;
  sire_assigned_at?: string | null;
  sire_identification_method?: string | null;
  sire_notes?: string | null;
}


export interface PhysiologicalStateDTO {
  code: string;
  label: string;
  is_pregnant: boolean | null;
  is_nursing: boolean | null;
  gestation_stage?: string | null;
  gestation_months?: number | null;
}

/**
 * CaravanDTO
 * Mirrors the shape returned by the backend's CaravanResource.
 */
export interface CaravanDTO {
  id?: number;
  identification: string;
  category?: string | null;
  category_id?: number | null;
  category_code?: string | null;
  category_name?: string | null;
  subcategory_id?: number | null;
  subcategory_code?: string | null;
  subcategory_name?: string | null;
  teeth: number;
  entry_weight?: number | null;
  exit_weight?: number | null;
  breed?: string | null;
  sex?: 'M' | 'H' | null;
  entry_date?: string | null;
  renspa?: string;
  provider_id?: number | null;
  provider_name?: string | null;
  provenance?: Record<string, any> | null;
  is_operational?: boolean;
  batch_id?: number | null;
  batch?: {
    id: number;
    name: string;
    farm_name?: string;
  } | null;
  farm_name?: string | null;
  current_weight?: number | null;
  female_details?: {
    is_empty: boolean;
    arrival_category: string;
  } | null;
  active_gestation?: GestationDTO | null;
  lineage?: LineageDTO | null;
  physiological_state?: PhysiologicalStateDTO | null;
}

/**
 * CreateCaravanRequest
 * Payload sent to POST /caravans (upsert).
 */
export interface CreateCaravanRequest {
  identification: string;
  category?: string | null;
  category_id?: number | null;
  subcategory_id?: number | null;
  teeth: number;
  entry_weight?: number | null;
  breed?: string | null;
  breed_id?: number | null;
  sex?: 'M' | 'H' | null;
  batch_id?: number | null;
  farm_id?: number | null;
  is_empty?: boolean | null;
  gestation_stage?: string | null;
  gestation_months?: number | null;
  entry_date?: string | null;
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
    public readonly sex: 'M' | 'H' | null,
    public readonly category: string | null,
    public readonly breed: string | null,
    public readonly entry_weight: number | null,
    public readonly exit_weight: number | null,
    public readonly entry_date: string | null,
    public readonly batch_id: number | null,
    public readonly batch_name: string | null,
    public readonly current_weight: number | null,
    public readonly female_details: { is_empty: boolean; arrival_category: string } | null,
    public readonly active_gestation: GestationDTO | null,
    public readonly lineage: LineageDTO | null,
    public readonly renspa: string = 'NO_DEFINIDO',
    public readonly provider_id: number | null = null,
    public readonly provider_name: string | null = null,
    public readonly provenance: Record<string, any> | null = null,
    public readonly is_operational: boolean = true,
    public readonly farm_name: string | null = null,
    public readonly category_id: number | null = null,
    public readonly category_code: string | null = null,
    public readonly category_name: string | null = null,
    public readonly subcategory_id: number | null = null,
    public readonly subcategory_code: string | null = null,
    public readonly subcategory_name: string | null = null,
    public readonly physiological_state: PhysiologicalStateDTO | null = null,
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
      dto.current_weight ?? null,
      dto.female_details ?? null,
      dto.active_gestation ?? null,
      dto.lineage ?? null,
      dto.renspa ?? 'NO_DEFINIDO',
      dto.provider_id ?? null,
      dto.provider_name ?? null,
      dto.provenance ?? null,
      dto.is_operational ?? true,
      dto.farm_name ?? (dto.batch as any)?.farm_name ?? null,
      dto.category_id ?? null,
      dto.category_code ?? null,
      dto.category_name ?? null,
      dto.subcategory_id ?? null,
      dto.subcategory_code ?? null,
      dto.subcategory_name ?? null,
      dto.physiological_state ?? null,
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
