import { useState } from 'react';
import { Box, Button, Dialog, DialogContent, IconButton, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { BoardScope, BoardTemplateType } from '../../../types/dashboard.types';
import { BOARD_ICON_OPTIONS, CURRENT_CAMPAIGN } from '../../../registry/boardTemplates';
import { CreateBoardInput } from '../../../hooks/useDashboardBoards';
import { BoardIdentityFields } from './BoardIdentityFields';
import { BoardStartPicker } from './BoardStartPicker';
import { BoardScopeFields } from './BoardScopeFields';

interface CreateBoardDialogProps {
	open: boolean;
	onClose: () => void;
	onCreate: (input: CreateBoardInput) => void;
}

/** Thin orchestrator: owns the form state and delegates each section to a presenter. */
export function CreateBoardDialog({ open, onClose, onCreate }: CreateBoardDialogProps) {
	const [name, setName] = useState('');
	const [icon, setIcon] = useState(BOARD_ICON_OPTIONS[0]);
	const [template, setTemplate] = useState<BoardTemplateType>('BLANK');
	const [scope, setScope] = useState<BoardScope>({ campaign: CURRENT_CAMPAIGN, batchTypeCode: null });
	const canCreate = name.trim().length > 0;

	const handleCreate = () => {
		if (!canCreate) return;

		onCreate({ name, icon, template, scope });
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			fullWidth
			maxWidth="md"
			aria-labelledby="create-board-title"
			PaperProps={{ sx: { borderRadius: '8px', boxShadow: 1, bgcolor: 'background.paper' } }}
		>
			<Box
				sx={{
					p: 2,
					px: 3,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					borderBottom: 1,
					borderColor: 'divider'
				}}
			>
				<Typography
					id="create-board-title"
					variant="h6"
					sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'text.primary' }}
				>
					Nuevo tablero
				</Typography>
				<IconButton
					onClick={onClose}
					aria-label="Cerrar"
					sx={{ color: 'primary.main' }}
				>
					<FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
				</IconButton>
			</Box>
			<DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.75 }}>
				<BoardIdentityFields
					name={name}
					icon={icon}
					onNameChange={setName}
					onIconChange={setIcon}
				/>
				<BoardStartPicker
					value={template}
					onChange={setTemplate}
				/>
				<BoardScopeFields
					scope={scope}
					onChange={setScope}
				/>
			</DialogContent>
			<Box
				sx={{
					p: 2,
					px: 3,
					bgcolor: 'background.default',
					borderTop: 1,
					borderColor: 'divider',
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center'
				}}
			>
				<Button
					variant="text"
					onClick={onClose}
					sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}
				>
					Cancelar
				</Button>
				<Button
					variant="contained"
					onClick={handleCreate}
					disabled={!canCreate}
					sx={{
						bgcolor: 'primary.main',
						color: 'primary.contrastText',
						px: 3.5,
						fontWeight: 700,
						borderRadius: '6px',
						textTransform: 'none',
						boxShadow: 'none',
						'&:hover': { bgcolor: 'primary.dark', boxShadow: 'none' }
					}}
				>
					Crear tablero
				</Button>
			</Box>
		</Dialog>
	);
}

export default CreateBoardDialog;
