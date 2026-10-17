import type { Batch } from '@/core/batches/domain/entities/Batch';
import { isBreedingCandidate } from '@/core/caravans/domain/rules/isBreedingCandidate';
import type { Caravan } from '@/core/caravans/domain/entities/Caravan';
import type { CaravanSummary } from '@/core/caravans/domain/entities/CaravanSummary';
import { UNASSIGNED_BATCH } from '@/ui/herd/utils/herdFormat';
import { calvingOverdueCount } from '../monitoring/ReproductiveAlertsCell';

export type GestationStageFilter = 'ALL' | 'head' | 'body' | 'tail';
export type GestationRiskFilter = 'ALL' | 'High' | 'Medium' | 'Low';
export type GestationAlertFilter = 'ALL' | 'IMMINENT' | 'OVERDUE';

export interface GestationListFilters {
	search: string;
	stage: GestationStageFilter;
	risk: GestationRiskFilter;
	alertFilter: GestationAlertFilter;
}

export interface GestationBatchGroup {
	id: number | typeof UNASSIGNED_BATCH;
	name: string;
	isUnassigned: boolean;
	batch: Batch | null;
	caravans: Caravan[];
}

export interface GestationBatchStats {
	total: number;
	headCount: number;
	bodyCount: number;
	tailCount: number;
	unknownStageCount: number;
	imminentCount: number;
	overdueCount: number;
	highRiskCount: number;
	earliestDueDate: string | null;
	predominantCategory: string | null;
	averageWeight: number | null;
}

/**
 * Computes remaining days until estimated calving date.
 * Returns null when no estimated due date is declared.
 */
export function getDaysLeft(dueDateStr?: string | null): number | null {
	if (!dueDateStr) return null;

	const dueDate = new Date(dueDateStr);
	if (Number.isNaN(dueDate.getTime())) return null;

	const today = new Date();
	dueDate.setHours(0, 0, 0, 0);
	today.setHours(0, 0, 0, 0);
	const diffTime = dueDate.getTime() - today.getTime();
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	return diffDays > 0 ? diffDays : 0;
}

/**
 * Resolves obstetric risk level based on female category and days left to calving.
 */
export function getRiskDetails(
	category: string | null,
	daysLeft: number | null
): { risk: 'High' | 'Medium' | 'Low'; label: string } {
	const catNormalized = (category || '').toLowerCase();
	const effectiveDays = daysLeft ?? 999;

	if (catNormalized.includes('vaquillona') || catNormalized.includes('vaquilla')) {
		if (effectiveDays <= 45) {
			return { risk: 'High', label: 'Alto (1er Parto Temprano)' };
		}
		return { risk: 'Medium', label: 'Medio (Vaquillona)' };
	}

	if (effectiveDays <= 30) {
		return { risk: 'Medium', label: 'Medio (Parto Próximo)' };
	}

	return { risk: 'Low', label: 'Bajo' };
}

/**
 * Translates gestation stage code to Spanish label.
 */
export function getStageLabel(stage?: string | null): string | null {
	switch (stage) {
		case 'head':
			return 'Cabeza';
		case 'body':
			return 'Cuerpo';
		case 'tail':
			return 'Cola';
		default:
			return null;
	}
}

/**
 * Computes aggregated gestational metrics for a single batch group.
 */
export function computeGestationBatchStats(caravans: Caravan[]): GestationBatchStats {
	let headCount = 0;
	let bodyCount = 0;
	let tailCount = 0;
	let unknownStageCount = 0;
	let imminentCount = 0;
	let highRiskCount = 0;
	let earliestDueDate: string | null = null;
	let weightSum = 0;
	let weighedCount = 0;
	const categoryCounts = new Map<string, number>();

	for (const caravan of caravans) {
		const stage = caravan.active_gestation?.gestation_stage;
		if (stage === 'head') headCount++;
		else if (stage === 'body') bodyCount++;
		else if (stage === 'tail') tailCount++;
		else unknownStageCount++;

		const dueDate = caravan.active_gestation?.estimated_due_date ?? null;
		if (dueDate && (!earliestDueDate || dueDate < earliestDueDate)) {
			earliestDueDate = dueDate;
		}

		const daysLeft = getDaysLeft(dueDate);
		if (daysLeft !== null && daysLeft <= 45) {
			imminentCount++;
		}

		const categoryLabel = caravan.category_name ?? caravan.category ?? null;
		const risk = getRiskDetails(categoryLabel, daysLeft);
		if (risk.risk === 'High') {
			highRiskCount++;
		}

		if (categoryLabel) {
			categoryCounts.set(categoryLabel, (categoryCounts.get(categoryLabel) ?? 0) + 1);
		}

		const weight = caravan.current_weight ?? caravan.entry_weight;
		if (weight !== null && weight !== undefined && weight > 0) {
			weightSum += weight;
			weighedCount++;
		}
	}

	let predominantCategory: string | null = null;
	let maxCategoryCount = 0;
	categoryCounts.forEach((count, category) => {
		if (count > maxCategoryCount) {
			maxCategoryCount = count;
			predominantCategory = category;
		}
	});

	return {
		total: caravans.length,
		headCount,
		bodyCount,
		tailCount,
		unknownStageCount,
		imminentCount,
		overdueCount: calvingOverdueCount(caravans),
		highRiskCount,
		earliestDueDate,
		predominantCategory,
		averageWeight: weighedCount > 0 ? Math.round(weightSum / weighedCount) : null
	};
}

/**
 * Adapts a rich Caravan entity to CaravanSummary so shared HerdCaravanDialogs can operate on it.
 */
export function toCaravanSummary(caravan: Caravan): CaravanSummary {
	return {
		id: caravan.id,
		identification: caravan.identification,
		category: caravan.category,
		category_id: caravan.category_id,
		category_name: caravan.category_name ?? caravan.category,
		subcategory_id: caravan.subcategory_id,
		subcategory_name: caravan.subcategory_name,
		teeth: caravan.teeth,
		entry_weight: caravan.entry_weight,
		current_weight: caravan.current_weight,
		breed: caravan.breed,
		breed_id: null,
		sex: caravan.sex ?? 'H',
		entry_date: caravan.entry_date,
		batch_id: caravan.batch_id,
		batch_name: caravan.batch_name,
		farm_name: caravan.farm_name,
		batch_assigned_at: caravan.entry_date,
		gestation_status: caravan.active_gestation ? 'PREGNANT' : 'NONE',
		is_breeding_eligible: caravan.is_breeding_eligible,
		breeding_exclusion_reason: caravan.breeding_exclusion_reason,
		breeding_exclusion_reason_label: caravan.breeding_exclusion_reason_label,
		is_reproductive_category: caravan.is_reproductive_category,
		reproductive_status: !isBreedingCandidate(caravan)
			? 'NOT_APPLICABLE'
			: caravan.is_breeding_eligible
				? 'ELIGIBLE'
				: 'EXCLUDED'
	};
}
