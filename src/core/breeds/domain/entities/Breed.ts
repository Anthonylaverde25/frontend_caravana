export interface BreedColor {
  id: number;
  name: string;
  code: string | null;
}

export interface Breed {
  id: number;
  name: string;
  /** The coat colours the breed admits (breed_color). */
  colors?: BreedColor[];
}
