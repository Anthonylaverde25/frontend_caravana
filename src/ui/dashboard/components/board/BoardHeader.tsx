import { Box, Button, Chip, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { DashboardBoard } from '../../types/dashboard.types';
import { BATCH_TYPE_SCOPE_OPTIONS } from '../../registry/boardTemplates';

interface BoardHeaderProps {
	board: DashboardBoard;
	isEditing: boolean;
	onEdit: () => void;
	onDelete: () => void;
}

/** Board scope chips plus the actions available for user boards. System boards are read-only. */
export function BoardHeader({ board, isEditing, onEdit, onDelete }: BoardHeaderProps) {
	const batchType =
		BATCH_TYPE_SCOPE_OPTIONS.find((o) => o.value === board.scope.batchTypeCode)?.label ?? 'Todos los tipos de lote';

	return (
		<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
			<Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
				<Chip
					size="small"
					variant="outlined"
					label={`Campaña ${board.scope.campaign}`}
				/>
				<Chip
					size="small"
					variant="outlined"
					label={batchType}
				/>
				{board.isSystem && (
					<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
						Tablero del sistema · para personalizarlo, creá una copia
					</Typography>
				)}
			</Box>
			{!board.isSystem && !isEditing && (
				<Box sx={{ display: 'flex', gap: 1 }}>
					<Button
						variant="text"
						color="error"
						onClick={onDelete}
						startIcon={<FuseSvgIcon size={16}>heroicons-outline:trash</FuseSvgIcon>}
						sx={{ textTransform: 'none', fontWeight: 600 }}
					>
						Eliminar
					</Button>
					<Button
						variant="outlined"
						onClick={onEdit}
						startIcon={<FuseSvgIcon size={16}>heroicons-outline:pencil-square</FuseSvgIcon>}
						sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px' }}
					>
						Editar tablero
					</Button>
				</Box>
			)}
		</Box>
	);
}

export default BoardHeader;
