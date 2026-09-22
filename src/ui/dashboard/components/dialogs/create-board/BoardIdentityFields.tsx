import { Box, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { BOARD_ICON_OPTIONS, BOARD_NAME_MAX } from '../../../registry/boardTemplates';

interface BoardIdentityFieldsProps {
	name: string;
	icon: string;
	onNameChange: (name: string) => void;
	onIconChange: (icon: string) => void;
}

export function BoardIdentityFields({ name, icon, onNameChange, onIconChange }: BoardIdentityFieldsProps) {
	return (
		<>
			<TextField
				autoFocus
				fullWidth
				variant="filled"
				label="Nombre del tablero"
				value={name}
				onChange={(e) => onNameChange(e.target.value.slice(0, BOARD_NAME_MAX))}
				helperText={`Se muestra como pestaña. ${name.length}/${BOARD_NAME_MAX} caracteres.`}
				sx={{ '& .MuiFilledInput-root': { bgcolor: 'action.hover' } }}
			/>
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
				<Typography
					id="board-icon-label"
					sx={{ fontSize: '0.8125rem', fontWeight: 600 }}
				>
					Ícono
				</Typography>
				<ToggleButtonGroup
					exclusive
					value={icon}
					onChange={(_, value: string | null) => value && onIconChange(value)}
					aria-labelledby="board-icon-label"
					sx={{
						flexWrap: 'wrap',
						gap: 1,
						'& .MuiToggleButtonGroup-grouped': {
							border: 1,
							borderColor: 'divider',
							borderRadius: '8px !important'
						}
					}}
				>
					{BOARD_ICON_OPTIONS.map((option) => (
						<ToggleButton
							key={option}
							value={option}
							aria-label={option.split(':')[1]}
							sx={{ width: 44, height: 44 }}
						>
							<FuseSvgIcon size={20}>{option}</FuseSvgIcon>
						</ToggleButton>
					))}
				</ToggleButtonGroup>
			</Box>
		</>
	);
}

export default BoardIdentityFields;
