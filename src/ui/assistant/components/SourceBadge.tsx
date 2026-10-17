import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

/**
 * Where an answer comes from. "Tus registros" only when a data tool actually answered; anything
 * else is the model's general knowledge and must not read as the user's data.
 */
export function SourceBadge({ grounded }: { grounded: boolean }) {
	const label = grounded ? 'Basado en tus registros' : 'Conocimiento general';
	const help = grounded
		? 'Los datos de esta respuesta salen del sistema, con tus permisos.'
		: 'Esta respuesta no consultó tus registros.';

	return (
		<Tooltip
			title={help}
			placement="top"
			arrow
		>
			<Box
				sx={{
					display: 'inline-flex',
					alignItems: 'center',
					gap: 0.5,
					px: 0.75,
					py: 0.25,
					borderRadius: '4px',
					fontSize: '0.66rem',
					fontWeight: 700,
					color: grounded ? 'primary.main' : 'text.secondary',
					bgcolor: grounded ? 'rgba(14, 61, 38, 0.08)' : 'action.hover'
				}}
			>
				<FuseSvgIcon size={12}>
					{grounded ? 'heroicons-outline:circle-stack' : 'heroicons-outline:book-open'}
				</FuseSvgIcon>
				{label}
			</Box>
		</Tooltip>
	);
}

export default SourceBadge;
