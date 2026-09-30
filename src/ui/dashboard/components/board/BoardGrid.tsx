import { useState, useRef, DragEvent } from 'react';
import { Box, ButtonBase } from '@mui/material';
import { motion } from 'motion/react';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import {
	BoardScope,
	BoardWidgetInstance,
	WidgetColSpan,
	WidgetRowSpan,
	WidgetSize,
	getEffectiveDimensions
} from '../../types/dashboard.types';
import { getWidgetDefinition } from '../../registry/widgetRegistry';
import { WidgetRenderer } from './WidgetRenderer';
import { gridRowSpan, gridSpan } from './gridSpan';
import { EditableWidgetFrame } from './EditableWidgetFrame';

export interface WidgetResizePayload {
	colSpan: WidgetColSpan;
	rowSpan: WidgetRowSpan;
	size: WidgetSize;
}

interface BoardGridProps {
	widgets: BoardWidgetInstance[];
	scope: BoardScope;
	isEditing: boolean;
	lastAddedId: string | null;
	onAddWidget: () => void;
	onResize: (instanceId: string, dimensions: WidgetResizePayload) => void;
	onMove: (from: number, to: number) => void;
	onRemove: (instanceId: string) => void;
}

/**
 * 4-column responsive board grid.
 * - Moving is strictly initiated from the widget's light drag strip.
 * - Reactive real-time displacement with hysteresis and debouncing (no jitter/domino effect).
 * - Real-time stretching/shrinking from edges and corner.
 * - High performance: layout animation ONLY enabled in edit mode.
 */
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
	const [draggedId, setDraggedId] = useState<string | null>(null);

	// Throttle swaps to prevent rapid bouncing / jitter between slots
	const lastSwapRef = useRef<{ time: number; targetId: string | null }>({
		time: 0,
		targetId: null
	});

	const handleDragStart = (e: DragEvent, instanceId: string) => {
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('text/plain', instanceId);
		setDraggedId(instanceId);
	};

	const handleDragOver = (e: DragEvent, targetIndex: number, targetInstanceId: string) => {
		if (!draggedId || draggedId === targetInstanceId) return;

		e.preventDefault();
		e.dataTransfer.dropEffect = 'move';

		// Spatial threshold: only swap when pointer is within central 60% of the target card
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		const relativeX = (e.clientX - rect.left) / rect.width;
		if (relativeX < 0.2 || relativeX > 0.8) {
			return;
		}

		// Prevent oscillation: minimum 220ms cooldown between swaps of the same target
		const now = Date.now();
		if (lastSwapRef.current.targetId === targetInstanceId && now - lastSwapRef.current.time < 220) {
			return;
		}

		const fromIndex = widgets.findIndex((w) => w.instanceId === draggedId);
		if (fromIndex !== -1 && fromIndex !== targetIndex) {
			lastSwapRef.current = { time: now, targetId: targetInstanceId };
			onMove(fromIndex, targetIndex);
		}
	};

	const handleDrop = (e: DragEvent) => {
		e.preventDefault();
		setDraggedId(null);
		lastSwapRef.current = { time: 0, targetId: null };
	};

	const handleDragEnd = () => {
		setDraggedId(null);
		lastSwapRef.current = { time: 0, targetId: null };
	};

	return (
		<Box
			data-dashboard-grid="true"
			sx={{
				display: 'grid',
				gridTemplateColumns: {
					xs: '1fr',
					sm: 'repeat(2, minmax(0, 1fr))',
					lg: 'repeat(4, minmax(0, 1fr))'
				},
				gap: isEditing ? 3.5 : 2.5,
				alignItems: 'stretch',
				position: 'relative'
			}}
		>
			{widgets.map((instance, index) => {
				const definition = getWidgetDefinition(instance.widgetId);
				const dims = getEffectiveDimensions(instance);

				const minCols = definition?.minCols ?? (definition?.sizes.includes('S') ? 1 : 2);
				const maxCols = definition?.maxCols ?? 4;
				const minRows = definition?.minRows ?? 1;
				const maxRows = definition?.maxRows ?? 2;

				const isThisDragging = draggedId === instance.instanceId;

				return (
					<Box
						key={instance.instanceId}
						component={isEditing ? motion.div : 'div'}
						layout={isEditing ? 'position' : undefined}
						transition={
							isEditing
								? {
										type: 'spring',
										damping: 26,
										stiffness: 300,
										mass: 0.7
								  }
								: undefined
						}
						sx={{
							gridColumn: gridSpan(instance),
							gridRow: gridRowSpan(instance),
							minWidth: 0,
							position: 'relative',
							zIndex: isThisDragging ? 30 : 1,
							transition: isThisDragging ? 'none' : 'box-shadow 150ms ease'
						}}
						onDragOver={isEditing ? (e) => handleDragOver(e, index, instance.instanceId) : undefined}
						onDrop={isEditing ? handleDrop : undefined}
					>
						{isEditing ? (
							<EditableWidgetFrame
								name={instance.title ?? definition?.name ?? instance.widgetId}
								size={instance.size}
								colSpan={dims.colSpan}
								rowSpan={dims.rowSpan}
								allowedSizes={definition?.sizes ?? [instance.size]}
								minCols={minCols}
								maxCols={maxCols}
								minRows={minRows}
								maxRows={maxRows}
								isFirst={index === 0}
								isLast={index === widgets.length - 1}
								isNew={instance.instanceId === lastAddedId}
								isDragging={isThisDragging}
								onResize={(payload) => onResize(instance.instanceId, payload)}
								onRemove={() => onRemove(instance.instanceId)}
								onDragStart={(e) => handleDragStart(e, instance.instanceId)}
								onDragEnd={handleDragEnd}
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
						bgcolor: 'background.paper',
						transition: 'background-color 150ms ease, border-color 150ms ease',
						'&:hover': {
							bgcolor: 'action.hover',
							borderColor: 'primary.dark'
						}
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
