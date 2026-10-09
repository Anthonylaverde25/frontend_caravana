export type QuickActionCategory = 'Hacienda' | 'Digitalización' | 'Reproducción' | 'Movimientos';

export interface HeaderQuickAction {
  id: string;
  category: QuickActionCategory;
  title: string;
  subtitle: string;
  icon: string;
  route: string;
  color: string;
  shortcut?: string;
}
