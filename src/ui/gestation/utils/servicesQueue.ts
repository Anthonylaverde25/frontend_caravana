import type { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import { getServiceOrderPhase, PHASE_LABELS, type ServiceOrderPhase } from './serviceOrderPhase';
import { isOpenStatus } from './serviceOrderStatus';
import { computeServiceOrderTemporalStatus } from './serviceOrderTemporalStatus';
import { groupOrdersForTray, trayTimeLabel } from './diagnosisTray';
import { formatDay } from './reproductiveVerdict';

/**
 * Work queue of /gestation/services: every order with work left (emitted to approve, in service or
 * waiting for its diagnosis). Once closed or rejected it leaves the queue for the history, so an
 * order is never listed in both.
 */
export const QUEUE_PHASES = ['READY_TO_CLOSE', 'DIAGNOSING', 'BULLS_WITHDRAWN', 'INSEMINATING', 'IN_SERVICE', 'DRAFT'] as const satisfies readonly ServiceOrderPhase[];

export type QueuePhase = (typeof QUEUE_PHASES)[number];

/** Tiles of the phase strip, in the order the work happens; "Tacto" joins pending and in progress. */
export const QUEUE_STAGES = ['DRAFT', 'IN_SERVICE', 'INSEMINATING', 'TACTO', 'READY_TO_CLOSE'] as const;

export type QueueStage = (typeof QUEUE_STAGES)[number];

export const STAGE_OF: Record<QueuePhase, QueueStage> = {
  DRAFT: 'DRAFT',
  IN_SERVICE: 'IN_SERVICE',
  INSEMINATING: 'INSEMINATING',
  BULLS_WITHDRAWN: 'TACTO',
  DIAGNOSING: 'TACTO',
  READY_TO_CLOSE: 'READY_TO_CLOSE',
};

export const STAGE_LABELS: Record<QueueStage, string> = {
  DRAFT: 'Por aprobar',
  IN_SERVICE: 'En servicio',
  INSEMINATING: 'Inseminando',
  TACTO: 'Tacto',
  READY_TO_CLOSE: 'Lista para cerrar',
};

/** Palette path of each phase: its dot in the strip and its group row. */
export const QUEUE_PHASE_COLOR: Record<QueuePhase, 'success' | 'primary' | 'warning' | 'info' | 'grey'> = {
  READY_TO_CLOSE: 'success',
  DIAGNOSING: 'primary',
  BULLS_WITHDRAWN: 'warning',
  INSEMINATING: 'info',
  IN_SERVICE: 'info',
  DRAFT: 'grey',
};

export const STAGE_COLOR: Record<QueueStage, (typeof QUEUE_PHASE_COLOR)[QueuePhase]> = {
  DRAFT: 'grey',
  IN_SERVICE: 'info',
  INSEMINATING: 'info',
  TACTO: 'warning',
  READY_TO_CLOSE: 'success',
};

const QUEUE_SUBTITLES: Record<QueuePhase, string> = {
  READY_TO_CLOSE: 'Todos los vientres tienen diagnóstico: se pueden cerrar hoy.',
  DIAGNOSING: 'Faltan vientres o hay vacías provisorias para volver a tactar.',
  BULLS_WITHDRAWN: 'Toros retirados y sin tactar: esperan su primera ronda.',
  INSEMINATING: 'Inseminación artificial en curso.',
  IN_SERVICE: 'Toros en el lote: se puede tactar desde el primer día.',
  DRAFT: 'Emitidas: esperan la aprobación para empezar el servicio.',
};

export interface QueueSection {
  phase: QueuePhase;
  title: string;
  subtitle: string;
  orders: ServiceOrder[];
}

export function isQueueOrder(order: ServiceOrder): boolean {
  return order.status.toUpperCase() === 'DRAFT' || isOpenStatus(order.status);
}

export function queuePhaseOf(order: ServiceOrder): QueuePhase {
  return getServiceOrderPhase(order).phase as QueuePhase;
}

/** Queue orders grouped by phase, closest to closing first; empty phases are left out. */
export function groupQueueOrders(orders: ServiceOrder[]): QueueSection[] {
  const open = groupOrdersForTray(orders.filter((o) => isOpenStatus(o.status))).map((section) => ({
    ...section,
    subtitle: QUEUE_SUBTITLES[section.phase],
  }));
  const drafts = orders.filter((o) => o.status.toUpperCase() === 'DRAFT').sort((a, b) => a.id - b.id);
  if (drafts.length === 0) return open;
  return [...open, { phase: 'DRAFT', title: STAGE_LABELS.DRAFT, subtitle: QUEUE_SUBTITLES.DRAFT, orders: drafts }];
}

/** The one action that moves the order forward today; every other action goes to the ⋮ menu. */
export type NextStep = 'APPROVE' | 'INSEMINATE' | 'WITHDRAW_BULLS' | 'TACTO' | 'CLOSE';

export function getNextStep(order: ServiceOrder): NextStep {
  if (order.status.toUpperCase() === 'DRAFT') return 'APPROVE';
  const phase = queuePhaseOf(order);
  if (phase === 'READY_TO_CLOSE') return 'CLOSE';
  if (phase === 'INSEMINATING' && (order.insemination_summary?.not_inseminated ?? 0) > 0) return 'INSEMINATE';
  if (phase === 'IN_SERVICE') return 'WITHDRAW_BULLS';
  return 'TACTO';
}

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;

export interface QueueProgress {
  title: string;
  /** 0–100, or null when there is nothing to measure yet. */
  percent: number | null;
  tone: 'primary' | 'success' | 'info' | 'warning' | 'error';
  caption: string;
}

/** What the "Avance" column says: the inseminations, the service window or the tacto, by phase. */
export function queueProgress(order: ServiceOrder): QueueProgress {
  const phase = queuePhaseOf(order);
  const summary = order.diagnosis_summary;
  const total = summary?.total ?? order.female_caravan_ids.length;
  const provisional = summary?.provisional_empty ?? 0;
  const scanned = (summary?.evaluated ?? 0) + provisional;

  if (phase === 'DRAFT') {
    return { title: 'Sin aprobar', percent: null, tone: 'info', caption: `Inicio planificado ${formatDay(order.planned_start_date)}` };
  }

  if (summary && scanned > 0) {
    const parts = [plural(summary.pregnant, 'preñada'), plural(summary.empty, 'vacía')];
    if (provisional > 0) parts.push(`${provisional} prov.`);
    if (summary.partial_rate !== null && summary.partial_rate !== undefined) parts.push(`preñez parcial ${summary.partial_rate.toFixed(1)}%`);
    return {
      title: `Tactados ${scanned} / ${total}`,
      percent: total > 0 ? Math.round((scanned / total) * 100) : 0,
      tone: phase === 'READY_TO_CLOSE' ? 'success' : 'primary',
      caption: parts.join(' · '),
    };
  }

  const ai = order.service_method === 'AI' ? order.insemination_summary : null;
  if (phase === 'INSEMINATING' && ai) {
    return {
      title: `Inseminadas ${ai.inseminated} / ${ai.females}`,
      percent: ai.females > 0 ? Math.round((ai.inseminated / ai.females) * 100) : 0,
      tone: 'info',
      caption: `sin tactar · 0 / ${total}`,
    };
  }

  if (phase === 'IN_SERVICE') {
    const temporal = computeServiceOrderTemporalStatus(order);
    const tone = temporal.isOverdue ? 'error' : temporal.isClosingSoon ? 'warning' : 'info';
    const { daysInService, daysRemaining } = temporal;
    if (daysInService !== null && daysRemaining !== null) {
      return { title: `Día ${daysInService} de 90`, percent: Math.min(100, Math.round((daysInService / 90) * 100)), tone, caption: `sin tactar · 0 / ${total}` };
    }
    return { title: 'Toros en lote', percent: null, tone, caption: `sin tactar · 0 / ${total}` };
  }

  const from = order.suggested_diagnosis_date ? ` · tactar desde ${formatDay(order.suggested_diagnosis_date)}` : '';
  return { title: `Tactados 0 / ${total}`, percent: 0, tone: 'warning', caption: `sin tactar${from}` };
}

const SERVICE_TYPE_LABELS: Record<ServiceOrder['service_type'], string> = {
  single: 'un toro',
  rotation: 'rotación de toros',
  multi: 'multi-toro',
};

/** Second line of the "Servicio" column: how the batch is served. */
export function serviceMethodLabel(order: ServiceOrder): string {
  if (order.service_method === 'AI') return 'Inseminación artificial';
  return `Natural · ${SERVICE_TYPE_LABELS[order.service_type] ?? PHASE_LABELS.IN_SERVICE.toLowerCase()}`;
}

/**
 * What the "Plazo" column says. While the bulls are in, the day of service already shows in
 * "Avance", so here goes the end of the window; afterwards, the tray's own label.
 */
export function queueDeadline(order: ServiceOrder): { title: string; caption: string } {
  const start = `servicio desde ${formatDay(order.actual_start_date || order.planned_start_date)}`;
  if (queuePhaseOf(order) === 'DRAFT') return { title: `Inicio ${formatDay(order.planned_start_date)}`, caption: 'esperando aprobación' };
  const temporal = computeServiceOrderTemporalStatus(order);
  const end = temporal.effectivePlannedEndDate;
  if (queuePhaseOf(order) === 'IN_SERVICE' && end && temporal.daysRemaining !== null) {
    const left = temporal.daysRemaining;
    const caption = left > 0 ? `faltan ${left} d · ${start}` : left === 0 ? `vence hoy · ${start}` : `vencida hace ${-left} d · ${start}`;
    return { title: `Hasta ${formatDay(end)}`, caption };
  }
  return { title: trayTimeLabel(order), caption: start };
}
