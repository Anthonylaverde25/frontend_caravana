import type { NotInseminatedReason } from '../hooks/useServiceOrders';

/** One straw application of an AI order (semen S-B), as the order's detail lists it. */
export interface Insemination {
  id: number;
  female_caravan_id: number;
  identification: string;
  inseminated_on: string;
  item_id: number;
  item_name: string;
  semen_type: string | null;
  sire_name: string | null;
  semen_lot_id: number | null;
  lot_code: string | null;
  straws_used: number;
  warehouse_id: number;
  warehouse_code: string | null;
  warehouse_name: string | null;
  document_id: number | null;
  document_number: number | null;
  notes: string | null;
  voided_at: string | null;
  void_reason: string | null;
}

/** A row of the insemination sheet sent to the backend; without lot = "Sin identificar" (IA8). */
export interface InseminationRowPayload {
  female_caravan_id: number;
  inseminated_on: string;
  item_id: number;
  semen_lot_id: number | null;
  straws_used: number;
  warehouse_id: number;
  notes?: string | null;
}

/** Straws in the tanks against what the open AI orders still expect (P4, IA5). */
export interface SemenCoverage {
  item_id: number;
  balance: number;
  committed: number;
  extra: number;
  shortage: number;
}

export const NOT_INSEMINATED_REASON_LABELS: Record<NotInseminatedReason, string> = {
  NOT_PRESENTED: 'No se presentó',
  DEVICE_LOST: 'Perdió el dispositivo',
  DISCARDED: 'Descartada en la manga',
  OTHER: 'Otro motivo',
};
