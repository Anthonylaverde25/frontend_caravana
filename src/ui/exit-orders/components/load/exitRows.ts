import type { CalfAtFoot, CalfAtFootDecision, ExitLinePayload } from '@/features/exit-orders/types';
import type { ExitPricing, PricedLine } from './exitPricing';

export type ExitLoadMode = 'issue' | 'execute' | 'register';

/** Columns of the load grid: check, tag, batch, weight, amount and the row status. */
export const EXIT_GRID_COLUMNS = 6;

/** One animal of the load as the grid edits it: the typed weight stays a string until sent. */
export interface ExitRow {
	caravanId: number;
	label: string;
	categoryName: string | null;
	/** The batch it leaves from: the grid groups the load by it. */
	batchId: number | null;
	batchName: string | null;
	activityName: string | null;
	isPregnant: boolean;
	/** The last weighing: a hint in the empty cell, and what "Completar con el último peso" uses. */
	lastWeight: number | null;
	weight: string;
	/**
	 * Marked: it leaves with this load. A batch comes in all marked and the ones that do not go are
	 * unmarked; on execute, the ones that went up on the truck.
	 */
	leaves: boolean;
}

/** What the screen carries from "Vender" to the full screen. */
export interface ExitLoadPrefill {
	buyerId?: number | null;
	exitDate?: string;
	rows?: { caravanId: number; weight?: string }[];
	calfDecisions?: Record<number, CalfAtFootDecision>;
	pricing?: ExitPricing;
	dte?: { number: string; date: string; heads: string };
}

export interface ExitTotals {
	heads: number;
	calves: number;
	weightKg: number;
	/** Some of the kg are the truck's total spread over the animals. */
	weightEstimated: boolean;
	amount: number;
	/** Rows that leave without an amount (no weight, or no price yet). */
	withoutAmount: number;
}

/** The calves at foot of each cow of the load that are not themselves in it. */
export function calvesByMother(calves: CalfAtFoot[], rows: ExitRow[]): Map<number, CalfAtFoot[]> {
	const inLoad = new Set(rows.map((row) => row.caravanId));
	const result = new Map<number, CalfAtFoot[]>();

	calves
		.filter((calf) => inLoad.has(calf.mother_id) && !inLoad.has(calf.calf_id))
		.forEach((calf) => result.set(calf.mother_id, [...(result.get(calf.mother_id) ?? []), calf]));

	return result;
}

const calvesLeaving = (
	row: ExitRow,
	calves: Map<number, CalfAtFoot[]>,
	decisions: Record<number, CalfAtFootDecision>
): number =>
	(decisions[row.caravanId] ?? 'WITH_MOTHER') === 'WITH_MOTHER' ? (calves.get(row.caravanId)?.length ?? 0) : 0;

export function totalsOf(
	rows: ExitRow[],
	priced: Map<number, PricedLine>,
	calves: Map<number, CalfAtFoot[]>,
	decisions: Record<number, CalfAtFootDecision>
): ExitTotals {
	const leaving = rows.filter((row) => row.leaves);
	const lines = leaving.map((row) => priced.get(row.caravanId));
	const calfCount = leaving.reduce((sum, row) => sum + calvesLeaving(row, calves, decisions), 0);

	return {
		heads: leaving.length + calfCount,
		calves: calfCount,
		weightKg: lines.reduce((sum, line) => sum + (line?.weightKg ?? 0), 0),
		weightEstimated: lines.some((line) => line?.estimated),
		amount: lines.reduce((sum, line) => sum + (line?.amount ?? 0), 0),
		withoutAmount: lines.filter((line) => line?.amount == null).length
	};
}

export function linesOf(
	rows: ExitRow[],
	priced: Map<number, PricedLine>,
	calves: Map<number, CalfAtFoot[]>,
	decisions: Record<number, CalfAtFootDecision>
): ExitLinePayload[] {
	return rows
		.filter((row) => row.leaves)
		.map((row) => {
			const line = priced.get(row.caravanId);
			// The server computes kg × $/kg itself (E7); a typed amount goes only when it cannot.
			const computes = line?.weightKg != null && line?.pricePerKg != null;

			return {
				caravan_id: row.caravanId,
				weight_kg: line?.weightKg ?? null,
				weight_estimated: line?.estimated ?? false,
				price_per_kg: line?.pricePerKg ?? null,
				amount: computes ? null : (line?.amount ?? null),
				calf_decision: calves.has(row.caravanId) ? (decisions[row.caravanId] ?? 'WITH_MOTHER') : null
			};
		});
}

/** Errors by field of a 422: those naming a row ("lines.2.weight_kg") and the rest. */
export interface ExitServerErrors {
	byRow: Record<number, Record<string, string>>;
	general: Record<string, string>;
}

export const NO_ERRORS: ExitServerErrors = { byRow: {}, general: {} };

/**
 * Spreads a 422 over the grid. Keys name the position of the row in the payload sent: `lines.N.*`
 * on a load, `caravan_ids.N` on an issued order.
 */
export function spreadErrors(errors: Record<string, string[]> | undefined, sentIds: number[]): ExitServerErrors {
	const result: ExitServerErrors = { byRow: {}, general: {} };

	Object.entries(errors ?? {}).forEach(([key, messages]) => {
		const match = key.match(/^(?:lines|caravan_ids)\.(\d+)(?:\.(\w+))?$/);
		const caravanId = match ? sentIds[Number(match[1])] : undefined;

		if (caravanId == null) {
			result.general[key] = messages[0];
			return;
		}

		result.byRow[caravanId] = { ...result.byRow[caravanId], [match?.[2] ?? 'caravan_id']: messages[0] };
	});

	return result;
}

/** The first objection of the server to the row, if any. */
export const rowError = (errors: Record<string, string> | undefined): string | undefined =>
	errors ? Object.values(errors)[0] : undefined;
