import { useEffect, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, IconButton, TextField, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useSnackbar } from 'notistack';
import { cuitReason, formatCuit } from '@/core/shared/domain/cuit';
import { useUpdateCompanyFiscalData } from '@/features/company/hooks/useUpdateCompanyFiscalData';

interface CompanyCuitDialogProps {
	open: boolean;
	onClose: () => void;
	companyName: string;
	cuit: string | null;
}

type ApiError = { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };

/**
 * The company's own CUIT: the receiver of the invoices its providers issue. Checked on click, as
 * the provider's; empty clears it.
 */
export default function CompanyCuitDialog({ open, onClose, companyName, cuit }: CompanyCuitDialogProps) {
	const { enqueueSnackbar } = useSnackbar();
	const { mutate, isPending } = useUpdateCompanyFiscalData();
	const [value, setValue] = useState('');
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (open) {
			setValue(cuit ? formatCuit(cuit) : '');
			setError(null);
		}
	}, [open, cuit]);

	const submit = () => {
		const reason = value.trim() === '' ? null : cuitReason(value);

		if (reason) {
			setError(reason);
			return;
		}

		mutate(value.trim() === '' ? null : value, {
			onSuccess: () => {
				enqueueSnackbar('CUIT de la empresa guardado', { variant: 'success' });
				onClose();
			},
			onError: (e) => {
				const body = (e as ApiError).response?.data;
				setError(body?.errors?.cuit?.[0] ?? body?.message ?? 'No se pudo guardar el CUIT');
			}
		});
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
					sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'text.primary' }}
				>
					CUIT de {companyName}
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
				<TextField
					autoFocus
					label="CUIT"
					placeholder="XX-XXXXXXXX-X"
					variant="filled"
					fullWidth
					value={value}
					onChange={(e) => setValue(e.target.value)}
					error={!!error}
					helperText={
						error ??
						'Es el receptor de las facturas de tus proveedores; con él se controla a nombre de quién están.'
					}
					sx={{ bgcolor: 'action.hover', mt: 1 }}
				/>
			</DialogContent>

			<DialogActions
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
					onClick={onClose}
					variant="text"
					sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}
				>
					Cancelar
				</Button>
				<Button
					onClick={submit}
					disabled={isPending}
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
					{isPending ? 'Guardando...' : 'Guardar'}
				</Button>
			</DialogActions>
		</Dialog>
	);
}
