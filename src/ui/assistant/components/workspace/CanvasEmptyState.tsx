import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

const ANALYSIS_PROMPTS = [
	'Graficame la distribución de pesos de las hembras',
	'Peso promedio por categoría en un gráfico de barras',
	'¿Cómo viene el peso de un lote? Mostrame la curva',
	'Cabezas por categoría en una torta',
	'Valuación del inventario por depósito',
	'¿Qué insumos tienen stock crítico o bajo?'
];

interface CanvasEmptyStateProps {
	disabled: boolean;
	onPick: (prompt: string) => void;
}

/** What the canvas shows before the first answer: analysis questions the assistant can answer. */
export function CanvasEmptyState({ disabled, onPick }: CanvasEmptyStateProps) {
	return (
		<Box
			sx={{
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				textAlign: 'center',
				p: 4,
				gap: 2
			}}
		>
			<FuseSvgIcon
				size={40}
				sx={{ color: 'primary.main' }}
			>
				heroicons-outline:presentation-chart-line
			</FuseSvgIcon>
			<Box>
				<Typography sx={{ fontSize: '1.1rem', fontWeight: 600 }}>Analizá tu rodeo con XIMON</Typography>
				<Typography sx={{ fontSize: '0.85rem', color: 'text.secondary', maxWidth: 460, mt: 0.5 }}>
					Pedí gráficos, tablas y comparaciones. Los valores salen siempre de tus registros; acá se ven a
					tamaño completo.
				</Typography>
			</Box>
			<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', maxWidth: 560 }}>
				{ANALYSIS_PROMPTS.map((prompt) => (
					<Chip
						key={prompt}
						label={prompt}
						clickable
						disabled={disabled}
						onClick={() => onPick(prompt)}
						icon={<FuseSvgIcon size={14}>lucide:sparkles</FuseSvgIcon>}
						sx={{ bgcolor: 'action.hover', '&:hover': { bgcolor: 'action.selected' } }}
					/>
				))}
			</Box>
		</Box>
	);
}

export default CanvasEmptyState;
