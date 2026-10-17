import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

const QUICK_PROMPTS = [
	'¿Cuántas cabezas tengo por categoría?',
	'Estado de los servicios por lote',
	'Mostrame la ficha de una caravana',
	'¿Qué órdenes tengo pendientes?'
];

interface QuickPromptsProps {
	disabled: boolean;
	onPick: (prompt: string) => void;
}

/** Starting points that map to what the assistant can actually read today. */
export function QuickPrompts({ disabled, onPick }: QuickPromptsProps) {
	return (
		<Box>
			<Typography
				sx={{
					display: 'block',
					mb: 1,
					fontWeight: 600,
					color: 'text.secondary',
					textTransform: 'uppercase',
					letterSpacing: '0.05em',
					fontSize: '0.7rem'
				}}
			>
				Consultas sugeridas
			</Typography>
			<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
				{QUICK_PROMPTS.map((prompt) => (
					<Chip
						key={prompt}
						label={prompt}
						size="small"
						clickable
						disabled={disabled}
						onClick={() => onPick(prompt)}
						icon={<FuseSvgIcon size={14}>lucide:sparkles</FuseSvgIcon>}
						sx={{ fontSize: '0.75rem', bgcolor: 'action.hover', '&:hover': { bgcolor: 'action.selected' } }}
					/>
				))}
			</Box>
		</Box>
	);
}

export default QuickPrompts;
