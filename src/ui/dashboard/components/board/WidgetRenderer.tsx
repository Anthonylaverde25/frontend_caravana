import { Box, Paper, Tooltip, Typography } from '@mui/material';
import { BoardScope, BoardWidgetInstance } from '../../types/dashboard.types';
import { getWidgetDefinition } from '../../registry/widgetRegistry';

interface WidgetRendererProps {
	instance: BoardWidgetInstance;
	scope: BoardScope;
}

export function WidgetRenderer({ instance, scope }: WidgetRendererProps) {
	const definition = getWidgetDefinition(instance.widgetId);
	const Component = definition?.component;

	if (!Component) {
		return (
			<Paper
				elevation={0}
				sx={{
					p: 3,
					height: '100%',
					border: 1,
					borderStyle: 'dashed',
					borderColor: 'divider',
					borderRadius: '10px'
				}}
			>
				<Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
					{definition?.name ?? 'Widget no disponible'}
				</Typography>
				<Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
					{definition?.missingData ?? 'Este widget ya no existe en la biblioteca.'}
				</Typography>
			</Paper>
		);
	}

	if (definition.dataStatus !== 'STATIC_MOCK') {
		return (
			<Component
				instance={instance}
				scope={scope}
			/>
		);
	}

	// Until its hook exists, a static widget must never be read as real data.
	return (
		<Box sx={{ position: 'relative', height: '100%' }}>
			<Component
				instance={instance}
				scope={scope}
			/>
			<Tooltip title={`Todavía no conectado. Fuente prevista: ${definition.source}`}>
				<Box
					component="span"
					sx={{
						position: 'absolute',
						right: 10,
						bottom: 8,
						px: 0.75,
						borderRadius: '4px',
						border: 1,
						borderStyle: 'dashed',
						borderColor: 'warning.main',
						bgcolor: 'background.paper',
						color: 'warning.dark',
						fontSize: '0.6875rem',
						fontWeight: 600
					}}
				>
					Datos de ejemplo
				</Box>
			</Tooltip>
		</Box>
	);
}

export default WidgetRenderer;
