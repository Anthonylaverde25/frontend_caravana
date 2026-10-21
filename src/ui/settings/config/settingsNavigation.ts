export type SettingsSectionId =
  | 'company'
  | 'activities'
  | 'dentition'
  | 'breeds'
  | 'weighing-types'
  | 'animal-categories'
  | 'appearance';

export interface SettingsNavItemConfig {
  id: SettingsSectionId;
  title: string;
  subtitle: string;
  icon: string;
  badge?: string | number;
  badgeColor?: 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
}

export interface SettingsNavGroupConfig {
  groupId: string;
  groupTitle: string;
  items: SettingsNavItemConfig[];
}

export const SETTINGS_NAVIGATION_GROUPS: SettingsNavGroupConfig[] = [
  {
    groupId: 'general-fiscal',
    groupTitle: 'Empresa & Fiscal',
    items: [
      {
        id: 'company',
        title: 'Empresa & Perfil Fiscal',
        subtitle: 'Razón Social, CUIT, RENSPA y sede',
        icon: 'heroicons-outline:building-office',
      },
    ],
  },
  {
    groupId: 'livestock-zootechnics',
    groupTitle: 'Zootecnia & Rodeo',
    items: [
      {
        id: 'activities',
        title: 'Flujo Productivo & Actividades',
        subtitle: 'Ciclo ganadero (Cría, Recría, Invernada)',
        icon: 'heroicons-outline:arrows-right-left',
      },
      {
        id: 'dentition',
        title: 'Escala de Dentición',
        subtitle: 'Cronometría dentaria bovina (0D - 8D)',
        icon: 'heroicons-outline:identification',
      },
      {
        id: 'breeds',
        title: 'Catálogo Genético & Razas',
        subtitle: 'Razas y biotipos de la hacienda',
        icon: 'heroicons-outline:tag',
      },
      {
        id: 'weighing-types',
        title: 'Tipos de Pesaje & Eventos',
        subtitle: 'Báscula, controles y propósitos',
        icon: 'heroicons-outline:scale',
      },
      {
        id: 'animal-categories',
        title: 'Categorías Zootécnicas',
        subtitle: 'Clasificación bovina y pesos objetivos',
        icon: 'heroicons-outline:user-group',
      },
    ],
  },
  {
    groupId: 'system-preferences',
    groupTitle: 'Sistema & Operación',
    items: [
      {
        id: 'appearance',
        title: 'Visibilidad & Manga',
        subtitle: 'Contraste para luz solar y campo',
        icon: 'heroicons-outline:sun',
      },
    ],
  },
];
