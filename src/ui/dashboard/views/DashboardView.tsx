import { useState } from 'react';
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
 * Multi-board dashboard. Orchestrates board state, edit mode and dialogs;
 * every visual piece is a presenter under ../components.
 */
export function DashboardView() {
	const { enqueueSnackbar } = useSnackbar();
	const api = useDashboardBoards();
	const { activeBoard, isEditing } = api;
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [addWidgetFor, setAddWidgetFor] = useState<{ initialWidgetId: string | null } | null>(null);

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
					onEdit={api.startEdit}
					onDelete={() => {
						api.deleteBoard(activeBoard.id);
						enqueueSnackbar(`Tablero “${activeBoard.name}” eliminado`, { variant: 'info' });
					}}
				/>
				{activeBoard.widgets.length === 0 && !activeBoard.isSystem ? (
					<Box sx={{ py: 4 }}>
						<EmptyBoardState
							batchTypeCode={activeBoard.scope.batchTypeCode}
							onOpenLibrary={() => openLibrary(null)}
							onQuickAdd={(definition) => openLibrary(definition.id)}
						/>
					</Box>
				) : (
					<BoardGrid
						widgets={activeBoard.widgets}
						scope={activeBoard.scope}
						isEditing={isEditing}
						lastAddedId={api.lastAddedId}
						onAddWidget={() => setAddWidgetFor({ initialWidgetId: null })}
						onResize={api.resizeWidget}
						onMove={api.moveWidget}
						onRemove={api.removeWidget}
					/>
				)}
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
