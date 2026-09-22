import { useCallback, useEffect, useMemo, useState } from 'react';
import {
	BoardScope,
	BoardTemplateType,
	BoardWidgetInstance,
	DashboardBoard,
	WidgetSize
} from '../types/dashboard.types';
import { SYSTEM_BOARDS, buildTemplateWidgets, newInstanceId } from '../registry/boardTemplates';
import { getWidgetDefinition } from '../registry/widgetRegistry';

/** v3: only user boards are persisted; system boards always come from code. */
const STORAGE_KEY = 'rxna_dashboard_boards_v3';

export interface CreateBoardInput {
	name: string;
	icon: string;
	template: BoardTemplateType;
	scope: BoardScope;
}

export interface NewWidgetInput {
	widgetId: string;
	size: WidgetSize;
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

function move<T>(list: T[], from: number, to: number): T[] {
	if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return list;

	const next = [...list];
	const [item] = next.splice(from, 1);
	next.splice(to, 0, item);

	return next;
}

/**
 * Board state for the dashboard. Editing works on a draft of the active board's widgets:
 * nothing is persisted until `saveEdit`, and `discardEdit` restores the last saved layout.
 */
export function useDashboardBoards() {
	const [userBoards, setUserBoards] = useState<DashboardBoard[]>(loadUserBoards);
	const [activeBoardId, setActiveBoardId] = useState<string>(SYSTEM_BOARDS[0].id);
	const [draft, setDraft] = useState<BoardWidgetInstance[] | null>(null);
	const [lastAddedId, setLastAddedId] = useState<string | null>(null);

	useEffect(() => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(userBoards));
		} catch {
			// Storage can be unavailable (private mode); boards then live for the session only.
		}
	}, [userBoards]);

	const boards = useMemo(() => [...SYSTEM_BOARDS, ...userBoards], [userBoards]);
	const savedActive = boards.find((b) => b.id === activeBoardId) ?? boards[0];
	const isEditing = draft !== null;
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
		if (savedActive.isSystem) return;

		setDraft(savedActive.widgets);
	}, [savedActive]);

	const saveEdit = useCallback(() => {
		if (!draft) return;

		setUserBoards((prev) => prev.map((b) => (b.id === savedActive.id ? { ...b, widgets: draft } : b)));
		setDraft(null);
		setLastAddedId(null);
	}, [draft, savedActive.id]);

	const discardEdit = useCallback(() => {
		setDraft(null);
		setLastAddedId(null);
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

	const resizeWidget = useCallback((instanceId: string, size: WidgetSize) => {
		setDraft((prev) => (prev ?? []).map((w) => (w.instanceId === instanceId ? { ...w, size } : w)));
	}, []);

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
		lastAddedId,
		selectBoard,
		createBoard,
		startEdit,
		saveEdit,
		discardEdit,
		addWidget,
		removeWidget,
		resizeWidget,
		moveWidget,
		deleteBoard
	};
}

export type DashboardBoardsApi = ReturnType<typeof useDashboardBoards>;
