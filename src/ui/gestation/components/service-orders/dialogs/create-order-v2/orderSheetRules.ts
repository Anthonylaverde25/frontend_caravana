import type { Batch } from '@/core/batches/domain/entities/Batch';
import { LotFemales } from './lotFemales';
import { lotFemaleCount } from './orderSheetPayload';
import { isFutureDay, todayLocal } from './orderSheetDates';
import { OrderSheetDetails } from './useOrderSheetDetails';
import { OrderSheetMode, SelectedBatchState, ServiceMethodType } from './types';

interface SheetContext {
	mode: OrderSheetMode;
	type: ServiceMethodType;
	lots: SelectedBatchState[];
	batches: Batch[];
	femalesByBatch: Map<number, LotFemales>;
	details: OrderSheetDetails;
}

function datesError({ mode, type, lots, batches, femalesByBatch, details }: SheetContext): string | null {
	const { startDate, endDate } = details;

	if (!startDate) return 'Indicá la fecha de inicio.';

	if (mode === 'register') {
		if (!endDate) return 'Indicá la fecha de fin.';

		if (endDate > todayLocal())
			return 'La fecha de fin no puede ser futura: si el servicio sigue, usá "Nueva orden".';

		if (startDate > endDate) return 'La fecha de inicio no puede ser posterior a la de fin.';

		return null;
	}

	if (type !== 'AI' && endDate && endDate < startDate) return 'La fecha de fin no puede ser anterior a la de inicio.';

	// Planning takes nothing: what follows only matters when the service starts now.
	if (isFutureDay(startDate)) return null;

	for (const lot of lots) {
		const unclosed = batches.find((batch) => batch.id === lot.batchId)?.unclosed_service_order;

		if (unclosed) {
			return `${lot.batchName} tiene la orden ${unclosed.code} sin cerrar: hay que cerrarla para iniciar otra. Con una fecha futura se puede planificar.`;
		}

		if (lotFemaleCount(lot, femalesByBatch.get(lot.batchId)) === 0) {
			return `${lot.batchName} no tiene vientres vacíos para iniciar hoy.`;
		}
	}
	return null;
}

function lotsError({ lots }: SheetContext): string | null {
	if (lots.length === 0) return 'Elegí al menos un lote de cría.';

	const empty = lots.find((lot) => lot.mode === 'partial' && lot.selectedCaravanIds.length === 0);
	return empty ? `Elegí al menos un vientre en ${empty.batchName}.` : null;
}

function bullsError({ lots, details }: SheetContext): string | null {
	const missing = lots.find((lot) => (details.bullsByBatch[lot.batchId] ?? []).length === 0);
	return missing ? `Elegí al menos un toro para ${missing.batchName}.` : null;
}

function staysError({ lots, details }: SheetContext): string | null {
	for (const lot of lots) {
		const rows = details.staysByBatch[lot.batchId] ?? [];

		if (rows.length === 0) return `Indicá al menos un toro en ${lot.batchName}.`;

		const incomplete = rows.find((row) => row.originBatchId === '' || row.destinationBatchId === '');

		if (incomplete) return `Completá de dónde vino y adónde fue el toro ${incomplete.tag}.`;
	}
	return null;
}

/** What still stops the sheet, in reading order; the backend has the last word. */
export function orderSheetProblems(context: SheetContext): string[] {
	const { mode, type } = context;
	const checks = [lotsError, datesError];

	if (type !== 'AI') checks.push(mode === 'register' ? staysError : bullsError);

	return checks.map((check) => check(context)).filter((problem) => problem !== null);
}

/** The server's messages, naming the batch they belong to. */
export function serverErrorLines(errors: Record<string, string[]>, lots: SelectedBatchState[]): string[] {
	return Object.entries(errors).flatMap(([field, messages]) => {
		const index = /^lots\.(\d+)/.exec(field)?.[1];
		const lotName = index !== undefined ? lots[Number(index)]?.batchName : undefined;
		return messages.map((message) => (lotName && !message.includes(lotName) ? `${lotName}: ${message}` : message));
	});
}
