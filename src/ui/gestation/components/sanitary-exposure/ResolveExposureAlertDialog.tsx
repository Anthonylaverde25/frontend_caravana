import { useEffect, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, IconButton, TextField, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useResolveSanitaryExposureAlert } from '@/features/gestation/hooks/useSanitaryExposureAlerts';

interface ResolveExposureAlertDialogProps {
	open: boolean;
	onClose: () => void;
	alertId: number;
	pendingCount: number;
}

/** Closes an exposure alert. A person states what was done: it never closes by itself. */
function ResolveExposureAlertDialog({ open, onClose, alertId, pendingCount }: ResolveExposureAlertDialogProps) {
	const resolve = useResolveSanitaryExposureAlert();
	const [resolution, setResolution] = useState('');
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (open) {
			setResolution('');
			setError(null);
		}
	}, [open]);

	const handleSubmit = () => {
		if (resolution.trim() === '') {
			setError('Indique cómo se resolvió la novedad.');
			return;
		}
		resolve.mutate({ alertId, resolution: resolution.trim() }, { onSuccess: onClose });
	};

	return (
		<Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '8px', boxShadow: 1, bgcolor: 'background.paper' } }}>
			<Box sx={{ p: 2, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
				<Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'text.primary' }}>
					Resolver novedad sanitaria
				</Typography>
				<IconButton onClick={onClose} size="small" sx={{ color: 'primary.main' }}>
					<FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
				</IconButton>
			</Box>
			<DialogContent sx={{ p: 3 }}>
				{pendingCount > 0 && (
					<Typography variant="body2" color="warning.main" sx={{ mb: 2, fontWeight: 600 }}>
						Quedan {pendingCount} vientre(s) sin revisar. Puede resolverla igual.
					</Typography>
				)}
				<TextField
					label="Resolución"
					placeholder="Ej.: 12 vacías a descarte, resto preñadas en seguimiento."
					value={resolution}
					onChange={(e) => {
						setResolution(e.target.value);
						setError(null);
					}}
					variant="filled"
					fullWidth
					multiline
					minRows={3}
					error={error !== null}
					helperText={error}
					sx={{ bgcolor: 'action.hover' }}
				/>
			</DialogContent>
			<DialogActions sx={{ p: 2, px: 3, bgcolor: 'background.default', borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
				<Button variant="text" onClick={onClose} sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}>
					Cancelar
				</Button>
				<Button
					variant="contained"
					onClick={handleSubmit}
					disabled={resolve.isPending}
					sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', px: 3.5, fontWeight: 700, borderRadius: '6px', textTransform: 'none', boxShadow: 'none', '&:hover': { bgcolor: 'primary.dark' } }}
				>
					Resolver
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export default ResolveExposureAlertDialog;
