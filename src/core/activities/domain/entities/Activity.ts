/** A batch as it appears on the production sheet of its activity. */
export interface ActivityBatch {
  id: number;
  name: string;
  farmName: string;
  count: number;
  /** Average kg per head. Null when the batch is empty: an average of nothing is undefined. */
  current_weight?: number | null;
  /** Measured mass over the weighed animals. */
  total_weight?: number | null;
  /** Head the average was computed over; may be smaller than `count`. */
  weighed_count?: number | null;
  activityId?: number;
  batchTypeId?: number | null;
  batchTypeName?: string | null;
  batchTypeCode?: string | null;
  /**
   * Management system: true = confined (pen), false = extensive (pasture),
   * null = nobody declared it yet. The null is load-bearing: collapsing it into
   * false makes the screen assert a fact only the producer knows.
   */
  isConfined: boolean | null;
  /**
   * True when animals have left this batch. Distinguishes an emptied batch, which is
   * reusable and keeps its activity and type, from one that never held animals.
   */
  wasEmptied: boolean;
}

export interface Activity {
  id: number;
  name: string;
  code: string;
  isEnabled: boolean;
  isInitial: boolean;
  isFinal: boolean;
  sortOrder: number;
  batches: ActivityBatch[];
}
