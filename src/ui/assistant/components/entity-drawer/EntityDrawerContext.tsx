import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import type { EntityRef } from '@/core/assistant/domain/AssistantTypes';
import EntityDrawerHost, { type EntityDrawerEntry } from './EntityDrawerHost';

interface EntityDrawerContextValue {
	openEntity: (entity: EntityRef) => void;
}

const EntityDrawerContext = createContext<EntityDrawerContextValue | null>(null);

/** Long enough for MUI's drawer exit transition. */
const EXIT_MS = 300;

const sameEntity = (a: EntityRef, b: EntityRef) => a.kind === b.kind && a.id === b.id;

interface EntityDrawerProviderProps {
	/** Runs after a drawer navigates to the record's screen (e.g. closes the assistant drawer). */
	onNavigate?: () => void;
	children: ReactNode;
}

/**
 * Lets any block of an answer open a record's detail without threading callbacks through the
 * renderers. Drawers stack: a list (a category, a warehouse) opens a record on top of itself, and
 * closing it goes back to the list. Outside a provider, cells stay plain text.
 */
export function EntityDrawerProvider({ onNavigate, children }: EntityDrawerProviderProps) {
	const [stack, setStack] = useState<EntityDrawerEntry[]>([]);
	const nextKey = useRef(0);

	// Closed drawers stay mounted while they slide out, then leave the stack.
	const prune = useCallback(() => {
		setTimeout(() => setStack((current) => current.filter((entry) => entry.open)), EXIT_MS);
	}, []);

	const openEntity = useCallback((entity: EntityRef) => {
		setStack((current) => {
			const live = current.filter((entry) => entry.open);
			const existing = live.findIndex((entry) => sameEntity(entry.entity, entity));

			// Opening a record already in the stack goes back to it instead of repeating it.
			if (existing >= 0) return live.slice(0, existing + 1);

			nextKey.current += 1;

			return [...live, { key: nextKey.current, entity, open: true }];
		});
	}, []);

	const closeFrom = useCallback(
		(index: number) => {
			setStack((current) => current.map((entry, i) => (i >= index ? { ...entry, open: false } : entry)));
			prune();
		},
		[prune]
	);

	const navigated = useCallback(() => {
		closeFrom(0);
		onNavigate?.();
	}, [closeFrom, onNavigate]);

	const value = useMemo(() => ({ openEntity }), [openEntity]);

	return (
		<EntityDrawerContext.Provider value={value}>
			{children}
			<EntityDrawerHost
				stack={stack}
				onClose={closeFrom}
				onNavigate={navigated}
			/>
		</EntityDrawerContext.Provider>
	);
}

/** Null outside an EntityDrawerProvider: the caller then renders nothing clickable. */
export function useEntityDrawer(): EntityDrawerContextValue | null {
	return useContext(EntityDrawerContext);
}
