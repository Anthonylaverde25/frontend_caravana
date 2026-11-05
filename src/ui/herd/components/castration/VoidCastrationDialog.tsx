import { useState } from 'react';
import type { AxiosError } from 'axios';
import {
	Alert,
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	IconButton,
	Stack,
	TextField,
	Typography
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useVoidCastration } from '@/features/caravans/hooks/useCastration';
import type { CastrationRecord } from '@/core/caravans/domain/entities/Castration';

interface VoidCastrationDialogProps {
	open: boolean;
	onClose: () => void;
	caravan: {
		id: number;
		identification: string | null;
		label: string;
		castration?: CastrationRecord | null;
		category_code?: string | null;
	};
}

export function VoidCastrationDialog({ open, onClose, caravan }: VoidCastrationDialogProps) {
	const voidCastration = useVoidCastration();
	const [reason, setReason] = useState('');
	const [error, setError] = useState<string | null>(null);

	const castration = caravan.castration;
	const wasTorito =
		castration?.from_category_name?.toUpperCase().includes('TORITO') ||
		caravan.category_code?.toUpperCase() === 'NOVILLITO';

	const handleVoid = () => {
		if (!castration?.id) return;

		setError(null);

		voidCastration.mutate(
			{ id: castration.id, reason: reason.trim() || null },
			{
				onSuccess: onClose,
				onError: (err) => {
					const body = (err as AxiosError<{ message?: string }>).response?.data;
					setError(body?.message ?? 'No se pudo anular la castración.');
				}
			}
		);
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			fullWidth
			maxWidth="xs"
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
					variant="h6"
					sx={{ fontSize: '1.05rem', fontWeight: 600 }}
				>
					Anular castración
				</Typography>
				<IconButton
					onClick={onClose}
					size="small"
					sx={{ color: 'primary.main' }}
				>
					<FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
				</IconButton>
			</Box>

			<DialogContent sx={{ p: 3 }}>
				<Stack spacing={2}>
					<Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: '6px' }}>
						<Typography
							variant="subtitle2"
							sx={{ fontWeight: 600 }}
						>
							{caravan.identification ?? caravan.label}
						</Typography>
						<Typography
							variant="body2"
							sx={{ color: 'text.secondary', mt: 0.5, fontSize: '0.85rem' }}
						>
							Castrado el {castration?.castrated_on ?? '—'}
							{castration?.method_label ? ` · ${castration.method_label}` : ''}
						</Typography>
					</Box>

					{wasTorito ? (
						<Alert
							severity="warning"
							sx={{ borderRadius: '6px' }}
						>
							El animal volverá a la categoría <strong>Torito</strong> con un evento de corrección en el
							historial.
						</Alert>
					) : (
						<Alert
							severity="info"
							sx={{ borderRadius: '6px' }}
						>
							El animal volverá al estado <strong>Sin castración registrada</strong> y continuará como
							Ternero.
						</Alert>
					)}

					{error && (
						<Alert
							severity="error"
							sx={{ borderRadius: '6px' }}
						>
							{error}
						</Alert>
					)}

					<TextField
						label="Motivo de la anulación (opcional)"
						size="small"
						variant="filled"
						value={reason}
						onChange={(e) => setReason(e.target.value)}
						fullWidth
						multiline
						rows={2}
						sx={{
							'& .MuiFilledInput-root': {
								bgcolor: (theme) => theme.palette.action.hover,
								borderRadius: '6px'
							}
						}}
					/>
				</Stack>
			</DialogContent>

			<DialogActions
				sx={{ p: 2, px: 3, bgcolor: 'background.default', borderTop: 1, borderColor: 'divider', gap: 1.5 }}
			>
				<Button
					onClick={onClose}
					variant="text"
					sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}
				>
					Cancelar
				</Button>
				<Button
					onClick={handleVoid}
					disabled={voidCastration.isPending}
					variant="contained"
					color="error"
					sx={{
						px: 3,
						fontWeight: 700,
						borderRadius: '6px',
						textTransform: 'none',
						boxShadow: 'none'
					}}
				>
					{voidCastration.isPending ? 'Anulando...' : 'Anular castración'}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export default VoidCastrationDialog;
