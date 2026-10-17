import type { TableCell } from '@/core/assistant/domain/AssistantTypes';

const numberFormat = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });

/** How a value from the API reads in a cell or KPI: localized numbers, a dash for no data. */
export function formatCell(value: TableCell | undefined): string {
	if (value === null || value === undefined || value === '') return '—';

	if (typeof value === 'number') return numberFormat.format(value);

	if (typeof value === 'boolean') return value ? 'Sí' : 'No';

	return value;
}
