import { useCallback, useState } from 'react';
import type { CaravanSummary } from '@/core/caravans/domain/entities/CaravanSummary';

export type HerdCaravanFormMode = 'create' | 'edit';

export interface HerdCaravanDialogsState {
	viewing: CaravanSummary | null;
	weighing: CaravanSummary | null;
	form: { mode: HerdCaravanFormMode; caravan: CaravanSummary | null; defaultBatchId?: number } | null;
	/** Caravans whose breeding eligibility is being changed (one or many). */
	breeding: { caravans: CaravanSummary[]; onSaved?: () => void } | null;
	/** Animals whose death is being registered (one or many). */
	dying: { caravans: CaravanSummary[]; onDone?: () => void } | null;
	openView: (caravan: CaravanSummary) => void;
	openWeigh: (caravan: CaravanSummary) => void;
	openEdit: (caravan: CaravanSummary) => void;
	openCreate: (defaultBatchId?: number) => void;
	openBreeding: (caravans: CaravanSummary[], onSaved?: () => void) => void;
	openDeath: (caravans: CaravanSummary[], onDone?: () => void) => void;
	closeView: () => void;
	closeWeigh: () => void;
	closeForm: () => void;
	closeBreeding: () => void;
	closeDeath: () => void;
}

/**
 * Which caravan dialog is open (detail drawer, weighing, create/edit form, breeding eligibility)
 * and for which caravan.
 */
export function useHerdCaravanDialogs(): HerdCaravanDialogsState {
	const [viewing, setViewing] = useState<CaravanSummary | null>(null);
	const [weighing, setWeighing] = useState<CaravanSummary | null>(null);
	const [form, setForm] = useState<HerdCaravanDialogsState['form']>(null);
	const [breeding, setBreeding] = useState<HerdCaravanDialogsState['breeding']>(null);
	const [dying, setDying] = useState<HerdCaravanDialogsState['dying']>(null);

	return {
		viewing,
		weighing,
		form,
		breeding,
		dying,
		openView: useCallback((caravan: CaravanSummary) => setViewing(caravan), []),
		openWeigh: useCallback((caravan: CaravanSummary) => setWeighing(caravan), []),
		openEdit: useCallback((caravan: CaravanSummary) => setForm({ mode: 'edit', caravan }), []),
		openCreate: useCallback(
			(defaultBatchId?: number) => setForm({ mode: 'create', caravan: null, defaultBatchId }),
			[]
		),
		closeView: useCallback(() => setViewing(null), []),
		closeWeigh: useCallback(() => setWeighing(null), []),
		closeForm: useCallback(() => setForm(null), []),
		openBreeding: useCallback(
			(caravans: CaravanSummary[], onSaved?: () => void) => setBreeding({ caravans, onSaved }),
			[]
		),
		closeBreeding: useCallback(() => setBreeding(null), []),
		openDeath: useCallback((caravans: CaravanSummary[], onDone?: () => void) => setDying({ caravans, onDone }), []),
		closeDeath: useCallback(() => setDying(null), [])
	};
}
