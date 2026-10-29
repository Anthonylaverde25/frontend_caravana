import { useEffect, useMemo, useRef, useState } from 'react';
import { useCalvesAtFoot } from '@/features/exit-orders/hooks/useExitOrders';
import type { CalfAtFootDecision, ExitDtePayload, ExitOrder } from '@/features/exit-orders/types';
import { localToday } from '../components/exitOrderFormat';
import {
	balanceByCategory,
	categoryOf,
	EMPTY_PRICING,
	ExitPricing,
	priceRows,
	pricingGap,
	pricingOfLines
} from '../components/load/exitPricing';
import {
	calvesByMother,
	ExitLoadMode,
	ExitLoadPrefill,
	ExitRow,
	ExitServerErrors,
	linesOf,
	NO_ERRORS,
	totalsOf
} from '../components/load/exitRows';
import type { ExitCandidate } from './useExitCandidates';

export interface ExitHeader {
	buyerId: number | null;
	exitDate: string;
	responsable: string;
	observations: string;
	exitBatchId: number | null;
}

export interface ExitDteDraft {
	number: string;
	date: string;
	heads: string;
	/** Typed by hand: it stops following the head count of the load. */
	headsTouched: boolean;
}

const rowOfLine = (line: ExitOrder['animals'][number], candidate: ExitCandidate | undefined): ExitRow => ({
	caravanId: line.caravan_id,
	label: line.label,
	categoryName: line.category?.name ?? null,
	batchId: line.from_batch?.id ?? candidate?.row.batchId ?? null,
	batchName: line.from_batch?.name ?? candidate?.row.batchName ?? null,
	activityName: line.activity?.name ?? candidate?.row.activityName ?? null,
	isPregnant: line.was_pregnant ?? candidate?.row.isPregnant ?? false,
	lastWeight: line.last_weight_kg ?? candidate?.row.lastWeight ?? null,
	weight: '',
	leaves: true
});

/**
 * The state of the exit load in its three modes: issue an order, execute a load of one, or
 * register a sale that already happened. The rows say which animals and their kg; how the sale was
 * charged is asked once for the whole load (06 §3, rediseño del 28/10/2026).
 */
export function useExitLoadForm(
	mode: ExitLoadMode,
	order: ExitOrder | undefined,
	candidates: Map<number, ExitCandidate>,
	candidatesReady: boolean,
	prefill: ExitLoadPrefill | null
) {
	const [header, setHeader] = useState<ExitHeader>({
		buyerId: null,
		exitDate: localToday(),
		responsable: '',
		observations: '',
		exitBatchId: null
	});
	const [dte, setDte] = useState<ExitDteDraft>({ number: '', date: localToday(), heads: '', headsTouched: false });
	// An issued order prices nothing unless the agreed $/kg is given; a sale starts asking per kg.
	const [pricing, setPricing] = useState<ExitPricing>(
		mode === 'issue' ? { ...EMPTY_PRICING, mode: 'NONE' } : EMPTY_PRICING
	);
	const [rows, setRows] = useState<ExitRow[]>([]);
	const [decisions, setDecisions] = useState<Record<number, CalfAtFootDecision>>({});
	const [errors, setErrors] = useState<ExitServerErrors>(NO_ERRORS);
	const initialized = useRef(false);

	// Filled once, when what it starts from has arrived: the order, or what "Vender" carried.
	useEffect(() => {
		if (initialized.current || !candidatesReady || (mode === 'execute' && order === undefined)) return;

		if (order) {
			const lines =
				mode === 'execute' ? order.animals.filter((line) => line.status === 'PENDING') : order.animals;
			setRows(lines.map((line) => rowOfLine(line, candidates.get(line.caravan_id))));
			// The $/kg agreed at issue comes back: the load starts from what was agreed.
			const agreed = pricingOfLines(lines);

			if (agreed) setPricing(agreed);

			setHeader((current) => ({
				...current,
				buyerId: order.buyer?.id ?? null,
				exitDate: mode === 'execute' ? localToday() : order.exit_date,
				responsable: order.responsable ?? '',
				observations: mode === 'execute' ? '' : (order.observations ?? '')
			}));
		} else if (prefill) {
			setRows(
				(prefill.rows ?? []).flatMap((pre) => {
					const candidate = candidates.get(pre.caravanId);

					return candidate ? [{ ...candidate.row, weight: pre.weight ?? '' }] : [];
				})
			);
			setHeader((current) => ({
				...current,
				buyerId: prefill.buyerId ?? null,
				exitDate: prefill.exitDate ?? current.exitDate
			}));
			setDecisions(prefill.calfDecisions ?? {});

			if (prefill.pricing) setPricing(prefill.pricing);

			if (prefill.dte) setDte({ ...prefill.dte, headsTouched: prefill.dte.heads !== '' });
		}

		initialized.current = true;
	}, [order, candidates, candidatesReady, prefill, mode]);

	const { data: calfList = [] } = useCalvesAtFoot(mode === 'issue' ? [] : rows.map((row) => row.caravanId));
	const calves = useMemo(() => calvesByMother(calfList, rows), [calfList, rows]);
	const priced = useMemo(() => priceRows(rows, pricing, mode === 'issue'), [rows, pricing, mode]);
	const balance = useMemo(() => balanceByCategory(rows, priced), [rows, priced]);
	const missingCategoryPrices = balance.filter((group) => !pricing.categoryPrices[group.category]?.trim()).length;
	const totals = useMemo(() => totalsOf(rows, priced, calves, decisions), [rows, priced, calves, decisions]);
	const dteHeads = dte.headsTouched ? dte.heads : totals.heads > 0 ? String(totals.heads) : '';

	/** Adds the animals marked; one already in the load and unmarked is marked again. */
	const addRows = (ids: number[]) =>
		setRows((current) => {
			const wanted = new Set(ids);
			const present = new Set(current.map((row) => row.caravanId));
			const added = ids
				.filter((id) => !present.has(id))
				.flatMap((id) => (candidates.get(id) ? [{ ...candidates.get(id)!.row, leaves: true }] : []));

			return [...current.map((row) => (wanted.has(row.caravanId) ? { ...row, leaves: true } : row)), ...added];
		});

	/** Marks or unmarks several at once: a whole batch from its group row, or every row. */
	const setLeaves = (ids: number[], leaves: boolean) => {
		const targets = new Set(ids);
		setRows((current) => current.map((row) => (targets.has(row.caravanId) ? { ...row, leaves } : row)));
	};

	const updateRow = (caravanId: number, patch: Partial<ExitRow>) => {
		setRows((current) => current.map((row) => (row.caravanId === caravanId ? { ...row, ...patch } : row)));
		// The objection was about the value just changed.
		setErrors((current) =>
			current.byRow[caravanId] ? { ...current, byRow: { ...current.byRow, [caravanId]: {} } } : current
		);
	};

	/** "Quitar lote": the batch leaves the list, not only the load. */
	const removeRows = (ids: number[]) => {
		const targets = new Set(ids);
		setRows((current) => current.filter((row) => !targets.has(row.caravanId)));
	};

	/** "Completar con el último peso": only the empty cells, never what was typed. */
	const fillLastWeights = () =>
		setRows((current) =>
			current.map((row) =>
				row.weight === '' && row.lastWeight != null && row.leaves
					? { ...row, weight: String(row.lastWeight) }
					: row
			)
		);

	const dtePayload: ExitDtePayload | null =
		mode !== 'issue' && dte.number.trim() !== ''
			? { dte_number: dte.number.trim(), dte_date: dte.date, head_count: Number(dteHeads) }
			: null;

	/** What blocks sending, said in plain words; the server checks each animal after. */
	const missing = ((): string[] => {
		const result: string[] = [];

		if (totals.heads === 0)
			result.push(
				mode === 'execute'
					? 'Marcá los animales que subieron.'
					: rows.length > 0
						? 'Marcá al menos un animal.'
						: 'Agregá los animales que salen.'
			);

		if (mode !== 'execute' && header.buyerId == null) result.push('Elegí el comprador.');

		if (!header.exitDate) result.push('Indicá la fecha.');
		else if (mode !== 'issue' && header.exitDate > localToday())
			result.push('La fecha del egreso no puede ser futura.');

		if (dtePayload && (!dte.date || !(dtePayload.head_count >= 1)))
			result.push('Completá la fecha y las cabezas del DTE, o dejá el número vacío.');

		return result;
	})();

	const lines = linesOf(rows, priced, calves, decisions);
	const leavingIds = rows.filter((row) => row.leaves).map((row) => row.caravanId);
	// The $/kg agreed at issue, animal by animal: by kg, or by the category of each.
	const agreedPrices = leavingIds.flatMap((id) => {
		const price = priced.get(id)?.pricePerKg;

		return price != null ? [{ caravan_id: id, price_per_kg: price }] : [];
	});
	const common = { exit_date: header.exitDate, exit_batch_id: header.exitBatchId, lines, dte: dtePayload };
	const extra = {
		buyer_partner_id: header.buyerId ?? 0,
		responsable: header.responsable.trim() || null,
		observations: header.observations.trim() || null
	};

	return {
		mode,
		header,
		setHeader: (patch: Partial<ExitHeader>) => setHeader((current) => ({ ...current, ...patch })),
		dte: { ...dte, heads: dteHeads },
		setDte: (patch: Partial<ExitDteDraft>) =>
			setDte((current) => ({ ...current, ...patch, headsTouched: current.headsTouched || 'heads' in patch })),
		pricing,
		setPricing: (patch: Partial<ExitPricing>) => setPricing((current) => ({ ...current, ...patch })),
		pricingGap: mode === 'issue' ? null : pricingGap(pricing, missingCategoryPrices),
		balance,
		categoryOf,
		priced,
		rows,
		leaving: rows.filter((row) => row.leaves),
		calves,
		decisions,
		setDecision: (motherId: number, decision: CalfAtFootDecision) =>
			setDecisions((current) => ({ ...current, [motherId]: decision })),
		totals,
		errors,
		setErrors,
		addRows,
		updateRow,
		setLeaves,
		removeRows,
		fillLastWeights,
		missing,
		problem: missing[0] ?? null,
		sentIds: mode === 'issue' ? leavingIds : lines.map((line) => line.caravan_id),
		payloads: {
			issue: { ...extra, exit_date: header.exitDate, caravan_ids: leavingIds, agreed_prices: agreedPrices },
			execute: common,
			register: { ...common, ...extra }
		}
	};
}

export type ExitLoadForm = ReturnType<typeof useExitLoadForm>;
