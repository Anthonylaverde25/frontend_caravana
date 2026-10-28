import { useEffect, useState } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, IconButton, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useSnackbar } from 'notistack';
import { useUpdatePartnerRoles } from '@/features/partners/hooks/useUpdatePartnerRoles';
import { PartnerRole } from '@/core/partners/domain/entities/PartnerRole';
import PartnerRoleCheckboxes from './PartnerRoleCheckboxes';

export interface PartnerRolesTarget {
	id: number;
	name: string;
	roles: PartnerRole[];
}

interface PartnerRolesDialogProps {
	partner: PartnerRolesTarget | null;
	onClose: () => void;
}

const apiMessage = (error: unknown) =>
	(error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'No se pudo guardar.';

/**
 * What the partner sells to us and buys from us. The backend keeps a role while something depends
 * on it (C2): item links need "vende artículos", origin farms need "vende hacienda"; its message
 * shows here.
 */
export default function PartnerRolesDialog({ partner, onClose }: PartnerRolesDialogProps) {
	const { enqueueSnackbar } = useSnackbar();
	const { mutate, isPending } = useUpdatePartnerRoles();
	const [roles, setRoles] = useState<PartnerRole[]>([]);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		setRoles(partner?.roles ?? []);
		setError(null);
	}, [partner]);

	const submit = () => {
		if (!partner) return;
		if (roles.length === 0) {
			setError('Marcá al menos un rol: qué nos vende o qué nos compra.');
			return;
		}
		mutate(
			{ id: partner.id, roles },
			{
				onSuccess: () => {
					enqueueSnackbar(`${partner.name} actualizado`, { variant: 'success' });
					onClose();
				},
				onError: (e) => setError(apiMessage(e))
			}
		);
	};

	return (
		<Dialog open={!!partner} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '8px', boxShadow: 1, bgcolor: 'background.paper' } }}>
			<Box sx={{ p: 2, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
				<Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'text.primary' }}>
					Roles de {partner?.name}
				</Typography>
				<IconButton onClick={onClose} size="small" sx={{ color: 'primary.main' }}>
					<FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
				</IconButton>
			</Box>
			<DialogContent sx={{ p: 3 }}>
				<PartnerRoleCheckboxes value={roles} onChange={setRoles} />
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
