import { Chip, Tooltip, Typography } from '@mui/material';
import type { ReproductiveStatus } from '@/core/caravans/domain/rules/isBreedingCandidate';

interface BreedingEligibilityChipProps {
	status: ReproductiveStatus;
	reasonLabel?: string | null;
	size?: 'small' | 'medium';
}

/**
 * Where the animal stands for breeding: APTA, EXCLUIDA with its reason, or "No aplica" for a
 * category that does not breed yet (a calf), which the owner never decided on.
 */
function BreedingEligibilityChip({ status, reasonLabel, size = 'small' }: BreedingEligibilityChipProps) {
	if (status === 'NOT_APPLICABLE') {
		return (
			<Tooltip title="Su categoría no se sirve. Se evalúa al pasar a vaquillona o torito.">
				<Typography
					component="span"
					variant="caption"
					sx={{ color: 'text.disabled', fontStyle: 'italic', cursor: 'help' }}
				>
					No aplica
				</Typography>
			</Tooltip>
		);
	}

	if (status === 'ELIGIBLE') {
		return <Chip size={size} label="APTA" color="success" variant="outlined" sx={{ fontWeight: 700, fontSize: '0.65rem' }} />;
	}

	return (
		<Tooltip title={reasonLabel ?? 'Excluida de reproducción sin motivo indicado'}>
			<Chip
				size={size}
				label={reasonLabel ? `EXCLUIDA · ${reasonLabel}` : 'EXCLUIDA'}
				sx={{ fontWeight: 700, fontSize: '0.65rem', maxWidth: 220, bgcolor: 'action.selected', color: 'text.secondary' }}
			/>
		</Tooltip>
	);
}

export default BreedingEligibilityChip;
