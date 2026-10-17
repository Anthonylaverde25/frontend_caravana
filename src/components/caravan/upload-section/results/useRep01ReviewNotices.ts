import { useMemo } from 'react';
import { useServiceOrderDiagnosis } from '@/features/gestation/hooks/useServiceOrders';
import { VERDICT_SHORT_LABELS, formatDay } from '@/ui/gestation/utils/reproductiveVerdict';

/** P / V as read from the sheet, or null when blank or unreadable. */
export function readDiagnosis(raw: unknown): 'PREGNANT' | 'EMPTY' | null {
  const value = String(raw ?? '').trim().toUpperCase();
  if (['P', 'PREÑADA', 'PRENADA', 'PREGNANT'].includes(value)) return 'PREGNANT';
  if (['V', 'VACÍA', 'VACIA', 'EMPTY'].includes(value)) return 'EMPTY';
  return null;
}

/**
 * Notices of each scanned REP-01 row, shown in the supervised review BEFORE saving: blank cells
 * (the female stays pending), unreadable values, females outside the order, re-checks and empties
 * stated before the suggested day. None of them blocks the import.
 */
export function useRep01ReviewNotices(rows: Record<string, unknown>[], serviceOrderId: number | null | undefined, sheetDate: string) {
  const { data: diagnosis } = useServiceOrderDiagnosis(serviceOrderId ?? null);

  return useMemo(() => {
    const byTag = new Map((diagnosis?.females ?? []).map((female) => [female.identification.trim().toUpperCase(), female]));
    const suggested = diagnosis?.suggested_diagnosis_date ?? null;

    return rows.map((row) => {
      const notices: string[] = [];
      const raw = String(row.diagnosis ?? row.diagnostico ?? '').trim();
      const verdict = readDiagnosis(raw);

      if (raw === '') notices.push('Sin resultado: el vientre queda pendiente.');
      else if (verdict === null) notices.push(`Diagnóstico ilegible ("${raw}"): corregilo a Preñada o Vacía.`);

      if (diagnosis) {
        const female = byTag.get(String(row.identification ?? '').trim().toUpperCase());
        if (!female) {
          notices.push('No pertenece a la orden de servicio.');
        } else if (verdict && female.reproductive_status !== 'UNCHECKED' && female.reproductive_status !== 'EXITED') {
          notices.push(`Ya tenía ${VERDICT_SHORT_LABELS[female.reproductive_status]} del ${formatDay(female.diagnosed_at)}; se reemplaza.`);
        } else if (female?.reproductive_status === 'EXITED') {
          notices.push('Salió de la orden (muerte o venta): no se diagnostica.');
        }
      }

      if (verdict === 'EMPTY' && suggested && sheetDate < suggested) {
        notices.push(`Vacía antes del ${formatDay(suggested)}: puede ser una preñez temprana no detectable.`);
      }

      return notices;
    });
  }, [rows, diagnosis, sheetDate]);
}
