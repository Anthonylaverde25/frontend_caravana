import type { BirthOrder, EmitBirthOrderPayload } from '@/features/birth-orders/types';

/** "Nueva orden de parición" issues an order before the rounds; "Registrar partos" loads them afterwards. */
export type BirthFormMode = 'order' | 'register';

export interface BirthOrderHeader {
  periodStart: string;
  periodEnd: string;
  responsable: string;
  observations: string;
}

/**
 * What the start dialog declared, carried to the confirmation (and back, with "Editar") in the
 * navigation state. A draft being edited carries its id and code.
 */
export interface BirthOrderStart {
  orderId: number | null;
  orderCode: string | null;
  motherIds: number[];
  header: BirthOrderHeader;
  /** Coming from Monitoreo Gestacional: the batch whose pregnant females start chosen. */
  batchId?: number | null;
}

export const emptyBirthHeader = (): BirthOrderHeader => ({ periodStart: '', periodEnd: '', responsable: '', observations: '' });

export const startFromDraft = (order: BirthOrder): BirthOrderStart => ({
  orderId: order.id,
  orderCode: order.code,
  motherIds: order.animals.map((a) => a.caravan_id),
  header: {
    periodStart: order.period_start ?? '',
    periodEnd: order.period_end ?? '',
    responsable: order.responsable ?? '',
    observations: order.observations ?? ''
  }
});

export const toOrderPayload = (start: BirthOrderStart, issue: boolean): EmitBirthOrderPayload => ({
  period_start: start.header.periodStart || null,
  period_end: start.header.periodEnd || null,
  responsable: start.header.responsable.trim() || null,
  observations: start.header.observations.trim() || null,
  animals: start.motherIds.map((id) => ({ caravan_id: id })),
  issue
});
