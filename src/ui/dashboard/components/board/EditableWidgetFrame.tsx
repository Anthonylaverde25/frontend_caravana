import { DragEvent, ReactNode } from 'react';
import { Box, IconButton, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { StatusPill } from '../primitives/StatusPill';
import { WidgetSize } from '../../types/dashboard.types';

interface EditableWidgetFrameProps {
	name: string;
	size: WidgetSize;
	allowedSizes: WidgetSize[];
	isFirst: boolean;
	isLast: boolean;
	isNew: boolean;
	isDragging: boolean;
	onResize: (size: WidgetSize) => void;
	onMoveBefore: () => void;
	onMoveAfter: () => void;
	onRemove: () => void;
	onDragStart: (e: DragEvent) => void;
	onDragEnd: () => void;
	children: ReactNode;
}

const SIZES: WidgetSize[] = ['S', 'M', 'L'];

/**
 * Edit-mode chrome around a widget: drag handle plus a toolbar to reorder (keyboard-accessible),
 * resize within the widget's allowed sizes and remove.
 */
export function EditableWidgetFrame({
	name,
	size,
	allowedSizes,
	isFirst,
	isLast,
	isNew,
	isDragging,
	onResize,
	onMoveBefore,
	onMoveAfter,
	onRemove,
	onDragStart,
	onDragEnd,
	children
}: EditableWidgetFrameProps) {
	return (
		<Box
			sx={{
				position: 'relative',
				height: '100%',
				borderRadius: '12px',
				outline: isNew ? '2.5px solid' : '1.5px dashed',
				outlineColor: isNew ? 'primary.main' : 'divider',
				outlineOffset: 4,
				opacity: isDragging ? 0.45 : 1,
				'&:hover .widget-toolbar, &:focus-within .widget-toolbar': { opacity: 1 }
			}}
		>
			<Box
				role="toolbar"
				aria-label={`Acciones del widget ${name}`}
				className="widget-toolbar"
				sx={{
					position: 'absolute',
					right: 8,
					top: 8,
					zIndex: 2,
					display: 'flex',
					alignItems: 'center',
					gap: 0.5,
					px: 0.5,
					py: 0.25,
					borderRadius: '8px',
					bgcolor: 'background.paper',
					boxShadow: 3,
					opacity: isNew ? 1 : 0,
					transition: 'opacity 120ms'
				}}
			>
				<Tooltip title="Arrastrar para mover">
					<Box
						draggable
						onDragStart={onDragStart}
						onDragEnd={onDragEnd}
						aria-hidden
						sx={{ display: 'flex', p: 0.75, cursor: 'grab', color: 'text.secondary' }}
					>
						<FuseSvgIcon size={18}>heroicons-outline:bars-2</FuseSvgIcon>
					</Box>
				</Tooltip>
				<IconButton
					size="small"
					aria-label="Mover antes"
					disabled={isFirst}
					onClick={onMoveBefore}
				>
					<FuseSvgIcon size={16}>heroicons-outline:arrow-left</FuseSvgIcon>
				</IconButton>
				<IconButton
					size="small"
					aria-label="Mover después"
					disabled={isLast}
					onClick={onMoveAfter}
				>
					<FuseSvgIcon size={16}>heroicons-outline:arrow-right</FuseSvgIcon>
				</IconButton>
				<ToggleButtonGroup
					size="small"
					exclusive
					value={size}
					onChange={(_, value: WidgetSize | null) => value && onResize(value)}
					aria-label="Tamaño"
					sx={{
						mx: 0.5,
						'& .MuiToggleButton-root': { px: 1, py: 0.25, fontWeight: 700, fontSize: '0.75rem' }
					}}
				>
					{SIZES.map((s) => (
						<ToggleButton
							key={s}
							value={s}
							disabled={!allowedSizes.includes(s)}
							aria-label={`Tamaño ${s}`}
						>
							{s}
						</ToggleButton>
					))}
				</ToggleButtonGroup>
				<IconButton
					size="small"
					aria-label="Quitar del tablero"
					onClick={onRemove}
					sx={{ color: 'error.main' }}
				>
					<FuseSvgIcon size={16}>heroicons-outline:trash</FuseSvgIcon>
				</IconButton>
			</Box>
			{isNew && (
				<Box sx={{ position: 'absolute', left: 12, top: -12, zIndex: 2 }}>
					<StatusPill
						tone="ok"
						label="Recién agregado"
					/>
				</Box>
			)}
			{children}
		</Box>
	);
}

export default EditableWidgetFrame;
