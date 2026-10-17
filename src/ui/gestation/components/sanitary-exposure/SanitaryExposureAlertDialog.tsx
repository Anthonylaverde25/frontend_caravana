import { useEffect, useState } from 'react';
import { Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, IconButton, Stack, TextField, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useBatches } from '@/features/batches/hooks/useBatches';
import { useReviewExposedFemales, useSanitaryExposureAlert } from '@/features/gestation/hooks/useSanitaryExposureAlerts';
import RetireServiceBullDialog from '../dialogs/RetireServiceBullDialog';
import ExposedFemalesTable from './ExposedFemalesTable';
import ResolveExposureAlertDialog from './ResolveExposureAlertDialog';

interface SanitaryExposureAlertDialogProps {
	alertId: number | null;
	onClose: () => void;
}

/**
 * A bull found positive to a contagious pathogen and the females that served with him. Nothing
 * here blocks: the bull can be taken out, the females marked as reviewed and the alert resolved.
 */
function SanitaryExposureAlertDialog({ alertId, onClose }: SanitaryExposureAlertDialogProps) {
	const { data: alert, isLoading } = useSanitaryExposureAlert(alertId);
	const { data: batches = [] } = useBatches(undefined, undefined, 'own');
	const review = useReviewExposedFemales();
	const [selectedIds, setSelectedIds] = useState<number[]>([]);
	const [note, setNote] = useState('');
	const [resolving, setResolving] = useState(false);
	const [retiring, setRetiring] = useState(false);

	useEffect(() => {
		setSelectedIds([]);
		setNote('');
	}, [alertId]);

	const isOpen = alert?.status === 'OPEN';
	const pendingCount = alert ? alert.females_count - alert.reviewed_count : 0;

	const handleReview = () => {
		if (!alert || selectedIds.length === 0) return;
		review.mutate({ alertId: alert.id, femaleIds: selectedIds, note }, { onSuccess: () => setSelectedIds([]) });
	};

	return (
		<Dialog open={alertId !== null} onClose={onClose} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: '8px', boxShadow: 1, bgcolor: 'background.paper' } }}>
			<Box sx={{ p: 2, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
				<Stack direction="row" spacing={1.5} alignItems="center">
					<Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'text.primary' }}>
						Novedad sanitaria{alert ? ` · ${alert.bull.identification}` : ''}
					</Typography>
					{alert && <Chip size="small" label={isOpen ? 'ABIERTA' : 'RESUELTA'} color={isOpen ? 'error' : 'default'} sx={{ fontWeight: 700 }} />}
				</Stack>
				<IconButton onClick={onClose} size="small" sx={{ color: 'primary.main' }}>
					<FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
				</IconButton>
			</Box>

			<DialogContent sx={{ p: 3 }}>
				{isLoading || !alert ? (
					<Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
						<CircularProgress size={28} />
					</Box>
				) : (
					<Stack spacing={2}>
						<Alert severity={isOpen ? 'error' : 'success'} sx={{ fontSize: '0.85rem' }}>
							{alert.detail}
						</Alert>

						{isOpen && alert.bull_active_order && (
							<Alert
								severity="warning"
								sx={{ fontSize: '0.8rem', alignItems: 'center' }}
								action={
									<Button size="small" color="inherit" variant="outlined" onClick={() => setRetiring(true)} sx={{ textTransform: 'none', fontWeight: 700 }}>
										Retirar toro
									</Button>
								}
							>
								{alert.bull.identification} sigue trabajando en {alert.bull_active_order.code}.
							</Alert>
						)}

						{!isOpen && alert.resolution && (
							<Alert severity="info" sx={{ fontSize: '0.8rem' }}>
								Resuelta{alert.resolved_by ? ` por ${alert.resolved_by}` : ''}: {alert.resolution}
							</Alert>
						)}

						<Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
							Vientres expuestos ({alert.reviewed_count}/{alert.females_count} revisados)
						</Typography>

						<ExposedFemalesTable females={alert.females} selectedIds={selectedIds} onSelectionChange={setSelectedIds} selectable={isOpen} />

						{isOpen && selectedIds.length > 0 && (
							<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
								<TextField
									size="small"
									label="Nota de revisión (opcional)"
									value={note}
									onChange={(e) => setNote(e.target.value)}
									variant="filled"
									inputProps={{ maxLength: 255 }}
									sx={{ bgcolor: 'action.hover', flex: 1 }}
								/>
								<Button variant="outlined" onClick={handleReview} disabled={review.isPending} sx={{ textTransform: 'none', fontWeight: 700 }}>
									Marcar {selectedIds.length} como revisada(s)
								</Button>
							</Stack>
						)}
					</Stack>
				)}
			</DialogContent>

			<DialogActions sx={{ p: 2, px: 3, bgcolor: 'background.default', borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
				<Button variant="text" onClick={onClose} sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}>
					Cerrar
				</Button>
				{alert && isOpen && (
					<Button
						variant="contained"
						onClick={() => setResolving(true)}
						sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', px: 3.5, fontWeight: 700, borderRadius: '6px', textTransform: 'none', boxShadow: 'none', '&:hover': { bgcolor: 'primary.dark' } }}
					>
						Resolver novedad
					</Button>
				)}
			</DialogActions>

			{alert && (
				<>
					<ResolveExposureAlertDialog open={resolving} onClose={() => setResolving(false)} alertId={alert.id} pendingCount={pendingCount} />
					<RetireServiceBullDialog
						open={retiring}
						onClose={() => setRetiring(false)}
						bull={alert.bull}
						order={alert.bull_active_order ? { id: alert.bull_active_order.service_order_id, code: alert.bull_active_order.code, batch_id: alert.bull_active_order.batch_id } : null}
						batches={batches}
						defaultReason="SANITARY_REJECTION"
					/>
				</>
			)}
		</Dialog>
	);
}

export default SanitaryExposureAlertDialog;
