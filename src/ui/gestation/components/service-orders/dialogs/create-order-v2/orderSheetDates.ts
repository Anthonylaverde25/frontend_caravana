import { addDays, format } from 'date-fns';

/** The local day, never the UTC one: after 21:00 in Argentina, UTC is already tomorrow. */
export const todayLocal = (): string => format(new Date(), 'yyyy-MM-dd');

export const daysFromTodayLocal = (days: number): string => format(addDays(new Date(), days), 'yyyy-MM-dd');

export const isFutureDay = (day: string): boolean => day > todayLocal();

export const formatShortDay = (day: string): string => (day ? format(new Date(`${day}T12:00:00`), 'dd/MM/yyyy') : '—');
