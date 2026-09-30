import { useState, useEffect } from 'react';
import { Box, Stack } from '@mui/material';
import { useSnackbar } from 'notistack';
import ViewLayout from 'src/components/ViewLayout';
import { useDashboardBoards } from '../hooks/useDashboardBoards';
import { getWidgetDefinition } from '../registry/widgetRegistry';
import { BoardTabs } from '../components/board/BoardTabs';
import { BoardHeader } from '../components/board/BoardHeader';
import { BoardEditBar } from '../components/board/BoardEditBar';
import { BoardGrid } from '../components/board/BoardGrid';
import { EmptyBoardState } from '../components/board/EmptyBoardState';
import { CreateBoardDialog } from '../components/dialogs/create-board/CreateBoardDialog';
import { AddWidgetDialog } from '../components/dialogs/add-widget/AddWidgetDialog';

/**
 * Multi-board dashboard.
 * Uses keep-alive caching for visited boards to ensure instantaneous (0ms) switching between tabs.
 */
export function DashboardView() {
	const { enqueueSnackbar } = useSnackbar();
	const api = useDashboardBoards();
	const { activeBoard, isEditing } = api;
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [addWidgetFor, setAddWidgetFor] = useState<{ initialWidgetId: string | null } | null>(null);

	// Keep visited boards mounted in memory so switching between button tabs is instantaneous
	const [visitedBoardIds, setVisitedBoardIds] = useState<string[]>([activeBoard.id]);

	useEffect(() => {
		setVisitedBoardIds((prev) => (prev.includes(activeBoard.id) ? prev : [...prev, activeBoard.id]));
	}, [activeBoard.id]);

	/** Adding a widget always happens inside edit mode, so a saved empty board enters it first. */
	const openLibrary = (initialWidgetId: string | null) => {
		if (!isEditing) api.startEdit();

		setAddWidgetFor({ initialWidgetId });
	};

	return (
		<ViewLayout
			title="Dashboard"
			subtitle="Indicadores del rodeo por tablero. Cada número dice sobre qué total se calcula y contra qué se compara."
			className="p-0 sm:p-0"
		>
			{isEditing && (
				<BoardEditBar
					boardName={activeBoard.name}
					onDiscard={() => {
						api.discardEdit();
						enqueueSnackbar('Cambios descartados', { variant: 'info' });
					}}
					onSave={() => {
						api.saveEdit();
						enqueueSnackbar('Tablero guardado', { variant: 'success' });
					}}
				/>
			)}
			<Stack sx={{ px: { xs: 2, sm: 3 }, pt: 1, pb: 5, gap: 2.5, width: '100%', maxWidth: 1900, mx: 'auto' }}>
				<BoardTabs
					boards={api.boards}
					activeBoardId={activeBoard.id}
					disabled={isEditing}
					onSelect={api.selectBoard}
					onCreate={() => setIsCreateOpen(true)}
				/>
				<BoardHeader
					board={activeBoard}
					isEditing={isEditing}
					isCustomized={api.isCustomized}
					onEdit={api.startEdit}
					onReset={() => {
						api.resetBoard(activeBoard.id);
						enqueueSnackbar('Diseño original restablecido', { variant: 'info' });
					}}
					onDelete={() => {
						api.deleteBoard(activeBoard.id);
						enqueueSnackbar(`Tablero “${activeBoard.name}” eliminado`, { variant: 'info' });
					}}
				/>

				{/* Render visited boards with keep-alive visibility for instant tab switching */}
				{api.boards
					.filter((b) => visitedBoardIds.includes(b.id))
					.map((b) => {
						const isThisActive = b.id === activeBoard.id;
						const currentBoard = isThisActive ? activeBoard : b;

						return (
							<Box
								key={b.id}
								sx={{ display: isThisActive ? 'block' : 'none' }}
							>
								{currentBoard.widgets.length === 0 && !currentBoard.isSystem ? (
									<Box sx={{ py: 4 }}>
										<EmptyBoardState
											batchTypeCode={currentBoard.scope.batchTypeCode}
											onOpenLibrary={() => openLibrary(null)}
											onQuickAdd={(definition) => openLibrary(definition.id)}
										/>
									</Box>
								) : (
									<BoardGrid
										widgets={currentBoard.widgets}
										scope={currentBoard.scope}
										isEditing={isThisActive && isEditing}
										lastAddedId={isThisActive ? api.lastAddedId : null}
										onAddWidget={() => setAddWidgetFor({ initialWidgetId: null })}
										onResize={api.resizeWidget}
										onMove={api.moveWidget}
										onRemove={api.removeWidget}
									/>
								)}
							</Box>
						);
					})}
			</Stack>

			{isCreateOpen && (
				<CreateBoardDialog
					open
					onClose={() => setIsCreateOpen(false)}
					onCreate={(input) => {
						const board = api.createBoard(input);
						setIsCreateOpen(false);
						enqueueSnackbar(`Tablero “${board.name}” creado. Agregá o ajustá sus widgets y guardá.`, {
							variant: 'success'
						});
					}}
				/>
			)}

			{addWidgetFor && (
				<AddWidgetDialog
					open
					scope={activeBoard.scope}
					boardWidgets={activeBoard.widgets}
					initialWidgetId={addWidgetFor.initialWidgetId}
					onClose={() => setAddWidgetFor(null)}
					onAdd={(input) => {
						api.addWidget(input);
						setAddWidgetFor(null);
						enqueueSnackbar(
							`“${input.title ?? getWidgetDefinition(input.widgetId)?.name}” agregado al tablero`,
							{ variant: 'success' }
						);
					}}
				/>
			)}
		</ViewLayout>
	);
}

export default DashboardView;
