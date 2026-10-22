export interface DentitionScaleItem {
  code: string;
  state: string;
  category: string;
  ageRange: string;
  /** What is seen in the mouth. */
  criterion: string;
  /** What it means for the animal's use. */
  note: string;
}

/** The reference scale of bovine dental chronometry used in field sheets and chute classification. */
export const DENTITION_SCALE: DentitionScaleItem[] = [
  {
    code: '0D',
    state: 'Boca de leche',
    category: 'Ternero / ternera',
    ageRange: 'hasta 18–20 meses',
    criterion: 'Piezas de leche, sin incisivos permanentes.',
    note: 'Lactancia o recría inicial; sin aptitud reproductiva ni terminación pesada.',
  },
  {
    code: '2D',
    state: '2 dientes',
    category: 'Vaquillona / novillito',
    ageRange: '18 a 24 meses',
    criterion: 'Pinzas centrales definitivas.',
    note: 'Edad estándar de entore o entrada a terminación intensiva.',
  },
  {
    code: '4D',
    state: '4 dientes',
    category: 'Desarrollo intermedio',
    ageRange: '24 a 32 meses',
    criterion: 'Primeros medianos permanentes.',
    note: 'Vaca de segunda parición o novillo terminado para exportación.',
  },
  {
    code: '6D',
    state: '6 dientes',
    category: 'Pre-adultez',
    ageRange: '32 a 40 meses',
    criterion: 'Segundos medianos definitivos.',
    note: 'Rodeo adulto en plena capacidad reproductiva y productiva.',
  },
  {
    code: '8D',
    state: 'Boca llena',
    category: 'Adulto completo',
    ageRange: 'desde 40–48 meses',
    criterion: 'Extremos permanentes: dentición completa.',
    note: 'Luego se juzga por enrase, desgaste y descarte (CUT).',
  },
];
