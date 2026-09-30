import { Box, Button, Chip } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { DashboardBoard } from '../../types/dashboard.types';
import { BATCH_TYPE_SCOPE_OPTIONS } from '../../registry/boardTemplates';

interface BoardHeaderProps {
	board: DashboardBoard;
	isEditing: boolean;
	isCustomized?: boolean;
	onEdit: () => void;
	onDelete: () => void;
	onReset?: () => void;
}

/**
 * Board scope chips plus direct actions for customizing layout,
 * resizing widgets, deleting custom boards or restoring defaults.
 */
export function BoardHeader({ board, isEditing, isCustomized, onEdit, onDelete, onReset }: BoardHeaderProps) {
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
				{board.isSystem && isCustomized && (
					<Chip
						size="small"
						color="primary"
						variant="outlined"
						label="Diseño personalizado"
					/>
				)}
			</Box>
			{!isEditing && (
				<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
					{board.isSystem && isCustomized && onReset && (
						<Button
							variant="text"
							color="inherit"
							onClick={onReset}
							startIcon={<FuseSvgIcon size={16}>heroicons-outline:arrow-path</FuseSvgIcon>}
							sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.8125rem' }}
						>
							Restablecer diseño
						</Button>
					)}
					{!board.isSystem && (
						<Button
							variant="text"
							color="error"
							onClick={onDelete}
							startIcon={<FuseSvgIcon size={16}>heroicons-outline:trash</FuseSvgIcon>}
							sx={{ textTransform: 'none', fontWeight: 600 }}
						>
							Eliminar
						</Button>
					)}
					<Button
						variant="contained"
						color="primary"
						onClick={onEdit}
						startIcon={<FuseSvgIcon size={16}>heroicons-outline:pencil-square</FuseSvgIcon>}
						sx={{
							textTransform: 'none',
							fontWeight: 600,
							borderRadius: '8px',
							boxShadow: 1
						}}
					>
						Personalizar tablero
					</Button>
				</Box>
			)}
		</Box>
	);
}

export default BoardHeader;
