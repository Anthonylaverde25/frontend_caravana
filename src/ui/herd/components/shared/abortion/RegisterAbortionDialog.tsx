import { useState } from 'react';
import type { AxiosError } from 'axios';
import {
	Alert,
	Box,
	Button,
	Checkbox,
	Dialog,
	DialogActions,
	DialogContent,
	FormControlLabel,
	IconButton,
	Stack,
	TextField,
	Typography
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { CaravanSummary } from '@/core/caravans/domain/entities/CaravanSummary';
import { useRegisterAbortion } from '@/features/caravans/hooks/useRegisterAbortion';

interface RegisterAbortionDialogProps {
	open: boolean;
	onClose: () => void;
	caravan: CaravanSummary;
}

const today = (): string => new Date().toISOString().slice(0, 10);

export function RegisterAbortionDialog({ open, onClose, caravan }: RegisterAbortionDialogProps) {
	const registerAbortion = useRegisterAbortion();
	const [abortedOn, setAbortedOn] = useState(today());
	const [notes, setNotes] = useState('');
	const [becomesCow, setBecomesCow] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const isVaquillona =
		caravan.category?.toUpperCase() === 'VAQUILLONA' || caravan.category_name?.toUpperCase().includes('VAQUILLONA');

	const handleSubmit = () => {
		if (!abortedOn) {
			setError('La fecha de aborto es obligatoria.');
			return;
		}

		setError(null);

		registerAbortion.mutate(
			{
				caravanId: caravan.id,
				aborted_on: abortedOn,
				notes: notes.trim() || null,
				becomes_cow: isVaquillona ? becomesCow : false
			},
			{
				onSuccess: onClose,
				onError: (err) => {
					const body = (err as AxiosError<{ message?: string }>).response?.data;
					setError(body?.message ?? 'No se pudo registrar el aborto.');
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
					sx={{ fontSize: '1.05rem', fontWeight: 600, color: 'text.primary' }}
				>
					Registrar aborto
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
				<Stack spacing={2.5}>
					<Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: '6px' }}>
						<Typography
							variant="subtitle2"
							sx={{ fontWeight: 700, fontSize: '0.95rem' }}
						>
							#{caravan.identification ?? caravan.label}
						</Typography>
						<Typography
							variant="body2"
							sx={{ color: 'text.secondary', mt: 0.5, fontSize: '0.85rem' }}
						>
							Categoría actual: <strong>{caravan.category_name ?? caravan.category ?? '—'}</strong>
							{caravan.subcategory_name ? ` · ${caravan.subcategory_name}` : ''}
						</Typography>
					</Box>

					{error && (
						<Alert
							severity="error"
							sx={{ borderRadius: '6px' }}
						>
							{error}
						</Alert>
					)}

					<TextField
						label="Fecha del aborto"
						type="date"
						size="small"
						variant="filled"
						fullWidth
						required
						value={abortedOn}
						onChange={(e) => setAbortedOn(e.target.value)}
						inputProps={{ max: today() }}
						InputLabelProps={{ shrink: true }}
					/>

					{isVaquillona && (
						<Box sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: '6px' }}>
							<FormControlLabel
								control={
									<Checkbox
										checked={becomesCow}
										onChange={(e) => setBecomesCow(e.target.checked)}
										size="small"
									/>
								}
								label={
									<Typography
										variant="body2"
										sx={{ fontWeight: 600 }}
									>
										Pasa a vaca
									</Typography>
								}
							/>
							<Typography
								variant="caption"
								sx={{ color: 'text.secondary', display: 'block', ml: 4, mt: -0.5 }}
							>
								Marcala si ya la manejás como vaca (por ejemplo, un aborto tardío). Queda como Vaca de
								Rodeo General con evento registrado.
							</Typography>
						</Box>
					)}

					<TextField
						label="Observaciones (opcional)"
						size="small"
						variant="filled"
						fullWidth
						multiline
						minRows={2}
						maxRows={4}
						value={notes}
						onChange={(e) => setNotes(e.target.value)}
						placeholder="Circunstancias, potrero, condición de la hembra..."
					/>
				</Stack>
			</DialogContent>

			<DialogActions
				sx={{
					p: 2,
					px: 3,
					borderTop: 1,
					borderColor: 'divider',
					bgcolor: 'background.default',
					justifyContent: 'flex-end',
					gap: 1
				}}
			>
				<Button
					onClick={onClose}
					color="inherit"
					size="small"
					disabled={registerAbortion.isPending}
				>
					Cancelar
				</Button>
				<Button
					variant="contained"
					color="error"
					size="small"
					onClick={handleSubmit}
					disabled={registerAbortion.isPending}
				>
					{registerAbortion.isPending ? 'Registrando...' : 'Confirmar aborto'}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export default RegisterAbortionDialog;
