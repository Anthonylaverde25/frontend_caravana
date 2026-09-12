import { DiagnosticProtocol } from '@/core/veterinary/domain/VeterinaryTypes';

export type LabUrgencyLevel = 'RECENT' | 'ATTENTION' | 'OVERDUE';

export interface PendingProtocolItem {
	protocol: DiagnosticProtocol;
	daysWaiting: number;
	urgency: LabUrgencyLevel;
	pendingSamples: number;
	totalSamples: number;
	isDerived: boolean;
	destinationLabel: string;
	veterinarianDisplay: string;
}

export interface PendingLabMetrics {
	totalProtocols: number;
	totalPendingSamples: number;
	inSituCount: number;
	derivedCount: number;
	recentCount: number;
	attentionCount: number;
	overdueCount: number;
}

/**
 * Calculates calendar days elapsed between a date string and today.
 */
export function calculateDaysElapsed(dateString: string | null | undefined): number {
	if (!dateString) return 0;

	try {
		const targetDate = new Date(dateString);
		const today = new Date();
		// Normalize to midnight UTC to avoid daylight saving discrepancies
		const utcTarget = Date.UTC(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
		const utcToday = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
		const diffDays = Math.floor((utcToday - utcTarget) / (1000 * 60 * 60 * 24));
		return Math.max(0, diffDays);
	} catch {
		return 0;
	}
}

/**
 * Categorizes urgency based on sanitary and incubation windows:
 * - OVERDUE: > 14 days without results
 * - ATTENTION: 7 to 14 days
 * - RECENT: <= 6 days
 */
export function getUrgencyLevel(daysWaiting: number): LabUrgencyLevel {
	if (daysWaiting > 14) return 'OVERDUE';

	if (daysWaiting >= 7) return 'ATTENTION';

	return 'RECENT';
}

/**
 * Resolves the destination label for a pending protocol.
 */
export function resolveDestinationLabel(protocol: DiagnosticProtocol): { isDerived: boolean; label: string } {
	if (protocol.destination_plan === 'TO_BE_DERIVED' || protocol.is_derived) {
		const institutionName =
			protocol.destination_institution?.nombre ||
			protocol.analysing_institution?.nombre ||
			protocol.reporting_institution?.nombre ||
			'Laboratorio Externo';
		return { isDerived: true, label: `Derivado: ${institutionName}` };
	}

	const ownCenter = protocol.act_institution?.nombre || 'Laboratorio Interno (In Situ)';
	return { isDerived: false, label: ownCenter };
}
