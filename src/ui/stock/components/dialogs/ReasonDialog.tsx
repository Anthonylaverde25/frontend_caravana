import { useEffect, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, IconButton, Stack, TextField, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

interface ReasonDialogProps {
	open: boolean;
	title: string;
	/** What will happen, in the operator's words. */
	consequences: string[];
	confirmLabel: string;
	busy: boolean;
	/** The backend's refusal (e.g. the hard block of plan 4.7), shown inside. */
	error: string | null;
	onClose: () => void;
	onConfirm: (reason: string) => void;
	/** "Motivo" by default; "Cómo se resolvió" when resolving a notice. */
	reasonLabel?: string;
	/** The note under the field; voids and reversals warn that they cannot be undone. */
	note?: string;
	confirmColor?: 'error' | 'primary';
}

const filled = { disableUnderline: true, sx: { borderRadius: '6px', bgcolor: 'action.hover' } } as const;

/** Voiding a provider document or reversing a stock operation: always with a reason, never undone. */
export default function ReasonDialog(props: ReasonDialogProps) {
	const { open, title, consequences, confirmLabel, busy, error, onClose, onConfirm } = props;
	const { reasonLabel = 'Motivo', note = 'No se puede deshacer. Si hubo un error de carga, después se vuelve a cargar bien.', confirmColor = 'error' } = props;
	const [reason, setReason] = useState('');
	const [missing, setMissing] = useState(false);
	useEffect(() => {
		if (open) {
			setReason('');
			setMissing(false);
		}
	}, [open]);

	const confirm = () => {
		if (!reason.trim()) {
			setMissing(true);
			return;
		}
		onConfirm(reason.trim());
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '8px', boxShadow: 1, bgcolor: 'background.paper' } }}>
			<Box sx={{ p: 2, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
				<Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
					{title}
				</Typography>
				<IconButton onClick={onClose} sx={{ color: 'primary.main' }}>
					<FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
				</IconButton>
			</Box>
			<DialogContent>
				<Stack spacing={2}>
					<Stack component="ul" spacing={0.5} sx={{ pl: 2.5, m: 0 }}>
						{consequences.map((c) => (
							<Typography key={c} component="li" variant="body2">
								{c}
							</Typography>
						))}
					</Stack>
					<TextField label={reasonLabel} variant="filled" fullWidth multiline minRows={2} value={reason} InputProps={filled} autoFocus
						onChange={(e) => setReason(e.target.value)} error={missing} helperText={missing ? `Completá: ${reasonLabel.toLowerCase()}.` : ' '} />
					<Alert severity="info" sx={{ fontSize: '0.8rem', py: 0.5 }}>
						{note}
					</Alert>
					{error && <Alert severity="error" sx={{ fontSize: '0.85rem' }}>{error}</Alert>}
				</Stack>
			</DialogContent>
			<DialogActions sx={{ p: 2, px: 3, bgcolor: 'background.default', borderTop: 1, borderColor: 'divider', justifyContent: 'space-between' }}>
				<Button onClick={onClose} sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}>
					Cancelar
				</Button>
				<Button variant="contained" color={confirmColor} onClick={confirm} disabled={busy} startIcon={busy ? <CircularProgress size={14} color="inherit" /> : undefined}
					sx={{ px: 3.5, fontWeight: 700, borderRadius: '6px', textTransform: 'none', boxShadow: 'none' }}>
					{confirmLabel}
				</Button>
			</DialogActions>
		</Dialog>
	);
}
