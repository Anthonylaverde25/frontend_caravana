import React, { useEffect, useState } from 'react';
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
import { filledInputProps } from '@/ui/weaning-orders/components/form/formStyles';
import { useAddExitOrderDte } from '@/features/exit-orders/hooks/useExitOrderMutations';
import { type ExitOrder, exitErrorBody } from '@/features/exit-orders/types';
import { localToday } from '../exitOrderFormat';

interface AddExitDteDialogProps {
	order: ExitOrder | null;
	onClose: () => void;
}

/** A DTE loaded after the exit: number, date and heads, precharged with the animals that left. */
export const AddExitDteDialog: React.FC<AddExitDteDialogProps> = ({ order, onClose }) => {
	const add = useAddExitOrderDte();
	const [number, setNumber] = useState('');
	const [date, setDate] = useState(localToday());
	const [heads, setHeads] = useState('');
	const [observations, setObservations] = useState('');
	const [errors, setErrors] = useState<Record<string, string>>({});

	useEffect(() => {
		if (!order) return;

		setNumber('');
		setDate(order.exit_date <= localToday() ? order.exit_date : localToday());
		setHeads(String(Math.max(order.exited_count - order.dte_head_count, 1)));
		setObservations('');
		setErrors({});
	}, [order]);

	const submit = () => {
		if (!order) return;

		// Validated on click: the button is never disabled for missing data.
		const local: Record<string, string> = {};

		if (!number.trim()) local.dte_number = 'Indicá el número del DTE.';

		if (!date) local.dte_date = 'Indicá la fecha del DTE.';

		if (!(Number(heads) >= 1)) local.head_count = 'Indicá las cabezas del DTE.';

		setErrors(local);

		if (Object.keys(local).length > 0) return;

		add.mutate(
			{
				id: order.id,
				payload: {
					dte_number: number.trim(),
					dte_date: date,
					head_count: Number(heads),
					observations: observations.trim() || null
				}
			},
			{
				onSuccess: onClose,
				onError: (error) => {
					const body = exitErrorBody(error);
					const mapped = Object.fromEntries(
						Object.entries(body?.errors ?? {}).map(([key, messages]) => [key, messages[0]])
					);

					setErrors(
						Object.keys(mapped).length > 0
							? mapped
							: { general: body?.message ?? 'No se pudo cargar el DTE.' }
					);
				}
			}
		);
	};

	return (
		<Dialog
			open={order != null}
			onClose={onClose}
			fullWidth
			maxWidth="sm"
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
					sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'text.primary' }}
				>
					Cargar DTE ·{' '}
					<Box
						component="span"
						sx={{ fontFamily: 'monospace' }}
					>
						{order?.code}
					</Box>
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
					{errors.general && (
						<Alert
							severity="error"
							sx={{ borderRadius: '6px' }}
						>
							{errors.general}
						</Alert>
					)}
					<TextField
						label="Número de DTE"
						variant="filled"
						fullWidth
						autoFocus
						value={number}
						onChange={(e) => setNumber(e.target.value)}
						InputProps={filledInputProps}
						error={!!errors.dte_number}
						helperText={errors.dte_number}
					/>
					<Stack
						direction="row"
						spacing={2}
					>
						<TextField
							label="Fecha"
							type="date"
							variant="filled"
							fullWidth
							value={date}
							onChange={(e) => setDate(e.target.value)}
							InputProps={filledInputProps}
							InputLabelProps={{ shrink: true }}
							error={!!errors.dte_date}
							helperText={errors.dte_date}
						/>
						<TextField
							label="Cabezas"
							type="number"
							variant="filled"
							fullWidth
							value={heads}
							onChange={(e) => setHeads(e.target.value)}
							InputProps={filledInputProps}
							inputProps={{ min: 1 }}
							error={!!errors.head_count}
							helperText={errors.head_count}
						/>
					</Stack>
					<TextField
						label="Observaciones"
						variant="filled"
						fullWidth
						multiline
						minRows={2}
						value={observations}
						onChange={(e) => setObservations(e.target.value)}
						InputProps={filledInputProps}
					/>
				</Stack>
			</DialogContent>
			<DialogActions
				sx={{
					p: 2,
					px: 3,
					bgcolor: 'background.default',
					borderTop: 1,
					borderColor: 'divider',
					display: 'flex',
					justifyContent: 'space-between'
				}}
			>
				<Button
					onClick={onClose}
					variant="text"
					sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}
				>
					Cancelar
				</Button>
				<Button
					onClick={submit}
					disabled={add.isPending}
					variant="contained"
					sx={{
						bgcolor: 'primary.main',
						color: 'primary.contrastText',
						px: 3.5,
						fontWeight: 700,
						borderRadius: '6px',
						textTransform: 'none',
						boxShadow: 'none',
						'&:hover': { bgcolor: 'primary.dark' }
					}}
				>
					{add.isPending ? 'Guardando...' : 'Cargar DTE'}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default AddExitDteDialog;
