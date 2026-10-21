import { useState } from 'react';
import {
	Alert,
	Box,
	Button,
	DialogActions,
	DialogContent,
	IconButton,
	MenuItem,
	Stack,
	TextField,
	Typography
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { WEANING_TYPE_LABELS, WEANING_TYPES, type WeaningType } from '@/features/weaning-orders/types';

interface SeparationWeaningDialogContentProps {
	message: string;
	onConfirm: (type: WeaningType) => void;
	onCancel: () => void;
}

/**
 * A movement parts mothers from their calves at foot: parting them is weaning them. Asks the kind
 * of weaning — chosen by the user, never inferred — and lets the movement go on.
 */
export function SeparationWeaningDialogContent({ message, onConfirm, onCancel }: SeparationWeaningDialogContentProps) {
	const [type, setType] = useState<WeaningType | ''>('');
	const [missing, setMissing] = useState(false);

	const confirm = () => {
		// Validated on click: the button is never disabled for a missing choice.
		if (type === '') {
			setMissing(true);
			return;
		}

		onConfirm(type);
	};

	return (
		<Box sx={{ width: { sm: 520 }, maxWidth: '100%' }}>
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
					variant="h6"
					sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'text.primary' }}
				>
					Se separan crías de su madre
				</Typography>
				<IconButton
					onClick={onCancel}
					size="small"
					sx={{ color: 'primary.main' }}
				>
					<FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
				</IconButton>
			</Box>
			<DialogContent sx={{ p: 3 }}>
				<Stack spacing={2}>
					<Alert
						severity="info"
						sx={{ borderRadius: '6px' }}
					>
						{message}
					</Alert>
					<TextField
						select
						label="Tipo de destete"
						variant="filled"
						value={type}
						onChange={(e) => {
							setType(e.target.value as WeaningType);
							setMissing(false);
						}}
						error={missing}
						helperText={
							missing ? 'Elegí el tipo de destete.' : 'Las crías quedan destetadas con este movimiento.'
						}
						sx={{ bgcolor: 'action.hover' }}
					>
						{WEANING_TYPES.map((value) => (
							<MenuItem
								key={value}
								value={value}
							>
								{WEANING_TYPE_LABELS[value]}
							</MenuItem>
						))}
					</TextField>
				</Stack>
			</DialogContent>
			<DialogActions
				sx={{ p: 2, px: 3, bgcolor: 'background.default', borderTop: 1, borderColor: 'divider', gap: 1.5 }}
			>
				<Button
					onClick={onCancel}
					variant="text"
					sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}
				>
					Cancelar
				</Button>
				<Button
					onClick={confirm}
					variant="contained"
					sx={{
						bgcolor: 'primary.main',
						color: 'primary.contrastText',
						px: 4,
						fontWeight: 700,
						borderRadius: '6px',
						textTransform: 'none',
						boxShadow: 'none',
						'&:hover': { bgcolor: 'primary.dark' }
					}}
				>
					Destetar y mover
				</Button>
			</DialogActions>
		</Box>
	);
}

export default SeparationWeaningDialogContent;
