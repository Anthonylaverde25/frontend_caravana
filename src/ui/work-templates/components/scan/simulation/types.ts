export type SimulationScenario =
  | 'HAPPY_PATH'
  | 'WARNINGS'
  | 'REPAIR_ERROR'
  | 'MULTI_PAGE'
  /** One destination per animal, with the M cell of each destination batch filled in. */
  | 'PER_ANIMAL'
  /** A sheet printed from a transfer order: the code in its header box resolves the order. */
  | 'TRANSFER_ORDER'
  /** A catalogue of presets, one per test sheet of the template, picked from a list. */
  | 'SHEET_CASES';

export interface SimulationPreset {
  templateCode: string;
  scenario: SimulationScenario;
  scenarioLabel: string;
  scenarioDescription: string;
  templateTitle: string;
  category: 'ENTRY' | 'REPRODUCTIVE' | 'WEANING' | 'WEIGHT' | 'ACTIVITY';
  context: Record<string, any>;
  rows: any[];
  pages?: any[];
  mockErrors?: {
    headerErrors?: Array<{ field: string; code: string; message: string }>;
    rowErrors?: Array<{ row_index: number; caravana: string; errors: Array<{ code: string; message: string }> }>;
  };
}

export interface SimulationTemplateInfo {
  code: string;
  title: string;
  category: 'ENTRY' | 'REPRODUCTIVE' | 'WEANING' | 'WEIGHT' | 'ACTIVITY';
  categoryLabel: string;
  color: string;
  description: string;
  availableScenarios: SimulationScenario[];
}
