import {
	CastrationCandidate,
	CastrationMethod,
	RegisterCastrationPayload
} from '@/core/caravans/domain/entities/Castration';
import type { CaravanSummary } from '@/core/caravans/domain/entities/CaravanSummary';

export interface CastrationRow {
	caravanId: number;
	identification: string;
	visualTag: string | null;
	categoryCode: string;
	categoryName: string;
	ageMonths: number | null;
	checked: boolean;
	disabled: boolean;
	blockedReason: string | null;
	targetCategoryOptions: { id: number; code: string; name: string }[];
	targetCategoryId: number | null;
}

export const today = (): string => new Date().toISOString().slice(0, 10);

/**
 * Builds rows from batch castration candidates.
 */
export function buildRowsFromCandidates(candidates: CastrationCandidate[]): CastrationRow[] {
	return candidates.map((c) => ({
		caravanId: c.id,
		identification: c.identification,
		visualTag: c.visual_tag,
		categoryCode: c.category_code,
		categoryName: c.category_name,
		ageMonths: c.age_months,
		checked: c.preselected && !c.blocked_by,
		disabled: Boolean(c.blocked_by),
		blockedReason: c.blocked_by,
		targetCategoryOptions: c.target_category_options,
		targetCategoryId: c.default_target_category_id
	}));
}

/**
 * Builds rows from manually selected caravans (e.g. from the table selection bar).
 */
export function buildRowsFromSelectedCaravans(
	caravans: CaravanSummary[],
	candidateMap: Map<number, CastrationCandidate>
): CastrationRow[] {
	return caravans.map((c) => {
		const candidate = candidateMap.get(c.id);
		const isMale = c.sex === 'M';
		const isCastrated = c.castration_status === 'castrated';
		let blockedReason: string | null = null;

		if (!isMale) {
			blockedReason = 'Sólo se castran machos';
		} else if (isCastrated) {
			blockedReason = 'Ya está castrado';
		} else if (candidate?.blocked_by) {
			blockedReason = candidate.blocked_by;
		}

		const disabled = Boolean(blockedReason);

		return {
			caravanId: c.id,
			identification: c.identification ?? c.label,
			visualTag: null,
			categoryCode: c.category ?? '',
			categoryName: c.category_name ?? c.category ?? '',
			ageMonths: candidate?.age_months ?? null,
			checked: !disabled,
			disabled,
			blockedReason,
			targetCategoryOptions: candidate?.target_category_options ?? [],
			targetCategoryId: candidate?.default_target_category_id ?? null
		};
	});
}

/**
 * Assembles the payload to send to POST /caravans/castrations.
 */
export function buildCastrationPayload(
	rows: CastrationRow[],
	castratedOn: string,
	method: CastrationMethod | null,
	notes: string | null
): RegisterCastrationPayload {
	const checkedRows = rows.filter((r) => r.checked && !r.disabled);

	return {
		castrated_on: castratedOn,
		method: method || null,
		notes: notes?.trim() || null,
		items: checkedRows.map((r) => {
			const selectedOpt = r.targetCategoryOptions.find((opt) => opt.id === r.targetCategoryId);
			return {
				caravan_id: r.caravanId,
				target_category_id: r.targetCategoryOptions.length > 0 ? r.targetCategoryId : undefined,
				target_category_code: selectedOpt?.code ?? undefined
			};
		})
	};
}

/**
 * Maps backend 422 errors (e.g. items.0.caravan_id, items.0.target_category_id)
 * back to the specific caravanId.
 */
export function mapCastrationErrors(
	errors: Record<string, string[]> | undefined,
	sent: RegisterCastrationPayload
): { byCaravan: Record<number, string[]>; general: string[] } {
	const byCaravan: Record<number, string[]> = {};
	const general: string[] = [];

	Object.entries(errors ?? {}).forEach(([key, messages]) => {
		const match = key.match(/^items\.(\d+)\./);
		const caravanId = match ? sent.items[Number(match[1])]?.caravan_id : undefined;

		if (caravanId == null) {
			general.push(...messages);
			return;
		}

		byCaravan[caravanId] = [...(byCaravan[caravanId] ?? []), ...messages];
	});

	return { byCaravan, general };
}
