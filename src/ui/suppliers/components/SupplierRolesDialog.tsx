import { useEffect, useState } from 'react';
import { Alert, Box, Button, Checkbox, Dialog, DialogActions, DialogContent, FormControlLabel, IconButton, Stack, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useSnackbar } from 'notistack';
import { useUpdateSupplierRoles } from '@/features/suppliers/hooks/useUpdateSupplierRoles';

export interface SupplierRolesTarget {
	id: number;
	name: string;
	supplies_livestock?: boolean;
	supplies_items?: boolean;
}

interface SupplierRolesDialogProps {
	supplier: SupplierRolesTarget | null;
	onClose: () => void;
}

const apiMessage = (error: unknown) =>
	(error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'No se pudo guardar.';

/**
 * What the provider sells. The backend keeps a role while something depends on it: item links need
 * "artículos o servicios", origin farms need "hacienda" (DB5); its message shows here.
 */
export default function SupplierRolesDialog({ supplier, onClose }: SupplierRolesDialogProps) {
	const { enqueueSnackbar } = useSnackbar();
	const { mutate, isPending } = useUpdateSupplierRoles();
	const [livestock, setLivestock] = useState(false);
	const [items, setItems] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		setLivestock(!!supplier?.supplies_livestock);
		setItems(!!supplier?.supplies_items);
		setError(null);
	}, [supplier]);

	const submit = () => {
		if (!supplier) return;
		if (!livestock && !items) {
			setError('Marcá al menos qué vende: hacienda, o artículos y servicios.');
			return;
		}
		mutate(
			{ id: supplier.id, roles: { supplies_livestock: livestock, supplies_items: items } },
			{
				onSuccess: () => {
					enqueueSnackbar(`${supplier.name} actualizado`, { variant: 'success' });
					onClose();
				},
				onError: (e) => setError(apiMessage(e))
			}
		);
	};

	return (
		<Dialog open={!!supplier} onClose={onClose} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: '8px', boxShadow: 1, bgcolor: 'background.paper' } }}>
			<Box sx={{ p: 2, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
				<Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'text.primary' }}>
					Qué vende {supplier?.name}
				</Typography>
				<IconButton onClick={onClose} size="small" sx={{ color: 'primary.main' }}>
					<FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
				</IconButton>
			</Box>
			<DialogContent sx={{ p: 3 }}>
				<Stack>
					<FormControlLabel control={<Checkbox checked={livestock} onChange={(e) => setLivestock(e.target.checked)} />} label="Vende hacienda" />
					<FormControlLabel control={<Checkbox checked={items} onChange={(e) => setItems(e.target.checked)} />} label="Vende artículos o servicios" />
				</Stack>
				{error && <Alert severity="error" sx={{ mt: 2, fontSize: '0.8rem', py: 0.5 }}>{error}</Alert>}
			</DialogContent>
			<DialogActions sx={{ p: 2, px: 3, bgcolor: 'background.default', borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
				<Button onClick={onClose} variant="text" sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}>
					Cancelar
				</Button>
				<Button
					onClick={submit}
					disabled={isPending}
					variant="contained"
					sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', px: 3.5, fontWeight: 700, borderRadius: '6px', textTransform: 'none', boxShadow: 'none', '&:hover': { bgcolor: 'primary.dark' } }}
				>
					{isPending ? 'Guardando...' : 'Guardar'}
				</Button>
			</DialogActions>
		</Dialog>
	);
}
