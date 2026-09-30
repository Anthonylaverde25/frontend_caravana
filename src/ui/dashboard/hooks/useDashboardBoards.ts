import { useCallback, useEffect, useMemo, useState } from 'react';
import {
	BoardScope,
	BoardTemplateType,
	BoardWidgetInstance,
	DashboardBoard,
	WidgetColSpan,
	WidgetRowSpan,
	WidgetSize
} from '../types/dashboard.types';
import { SYSTEM_BOARDS, buildTemplateWidgets, newInstanceId } from '../registry/boardTemplates';
import { getWidgetDefinition } from '../registry/widgetRegistry';

/** v3: user boards and system board customizations are persisted in localStorage. */
const STORAGE_KEY = 'rxna_dashboard_boards_v3';
const SYSTEM_OVERRIDE_KEY = 'rxna_dashboard_system_overrides_v3';

export interface CreateBoardInput {
	name: string;
	icon: string;
	template: BoardTemplateType;
	scope: BoardScope;
}

export interface NewWidgetInput {
	widgetId: string;
	size: WidgetSize;
	colSpan?: WidgetColSpan;
	rowSpan?: WidgetRowSpan;
	title?: string;
	config?: Record<string, string>;
}

function isBoard(value: unknown): value is DashboardBoard {
	const b = value as DashboardBoard;

	return Boolean(b && typeof b.id === 'string' && typeof b.name === 'string' && Array.isArray(b.widgets) && b.scope);
}

function loadUserBoards(): DashboardBoard[] {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		const parsed: unknown = raw ? JSON.parse(raw) : [];

		if (!Array.isArray(parsed)) return [];

		return parsed.filter(isBoard).map((b) => ({
			...b,
			isSystem: false,
			widgets: b.widgets.filter((w) => getWidgetDefinition(w.widgetId)?.component)
		}));
	} catch {
		return [];
	}
}

function loadSystemOverrides(): Record<string, BoardWidgetInstance[]> {
	try {
		const raw = localStorage.getItem(SYSTEM_OVERRIDE_KEY);
		const parsed: unknown = raw ? JSON.parse(raw) : {};

		if (parsed && typeof parsed === 'object') {
			return parsed as Record<string, BoardWidgetInstance[]>;
		}

		return {};
	} catch {
		return {};
	}
}

function move<T>(list: T[], from: number, to: number): T[] {
	if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return list;

	const next = [...list];
	const [item] = next.splice(from, 1);
	next.splice(to, 0, item);

	return next;
}

/**
 * Board state for the dashboard.
 * Supports customizing both system boards (persisting overrides) and custom user boards.
 * Editing works on a draft of the active board's widgets:
 * nothing is persisted until `saveEdit`, and `discardEdit` restores the last saved layout.
 */
export function useDashboardBoards() {
	const [userBoards, setUserBoards] = useState<DashboardBoard[]>(loadUserBoards);
	const [systemOverrides, setSystemOverrides] = useState<Record<string, BoardWidgetInstance[]>>(loadSystemOverrides);
	const [activeBoardId, setActiveBoardId] = useState<string>(SYSTEM_BOARDS[0].id);
	const [draft, setDraft] = useState<BoardWidgetInstance[] | null>(null);
	const [lastAddedId, setLastAddedId] = useState<string | null>(null);

	useEffect(() => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(userBoards));
		} catch {
			// Storage can be unavailable (private mode)
		}
	}, [userBoards]);

	useEffect(() => {
		try {
			localStorage.setItem(SYSTEM_OVERRIDE_KEY, JSON.stringify(systemOverrides));
		} catch {
			// Storage can be unavailable
		}
	}, [systemOverrides]);

	const systemBoardsWithOverrides = useMemo(() => {
		return SYSTEM_BOARDS.map((b) => {
			const customWidgets = systemOverrides[b.id];
			if (customWidgets && Array.isArray(customWidgets)) {
				return {
					...b,
					widgets: customWidgets.filter((w) => getWidgetDefinition(w.widgetId)?.component)
				};
			}

			return b;
		});
	}, [systemOverrides]);

	const boards = useMemo(() => [...systemBoardsWithOverrides, ...userBoards], [systemBoardsWithOverrides, userBoards]);
	const savedActive = boards.find((b) => b.id === activeBoardId) ?? boards[0];
	const isEditing = draft !== null;
	const isCustomized = Boolean(savedActive.isSystem && systemOverrides[savedActive.id]);
	const activeBoard: DashboardBoard = isEditing ? { ...savedActive, widgets: draft } : savedActive;

	const selectBoard = useCallback(
		(id: string) => {
			if (isEditing) return;

			setActiveBoardId(id);
		},
		[isEditing]
	);

	const createBoard = useCallback((input: CreateBoardInput) => {
		const board: DashboardBoard = {
			id: `usr_${Date.now().toString(36)}`,
			name: input.name.trim(),
			icon: input.icon,
			isSystem: false,
			scope: input.scope,
			widgets: buildTemplateWidgets(input.template).map((w) => ({ ...w, instanceId: newInstanceId() }))
		};
		setUserBoards((prev) => [...prev, board]);
		setActiveBoardId(board.id);
		setDraft(board.widgets);

		return board;
	}, []);

	const startEdit = useCallback(() => {
		setDraft(savedActive.widgets);
	}, [savedActive]);

	const saveEdit = useCallback(() => {
		if (!draft) return;

		if (savedActive.isSystem) {
			setSystemOverrides((prev) => ({
				...prev,
				[savedActive.id]: draft
			}));
		} else {
			setUserBoards((prev) => prev.map((b) => (b.id === savedActive.id ? { ...b, widgets: draft } : b)));
		}

		setDraft(null);
		setLastAddedId(null);
	}, [draft, savedActive]);

	const discardEdit = useCallback(() => {
		setDraft(null);
		setLastAddedId(null);
	}, []);

	const resetBoard = useCallback((boardId: string) => {
		setSystemOverrides((prev) => {
			const next = { ...prev };
			delete next[boardId];
			return next;
		});
		setDraft(null);
	}, []);

	const addWidget = useCallback((input: NewWidgetInput) => {
		const instance: BoardWidgetInstance = { instanceId: newInstanceId(), ...input };
		setDraft((prev) => [...(prev ?? []), instance]);
		setLastAddedId(instance.instanceId);

		return instance;
	}, []);

	const removeWidget = useCallback((instanceId: string) => {
		setDraft((prev) => (prev ?? []).filter((w) => w.instanceId !== instanceId));
	}, []);

	const resizeWidget = useCallback(
		(
			instanceId: string,
			input: WidgetSize | { colSpan: WidgetColSpan; rowSpan?: WidgetRowSpan; size?: WidgetSize }
		) => {
			setDraft((prev) =>
				(prev ?? []).map((w) => {
					if (w.instanceId !== instanceId) return w;
					if (typeof input === 'string') {
						return { ...w, size: input };
					}

					return {
						...w,
						colSpan: input.colSpan,
						rowSpan: input.rowSpan ?? w.rowSpan ?? 1,
						size: input.size ?? w.size
					};
				})
			);
		},
		[]
	);

	const moveWidget = useCallback((from: number, to: number) => {
		setDraft((prev) => move(prev ?? [], from, to));
	}, []);

	const deleteBoard = useCallback(
		(id: string) => {
			setUserBoards((prev) => prev.filter((b) => b.id !== id));
			setDraft(null);

			if (activeBoardId === id) setActiveBoardId(SYSTEM_BOARDS[0].id);
		},
		[activeBoardId]
	);

	return {
		boards,
		activeBoard,
		isEditing,
		isCustomized,
		lastAddedId,
		selectBoard,
		createBoard,
		startEdit,
		saveEdit,
		discardEdit,
		resetBoard,
		addWidget,
		removeWidget,
		resizeWidget,
		moveWidget,
		deleteBoard
	};
}

export type DashboardBoardsApi = ReturnType<typeof useDashboardBoards>;
