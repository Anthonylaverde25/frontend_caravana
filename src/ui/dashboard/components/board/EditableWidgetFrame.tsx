import { DragEvent, PointerEvent as ReactPointerEvent, ReactNode, useRef, useState } from 'react';
import { Box, Chip, IconButton, Tooltip, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { WidgetColSpan, WidgetRowSpan, WidgetSize } from '../../types/dashboard.types';

interface EditableWidgetFrameProps {
	name: string;
	size: WidgetSize;
	colSpan: WidgetColSpan;
	rowSpan: WidgetRowSpan;
	allowedSizes?: WidgetSize[];
	minCols?: WidgetColSpan;
	maxCols?: WidgetColSpan;
	minRows?: WidgetRowSpan;
	maxRows?: WidgetRowSpan;
	isFirst?: boolean;
	isLast?: boolean;
	isNew?: boolean;
	isDragging: boolean;
	onResize: (dimensions: { colSpan: WidgetColSpan; rowSpan: WidgetRowSpan; size: WidgetSize }) => void;
	onMoveBefore?: () => void;
	onMoveAfter?: () => void;
	onRemove: () => void;
	onDragStart: (e: DragEvent) => void;
	onDragEnd: () => void;
	children: ReactNode;
}

/**
 * Direct-manipulation frame:
 * - Dedicated light-colored top drag strip: moving is ONLY initiated from this strip.
 * - Reactive real-time resizing from right edge, bottom edge and corner.
 * - Clean aesthetics with zero buttons/toolbars cluttering the widget body.
 */
export function EditableWidgetFrame({
	name,
	colSpan,
	rowSpan,
	minCols = 1,
	maxCols = 4,
	minRows = 1,
	maxRows = 2,
	isNew,
	isDragging,
	onResize,
	onRemove,
	onDragStart,
	onDragEnd,
	children
}: EditableWidgetFrameProps) {
	const [activeResize, setActiveResize] = useState<{
		direction: 'horizontal' | 'vertical' | 'both';
		projectedCol: WidgetColSpan;
		projectedRow: WidgetRowSpan;
	} | null>(null);

	const resizeStartRef = useRef<{
		startX: number;
		startY: number;
		initialCol: WidgetColSpan;
		initialRow: WidgetRowSpan;
		colWidth: number;
		direction: 'horizontal' | 'vertical' | 'both';
	} | null>(null);

	const lastEmittedDims = useRef<{ col: WidgetColSpan; row: WidgetRowSpan }>({
		col: colSpan,
		row: rowSpan
	});

	const handlePointerDown = (
		e: ReactPointerEvent<HTMLDivElement>,
		direction: 'horizontal' | 'vertical' | 'both'
	) => {
		e.preventDefault();
		e.stopPropagation();

		const target = e.currentTarget;
		try {
			target.setPointerCapture(e.pointerId);
		} catch {
			// Ignore if not supported
		}

		const gridContainer = target.closest('[data-dashboard-grid="true"]') as HTMLElement | null;
		const gridWidth = gridContainer?.clientWidth ?? 1200;
		const gap = 20;
		const colWidth = (gridWidth - gap * 3) / 4;

		resizeStartRef.current = {
			startX: e.clientX,
			startY: e.clientY,
			initialCol: colSpan,
			initialRow: rowSpan,
			colWidth,
			direction
		};

		lastEmittedDims.current = { col: colSpan, row: rowSpan };

		setActiveResize({
			direction,
			projectedCol: colSpan,
			projectedRow: rowSpan
		});
	};

	const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
		if (!resizeStartRef.current) return;
		e.preventDefault();

		const { startX, startY, initialCol, initialRow, colWidth, direction } = resizeStartRef.current;
		const deltaX = e.clientX - startX;
		const deltaY = e.clientY - startY;

		let nextCol = initialCol;
		if (direction === 'horizontal' || direction === 'both') {
			const colDelta = Math.round(deltaX / (colWidth * 0.75));
			const rawCol = initialCol + colDelta;
			nextCol = Math.max(minCols, Math.min(maxCols, rawCol)) as WidgetColSpan;
		}

		let nextRow = initialRow;
		if ((direction === 'vertical' || direction === 'both') && maxRows >= 2) {
			if (deltaY > 80) nextRow = 2;
			else if (deltaY < -60) nextRow = 1;
		}

		setActiveResize({
			direction,
			projectedCol: nextCol,
			projectedRow: nextRow
		});

		// ── Real-time reactive shape-shifting as cursor moves ──
		if (nextCol !== lastEmittedDims.current.col || nextRow !== lastEmittedDims.current.row) {
			lastEmittedDims.current = { col: nextCol, row: nextRow };

			let nextSize: WidgetSize = 'CUSTOM';
			if (nextCol === 1 && nextRow === 1) nextSize = 'S';
			else if (nextCol === 2 && nextRow === 1) nextSize = 'M';
			else if (nextCol === 4 && nextRow === 1) nextSize = 'L';

			onResize({
				colSpan: nextCol,
				rowSpan: nextRow,
				size: nextSize
			});
		}
	};

	const handlePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
		if (!resizeStartRef.current) return;

		try {
			e.currentTarget.releasePointerCapture(e.pointerId);
		} catch {
			// Ignore
		}

		const finalDims = activeResize ?? {
			projectedCol: colSpan,
			projectedRow: rowSpan
		};

		setActiveResize(null);
		resizeStartRef.current = null;

		let nextSize: WidgetSize = 'CUSTOM';
		if (finalDims.projectedCol === 1 && finalDims.projectedRow === 1) nextSize = 'S';
		else if (finalDims.projectedCol === 2 && finalDims.projectedRow === 1) nextSize = 'M';
		else if (finalDims.projectedCol === 4 && finalDims.projectedRow === 1) nextSize = 'L';

		onResize({
			colSpan: finalDims.projectedCol,
			rowSpan: finalDims.projectedRow,
			size: nextSize
		});
	};

	const isResizing = Boolean(activeResize);
	const displayCol = colSpan;
	const displayRow = rowSpan;

	return (
		<Box
			sx={{
				position: 'relative',
				height: '100%',
				minHeight: displayRow === 2 ? 460 : 'auto',
				borderRadius: '12px',
				outline: isResizing ? '2px solid' : isNew ? '2px solid' : '1.5px dashed',
				outlineColor: isResizing ? 'primary.main' : isNew ? 'primary.main' : 'divider',
				outlineOffset: 3,
				opacity: isDragging ? 0.35 : 1,
				transform: isDragging ? 'scale(0.98)' : 'none',
				transition: isResizing ? 'none' : 'outline-color 160ms ease, box-shadow 160ms ease, transform 160ms ease',
				boxShadow: isResizing ? 4 : isDragging ? 0 : 0,
				userSelect: isResizing ? 'none' : 'auto',
				display: 'flex',
				flexDirection: 'column',
				bgcolor: 'background.paper',
				overflow: 'hidden',
				'&:hover': {
					outlineColor: 'primary.light',
					'& .resize-indicator-corner': { opacity: 1, color: 'primary.main' },
					'& .drag-strip-bar': { bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#E2E8F0' }
				}
			}}
		>
			{/* ── Franja de color claro exclusiva para mover de posición ── */}
			<Tooltip
				title="Tomá esta franja para mover de posición"
				placement="top"
				arrow
			>
				<Box
					className="drag-strip-bar"
					draggable
					onDragStart={onDragStart}
					onDragEnd={onDragEnd}
					aria-label={`Tomar franja para mover ${name}`}
					sx={{
						height: 28,
						bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#F1F5F9'),
						borderBottom: '1px solid',
						borderColor: 'divider',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						px: 1.5,
						cursor: isDragging ? 'grabbing' : 'grab',
						transition: 'background-color 150ms ease',
						flexShrink: 0,
						userSelect: 'none',
						zIndex: 10,
						'&:hover': {
							bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#E2E8F0'),
							'& .drag-grip-indicator': { bgcolor: 'primary.main' }
						},
						'&:active': {
							cursor: 'grabbing',
							bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.14)' : '#CBD5E1')
						}
					}}
				>
					{/* Icono e indicador de mover */}
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
						<FuseSvgIcon
							size={14}
							sx={{ color: 'text.secondary' }}
						>
							heroicons-outline:bars-2
						</FuseSvgIcon>
						<Typography
							sx={{
								fontSize: '0.6875rem',
								fontWeight: 700,
								letterSpacing: '0.05em',
								textTransform: 'uppercase',
								color: 'text.secondary'
							}}
						>
							Mover
						</Typography>
					</Box>

					{/* Pastilla central de agarre */}
					<Box
						className="drag-grip-indicator"
						sx={{
							width: 36,
							height: 4,
							borderRadius: '2px',
							bgcolor: 'text.disabled',
							transition: 'background-color 150ms ease'
						}}
					/>

					{/* Botón sutil de eliminar a la derecha de la franja */}
					<Tooltip title="Quitar este widget">
						<IconButton
							size="small"
							onClick={(e) => {
								e.stopPropagation();
								onRemove();
							}}
							sx={{
								p: 0.35,
								color: 'text.secondary',
								'&:hover': { color: 'error.main' }
							}}
						>
							<FuseSvgIcon size={14}>heroicons-outline:x-mark</FuseSvgIcon>
						</IconButton>
					</Tooltip>
				</Box>
			</Tooltip>

			{/* Contenedor del contenido del widget */}
			<Box sx={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative' }}>
				{children}
			</Box>

			{/* ── Zonas de estiramiento directo (Resize) ── */}

			{/* Borde derecho: estiramiento horizontal */}
			<Box
				onPointerDown={(e) => handlePointerDown(e, 'horizontal')}
				onPointerMove={handlePointerMove}
				onPointerUp={handlePointerUp}
				onPointerCancel={handlePointerUp}
				aria-hidden
				sx={{
					position: 'absolute',
					top: 28,
					bottom: 16,
					right: -4,
					width: 12,
					cursor: 'ew-resize',
					zIndex: 12,
					touchAction: 'none',
					'&:hover, &:active': {
						'&::after': {
							content: '""',
							position: 'absolute',
							top: 16,
							bottom: 16,
							right: 4,
							width: 3,
							borderRadius: '2px',
							bgcolor: 'primary.main'
						}
					}
				}}
			/>

			{/* Borde inferior: estiramiento vertical */}
			<Box
				onPointerDown={(e) => handlePointerDown(e, 'vertical')}
				onPointerMove={handlePointerMove}
				onPointerUp={handlePointerUp}
				onPointerCancel={handlePointerUp}
				aria-hidden
				sx={{
					position: 'absolute',
					left: 0,
					right: 16,
					bottom: -4,
					height: 12,
					cursor: 'ns-resize',
					zIndex: 12,
					touchAction: 'none',
					'&:hover, &:active': {
						'&::after': {
							content: '""',
							position: 'absolute',
							left: 16,
							right: 16,
							bottom: 4,
							height: 3,
							borderRadius: '2px',
							bgcolor: 'primary.main'
						}
					}
				}}
			/>

			{/* Esquina inferior derecha: estiramiento bidireccional */}
			<Box
				onPointerDown={(e) => handlePointerDown(e, 'both')}
				onPointerMove={handlePointerMove}
				onPointerUp={handlePointerUp}
				onPointerCancel={handlePointerUp}
				aria-label="Arrastrar esquina para ajustar tamaño"
				sx={{
					position: 'absolute',
					bottom: -4,
					right: -4,
					width: 24,
					height: 24,
					cursor: 'nwse-resize',
					zIndex: 14,
					touchAction: 'none',
					display: 'flex',
					alignItems: 'flex-end',
					justifyContent: 'flex-end',
					p: 0.5
				}}
			>
				<Box
					className="resize-indicator-corner"
					sx={{
						width: 14,
						height: 14,
						opacity: isResizing ? 1 : 0.4,
						color: isResizing ? 'primary.main' : 'text.disabled',
						transition: 'opacity 150ms ease, color 150ms ease'
					}}
				>
					<svg
						width="14"
						height="14"
						viewBox="0 0 14 14"
						fill="currentColor"
					>
						<circle
							cx="11"
							cy="11"
							r="1.5"
						/>
						<circle
							cx="6"
							cy="11"
							r="1.5"
						/>
						<circle
							cx="11"
							cy="6"
							r="1.5"
						/>
						<circle
							cx="1"
							cy="11"
							r="1.5"
						/>
						<circle
							cx="6"
							cy="6"
							r="1.5"
						/>
						<circle
							cx="11"
							cy="1"
							r="1.5"
						/>
					</svg>
				</Box>
			</Box>

			{/* Badge indicador durante estiramiento */}
			{isResizing && (
				<Box
					sx={{
						position: 'absolute',
						bottom: 12,
						right: 12,
						zIndex: 20,
						pointerEvents: 'none'
					}}
				>
					<Chip
						size="small"
						color="primary"
						label={`${displayCol} col${displayCol > 1 ? 's' : ''} (${displayCol * 25}%)${
							displayRow === 2 ? ' · Alto 2x' : ''
						}`}
						sx={{
							fontWeight: 700,
							boxShadow: 3,
							fontSize: '0.72rem'
						}}
					/>
				</Box>
			)}
		</Box>
	);
}

export default EditableWidgetFrame;
