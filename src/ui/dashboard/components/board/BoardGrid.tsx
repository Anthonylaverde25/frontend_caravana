import { useState } from 'react';
import { Box, ButtonBase } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { BoardScope, BoardWidgetInstance, WidgetSize } from '../../types/dashboard.types';
import { getWidgetDefinition } from '../../registry/widgetRegistry';
import { WidgetRenderer } from './WidgetRenderer';
import { gridSpan } from './gridSpan';
import { EditableWidgetFrame } from './EditableWidgetFrame';

interface BoardGridProps {
	widgets: BoardWidgetInstance[];
	scope: BoardScope;
	isEditing: boolean;
	lastAddedId: string | null;
	onAddWidget: () => void;
	onResize: (instanceId: string, size: WidgetSize) => void;
	onMove: (from: number, to: number) => void;
	onRemove: (instanceId: string) => void;
}

/** 4-column board grid. In edit mode widgets can be dragged, reordered with buttons, resized and removed. */
export function BoardGrid({
	widgets,
	scope,
	isEditing,
	lastAddedId,
	onAddWidget,
	onResize,
	onMove,
	onRemove
}: BoardGridProps) {
	const [dragIndex, setDragIndex] = useState<number | null>(null);

	return (
		<Box
			sx={{
				display: 'grid',
				gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' },
				gap: isEditing ? 3.5 : 2.5,
				alignItems: 'stretch'
			}}
		>
			{widgets.map((instance, index) => {
				const definition = getWidgetDefinition(instance.widgetId);

				return (
					<Box
						key={instance.instanceId}
						sx={{ gridColumn: gridSpan(instance.size), minWidth: 0 }}
						onDragOver={(e) => {
							if (dragIndex !== null) e.preventDefault();
						}}
						onDrop={(e) => {
							e.preventDefault();

							if (dragIndex !== null) onMove(dragIndex, index);

							setDragIndex(null);
						}}
					>
						{isEditing ? (
							<EditableWidgetFrame
								name={instance.title ?? definition?.name ?? instance.widgetId}
								size={instance.size}
								allowedSizes={definition?.sizes ?? [instance.size]}
								isFirst={index === 0}
								isLast={index === widgets.length - 1}
								isNew={instance.instanceId === lastAddedId}
								isDragging={dragIndex === index}
								onResize={(size) => onResize(instance.instanceId, size)}
								onMoveBefore={() => onMove(index, index - 1)}
								onMoveAfter={() => onMove(index, index + 1)}
								onRemove={() => onRemove(instance.instanceId)}
								onDragStart={(e) => {
									e.dataTransfer.effectAllowed = 'move';
									setDragIndex(index);
								}}
								onDragEnd={() => setDragIndex(null)}
							>
								<WidgetRenderer
									instance={instance}
									scope={scope}
								/>
							</EditableWidgetFrame>
						) : (
							<WidgetRenderer
								instance={instance}
								scope={scope}
							/>
						)}
					</Box>
				);
			})}
			{isEditing && (
				<ButtonBase
					onClick={onAddWidget}
					sx={{
						gridColumn: '1 / -1',
						height: 96,
						gap: 1.25,
						borderRadius: '12px',
						border: '1.5px dashed',
						borderColor: 'primary.main',
						color: 'primary.main',
						fontSize: '0.9375rem',
						fontWeight: 600,
						bgcolor: 'background.paper'
					}}
				>
					<FuseSvgIcon size={18}>heroicons-outline:plus</FuseSvgIcon>
					Agregar widget
				</ButtonBase>
			)}
		</Box>
	);
}

export default BoardGrid;
