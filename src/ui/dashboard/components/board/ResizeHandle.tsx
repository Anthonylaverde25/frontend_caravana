import { useState, useRef, PointerEvent as ReactPointerEvent } from 'react';
import { Box, Chip, Tooltip } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { WidgetColSpan, WidgetRowSpan } from '../../types/dashboard.types';

interface ResizeHandleProps {
	currentColSpan: WidgetColSpan;
	currentRowSpan: WidgetRowSpan;
	minCols?: WidgetColSpan;
	maxCols?: WidgetColSpan;
	minRows?: WidgetRowSpan;
	maxRows?: WidgetRowSpan;
	onCommitResize: (dimensions: { colSpan: WidgetColSpan; rowSpan: WidgetRowSpan }) => void;
	onLiveResize?: (dimensions: { colSpan: WidgetColSpan; rowSpan: WidgetRowSpan } | null) => void;
}

/**
 * Interactive corner and edge handle for resizing widgets on the dashboard grid.
 * Provides continuous pointer-tracking, grid-column snapping and an active dimension tooltip.
 */
export function ResizeHandle({
	currentColSpan,
	currentRowSpan,
	minCols = 1,
	maxCols = 4,
	minRows = 1,
	maxRows = 2,
	onCommitResize,
	onLiveResize
}: ResizeHandleProps) {
	const [isDragging, setIsDragging] = useState(false);
	const [previewDims, setPreviewDims] = useState<{ colSpan: WidgetColSpan; rowSpan: WidgetRowSpan } | null>(null);

	const dragStartRef = useRef<{
		startX: number;
		startY: number;
		initialColSpan: WidgetColSpan;
		initialRowSpan: WidgetRowSpan;
		gridWidth: number;
		colWidth: number;
	} | null>(null);

	const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();

		const target = e.currentTarget;
		target.setPointerCapture(e.pointerId);

		// Find the parent grid container to calculate column widths
		const gridContainer = target.closest('[data-dashboard-grid="true"]') as HTMLElement | null;
		const gridWidth = gridContainer?.clientWidth ?? 1200;
		// 4 columns grid with ~20-28px gap
		const gap = 20;
		const colWidth = (gridWidth - gap * 3) / 4;

		dragStartRef.current = {
			startX: e.clientX,
			startY: e.clientY,
			initialColSpan: currentColSpan,
			initialRowSpan: currentRowSpan,
			gridWidth,
			colWidth
		};

		setIsDragging(true);
		setPreviewDims({ colSpan: currentColSpan, rowSpan: currentRowSpan });
		onLiveResize?.({ colSpan: currentColSpan, rowSpan: currentRowSpan });
	};

	const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
		if (!isDragging || !dragStartRef.current) return;

		e.preventDefault();
		const { startX, startY, initialColSpan, initialRowSpan, colWidth } = dragStartRef.current;
		const deltaX = e.clientX - startX;
		const deltaY = e.clientY - startY;

		// Calculate how many columns deltaX represents
		const colDelta = Math.round(deltaX / (colWidth * 0.75));
		const rawCol = initialColSpan + colDelta;
		const clampedCol = Math.max(minCols, Math.min(maxCols, rawCol)) as WidgetColSpan;

		// Row snapping: positive deltaY > 120px expands to rowSpan 2; negative deltaY < -80px collapses to 1
		let targetRow = initialRowSpan;
		if (deltaY > 100 && maxRows >= 2) {
			targetRow = 2;
		} else if (deltaY < -60) {
			targetRow = 1;
		}
		const clampedRow = Math.max(minRows, Math.min(maxRows, targetRow)) as WidgetRowSpan;

		const nextDims = { colSpan: clampedCol, rowSpan: clampedRow };
		setPreviewDims(nextDims);
		onLiveResize?.(nextDims);
	};

	const handlePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
		if (!isDragging) return;

		try {
			e.currentTarget.releasePointerCapture(e.pointerId);
		} catch {
			// Pointer capture might have already been released
		}

		const finalDims = previewDims ?? { colSpan: currentColSpan, rowSpan: currentRowSpan };
		setIsDragging(false);
		setPreviewDims(null);
		dragStartRef.current = null;
		onLiveResize?.(null);
		onCommitResize(finalDims);
	};

	return (
		<>
			{/* Right-edge hover resize strip */}
			<Box
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={handlePointerUp}
				onPointerCancel={handlePointerUp}
				aria-hidden
				sx={{
					position: 'absolute',
					top: 12,
					bottom: 12,
					right: -6,
					width: 14,
					cursor: 'ew-resize',
					zIndex: 10,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					transition: 'background-color 150ms ease',
					borderRadius: '4px',
					'&:hover, &:active': {
						bgcolor: 'primary.main',
						opacity: 0.8
					}
				}}
			/>

			{/* Bottom-right corner handle */}
			<Tooltip
				title={isDragging ? '' : 'Arrastrar para ajustar tamaño'}
				placement="left"
			>
				<Box
					onPointerDown={handlePointerDown}
					onPointerMove={handlePointerMove}
					onPointerUp={handlePointerUp}
					onPointerCancel={handlePointerUp}
					role="slider"
					aria-label="Ajustar tamaño del widget"
					sx={{
						position: 'absolute',
						bottom: -7,
						right: -7,
						width: 26,
						height: 26,
						borderRadius: '50%',
						bgcolor: isDragging ? 'primary.main' : 'background.paper',
						color: isDragging ? 'primary.contrastText' : 'primary.main',
						border: '2px solid',
						borderColor: 'primary.main',
						boxShadow: 2,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						cursor: 'nwse-resize',
						zIndex: 12,
						transition: 'transform 120ms ease, background-color 120ms ease',
						touchAction: 'none',
						'&:hover': {
							transform: 'scale(1.2)',
							bgcolor: 'primary.main',
							color: 'primary.contrastText'
						}
					}}
				>
					<FuseSvgIcon size={14}>heroicons-outline:arrows-pointing-out</FuseSvgIcon>
				</Box>
			</Tooltip>

			{/* Real-time dimension preview pill when dragging */}
			{isDragging && previewDims && (
				<Box
					sx={{
						position: 'absolute',
						bottom: 24,
						right: 12,
						zIndex: 20,
						pointerEvents: 'none',
						animation: 'fadeIn 100ms ease'
					}}
				>
					<Chip
						size="small"
						color="primary"
						label={`${previewDims.colSpan} ${previewDims.colSpan === 1 ? 'columna' : 'columnas'} ${
							previewDims.rowSpan === 2 ? '· Alto doble' : ''
						}`}
						sx={{
							fontWeight: 700,
							boxShadow: 3,
							fontSize: '0.75rem'
						}}
					/>
				</Box>
			)}
		</>
	);
}

export default ResizeHandle;
