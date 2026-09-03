export type BoardTemplateType = 'GENERAL' | 'HEALTH' | 'REPRODUCTIVE' | 'PASTURE' | 'BLANK';

export interface DashboardWidget {
  id: string;
  type: 'SUMMARY_KPIS' | 'HEALTH_CHARTS' | 'HEALTH_TABLES' | 'REPRODUCTIVE_PROGRESS' | 'REPRODUCTIVE_TABLE' | 'PASTURE_CHART' | 'PASTURE_TABLE';
  title: string;
}

export interface DashboardBoard {
  id: string;
  name: string;
  icon: string;
  color?: string;
  templateType: BoardTemplateType;
  widgets?: DashboardWidget[];
  isCustom?: boolean;
}
