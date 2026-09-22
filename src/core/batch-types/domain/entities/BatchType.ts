export interface BatchType {
  id: number;
  company_id: number;
  name: string;
  code: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  is_active: boolean;
  /**
   * Catalogue constraint: the activity this type is restricted to.
   * `null` means the type is cross-cutting and offered in every activity.
   */
  activity_id?: number | null;
  /**
   * Whether the type is offered in the manual selectors. Types created only by
   * dedicated paths of the system (the reserve batch) are not.
   */
  is_selectable?: boolean;
}
