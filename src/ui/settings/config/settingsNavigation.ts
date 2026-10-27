export type SettingsSectionId =
  | 'company'
  | 'activities'
  | 'animal-categories'
  | 'breeds'
  | 'dentition'
  | 'weighing-types'
  | 'warehouses'
  | 'item-units'
  | 'item-categories'
  | 'appearance'
  | 'ai-connections'
  | 'work-templates';

export interface SettingsNavItemConfig {
  id: SettingsSectionId;
  title: string;
  /** One line under the section title. */
  description: string;
}

export interface SettingsNavGroupConfig {
  groupId: string;
  groupTitle: string;
  items: SettingsNavItemConfig[];
}

/** The sections of /settings, as the inner menu groups them. The section lives in `?section=`. */
export const SETTINGS_NAVIGATION_GROUPS: SettingsNavGroupConfig[] = [
  {
    groupId: 'company',
    groupTitle: 'Empresa',
    items: [{ id: 'company', title: 'Datos de la empresa', description: 'Identificación fiscal y sanitaria del establecimiento.' }],
  },
  {
    groupId: 'livestock',
    groupTitle: 'Hacienda',
    items: [
      { id: 'activities', title: 'Actividades', description: 'Etapas del flujo productivo y en qué orden se recorren.' },
      { id: 'animal-categories', title: 'Categorías', description: 'Clasificación por sexo, edad y peso de referencia, con sus subcategorías.' },
      { id: 'breeds', title: 'Razas', description: 'Razas disponibles al cargar caravanas, tropas y órdenes de ingreso.' },
      { id: 'dentition', title: 'Dentición', description: 'Edad estimada por cronometría dentaria.' },
      { id: 'weighing-types', title: 'Tipos de pesaje', description: 'Para qué se pesa en manga y báscula, y si entra en la curva de ganancia.' },
      { id: 'work-templates', title: 'Plantillas de trabajo', description: 'Catálogo de planillas zootécnicas y documentos de manga listos para imprimir.' },
    ],
  },
  {
    groupId: 'supplies',
    groupTitle: 'Insumos',
    items: [
      { id: 'warehouses', title: 'Almacenes', description: 'Dónde se guarda el stock de la empresa.' },
      { id: 'item-units', title: 'Unidades de medida', description: 'En qué se mide lo que la empresa compra o usa.' },
      { id: 'item-categories', title: 'Categorías de insumos', description: 'Cómo se agrupan los artículos y servicios.' },
    ],
  },
  {
    groupId: 'system',
    groupTitle: 'Sistema',
    items: [
      { id: 'appearance', title: 'Apariencia', description: 'Tema de colores y contraste, también para trabajar en la manga a pleno sol.' },
      { id: 'ai-connections', title: 'Conexiones de IA', description: 'Consultá tu rodeo desde Claude o Gemini, con acceso de solo lectura.' },
    ],
  },
];

export const SETTINGS_SECTIONS: SettingsNavItemConfig[] = SETTINGS_NAVIGATION_GROUPS.flatMap((g) => g.items);

export const isSettingsSection = (value: string | null): value is SettingsSectionId =>
  SETTINGS_SECTIONS.some((s) => s.id === value);

export const settingsSection = (id: SettingsSectionId): SettingsNavItemConfig =>
  SETTINGS_SECTIONS.find((s) => s.id === id) ?? SETTINGS_SECTIONS[0];

export const settingsSectionPath = (id: SettingsSectionId): string => `/settings?section=${id}`;
