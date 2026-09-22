export type SimulationScenario = 'HAPPY_PATH' | 'WARNINGS' | 'REPAIR_ERROR' | 'MULTI_PAGE';

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
