import { useEffect, useMemo, useState } from 'react';
import {
	Alert,
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	IconButton,
	MenuItem,
	Stack,
	TextField,
	ToggleButton,
	ToggleButtonGroup,
	Typography
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import {
	BreedingExclusionReasonCode,
	reasonRequiresNote,
	reasonsForSexes
} from '@/core/caravans/domain/entities/BreedingExclusionReason';
import { useBulkUpdateBreedingEligibility } from '@/features/caravans/hooks/useBulkUpdateBreedingEligibility';

export interface BreedingEligibilityTarget {
	id: number;
	identification: string;
	sex: 'M' | 'H' | null;
	is_breeding_eligible?: boolean;
}

interface BreedingEligibilityDialogProps {
	open: boolean;
	onClose: () => void;
	caravans: BreedingEligibilityTarget[];
	/** Called after a successful save (e.g. to clear a table selection). */
	onSaved?: () => void;
}

/**
 * The owner marks or unmarks one or many animals as fit for breeding. The decision applies to
 * the next service; it never touches the veterinary verdict.
 */
function BreedingEligibilityDialog({ open, onClose, caravans, onSaved }: BreedingEligibilityDialogProps) {
	const mutation = useBulkUpdateBreedingEligibility();
	const allEligible = caravans.every((c) => c.is_breeding_eligible !== false);
	const [isEligible, setIsEligible] = useState(!allEligible);
	const [reason, setReason] = useState<BreedingExclusionReasonCode | ''>('');
	const [note, setNote] = useState('');
	const [noteError, setNoteError] = useState<string | null>(null);

	// Reset only when the dialog opens: callers may pass a new caravans array on every render.
	useEffect(() => {
		if (open) {
			setIsEligible(!allEligible);
			setReason('');
			setNote('');
			setNoteError(null);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open]);

	const females = caravans.filter((c) => c.sex === 'H').length;
	const males = caravans.filter((c) => c.sex === 'M').length;
	const reasons = useMemo(() => {
		const sexes: ('M' | 'H')[] = [];
		if (females > 0) sexes.push('H');
		if (males > 0) sexes.push('M');
		return reasonsForSexes(sexes);
	}, [females, males]);

	const handleSubmit = () => {
		if (!isEligible && reasonRequiresNote(reason || null) && note.trim() === '') {
			setNoteError('Indique el motivo en la nota.');
			return;
		}
		mutation.mutate(
			{ caravanIds: caravans.map((c) => c.id), isEligible, reason: reason || null, note },
			{
				onSuccess: () => {
					onSaved?.();
					onClose();
				}
			}
		);
	};

	const summary = caravans.length === 1
		? caravans[0].identification
		: `${caravans.length} caravanas · ${females} H / ${males} M`;

	return (
		<Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '8px', boxShadow: 1, bgcolor: 'background.paper' } }}>
			<Box sx={{ p: 2, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
				<Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'text.primary' }}>
					Aptitud reproductiva
				</Typography>
				<IconButton onClick={onClose} size="small" sx={{ color: 'primary.main' }}>
					<FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
				</IconButton>
			</Box>

			<DialogContent sx={{ p: 3 }}>
				<Stack spacing={3}>
					<Alert severity="info" icon={<FuseSvgIcon size={18}>heroicons-outline:tag</FuseSvgIcon>} sx={{ borderRadius: '6px' }}>
						{summary}
					</Alert>

					<ToggleButtonGroup
						exclusive
						fullWidth
						color="primary"
						value={isEligible ? 'eligible' : 'excluded'}
						onChange={(_, value) => value && setIsEligible(value === 'eligible')}
					>
						<ToggleButton value="eligible" sx={{ textTransform: 'none', fontWeight: 600 }}>Apta para reproducción</ToggleButton>
						<ToggleButton value="excluded" sx={{ textTransform: 'none', fontWeight: 600 }}>Excluida de reproducción</ToggleButton>
					</ToggleButtonGroup>

					{!isEligible && (
						<>
							<TextField
								select
								label="Motivo (opcional)"
								value={reason}
								onChange={(e) => {
									setReason(e.target.value as BreedingExclusionReasonCode | '');
									setNoteError(null);
								}}
								variant="filled"
								fullWidth
								sx={{ bgcolor: 'action.hover' }}
								helperText={females > 0 && males > 0 ? 'Selección mixta: sólo motivos comunes a machos y hembras.' : undefined}
							>
								<MenuItem value="">Sin motivo</MenuItem>
								{reasons.map((r) => (
									<MenuItem key={r.code} value={r.code}>{r.label}</MenuItem>
								))}
							</TextField>
							<TextField
								label={reasonRequiresNote(reason || null) ? 'Nota (requerida)' : 'Nota (opcional)'}
								value={note}
								onChange={(e) => {
									setNote(e.target.value);
									setNoteError(null);
								}}
								variant="filled"
								fullWidth
								multiline
								minRows={2}
								inputProps={{ maxLength: 255 }}
								error={noteError !== null}
								helperText={noteError}
								sx={{ bgcolor: 'action.hover' }}
							/>
						</>
					)}

					<Alert severity="info" sx={{ fontSize: '0.8rem', py: 0.5 }}>
						Rige desde el próximo entore. Un animal que ya está en servicio sigue en su orden hasta que lo retire.
					</Alert>
				</Stack>
			</DialogContent>

			<DialogActions sx={{ p: 2, px: 3, bgcolor: 'background.default', borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<Button variant="text" onClick={onClose} sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}>
					Cancelar
				</Button>
				<Button
					variant="contained"
					onClick={handleSubmit}
					disabled={mutation.isPending}
					sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', px: 3.5, fontWeight: 700, borderRadius: '6px', textTransform: 'none', boxShadow: 'none', '&:hover': { bgcolor: 'primary.dark' } }}
				>
					{mutation.isPending ? 'Guardando...' : 'Confirmar'}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export default BreedingEligibilityDialog;
