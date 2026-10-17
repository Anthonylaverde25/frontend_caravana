import { Chip, Tooltip } from '@mui/material';
import type { FemaleOpenExposure } from '@/core/veterinary/domain/SanitaryExposure';

interface ExposureChipProps {
	exposures: FemaleOpenExposure[];
	onOpen?: (alertId: number) => void;
}

/**
 * Marks a female that served with a bull found positive to a contagious pathogen.
 */
function ExposureChip({ exposures, onOpen }: ExposureChipProps) {
	if (exposures.length === 0) return null;

	const first = exposures[0];
	const pending = exposures.some((e) => !e.reviewed);
	const label = `Expuesta a ${first.bull_tag} (${first.pathogen})${exposures.length > 1 ? ` +${exposures.length - 1}` : ''}`;

	return (
		<Tooltip title={pending ? 'Seguir en el tacto: estuvo en servicio con un toro positivo.' : 'Ya revisada.'}>
			<Chip
				size="small"
				label={label}
				color={pending ? 'error' : 'default'}
				variant={pending ? 'filled' : 'outlined'}
				onClick={onOpen ? () => onOpen(first.alert_id) : undefined}
				sx={{ height: 20, fontSize: '0.62rem', fontWeight: 700, maxWidth: 260 }}
			/>
		</Tooltip>
	);
}

export default ExposureChip;
