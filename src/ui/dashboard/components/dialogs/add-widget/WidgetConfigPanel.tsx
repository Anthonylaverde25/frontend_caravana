import { Box, MenuItem, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { BoardScope, WidgetDefinition, WidgetSize } from '../../../types/dashboard.types';
import { BATCH_TYPE_SCOPE_OPTIONS } from '../../../registry/boardTemplates';
import { WidgetRenderer } from '../../board/WidgetRenderer';

interface WidgetConfigPanelProps {
	definition: WidgetDefinition | null;
	scope: BoardScope;
	title: string;
	size: WidgetSize;
	config: Record<string, string>;
	onTitleChange: (title: string) => void;
	onSizeChange: (size: WidgetSize) => void;
	onConfigChange: (key: string, value: string) => void;
}

const SIZES: WidgetSize[] = ['S', 'M', 'L'];
const PREVIEW_WIDTH: Record<WidgetSize, number> = { S: 320, M: 660, L: 1100 };

function SectionLabel({ children }: { children: string }) {
	return <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>{children}</Typography>;
}

export function WidgetConfigPanel({
	definition,
	scope,
	title,
	size,
	config,
	onTitleChange,
	onSizeChange,
	onConfigChange
}: WidgetConfigPanelProps) {
	if (!definition) {
		return (
			<Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
				<Typography sx={{ fontSize: '0.875rem', color: 'text.secondary', textAlign: 'center' }}>
					Elegí un widget de la biblioteca para configurarlo y ver su vista previa.
				</Typography>
			</Box>
		);
	}

	const scopeType =
		BATCH_TYPE_SCOPE_OPTIONS.find((o) => o.value === scope.batchTypeCode)?.label ?? 'todos los tipos de lote';
	const missingRequired = (definition.configFields ?? []).some((f) => f.required && !config[f.key]);
	const filled = { '& .MuiFilledInput-root': { bgcolor: 'action.hover' } };

	return (
		<Box
			sx={{
				p: 2.5,
				display: 'flex',
				flexDirection: 'column',
				gap: 2.25,
				overflowY: 'auto',
				bgcolor: 'background.default'
			}}
		>
			<Box>
				<Typography
					sx={{
						fontSize: '0.75rem',
						fontWeight: 600,
						letterSpacing: '0.06em',
						textTransform: 'uppercase',
						color: 'text.secondary'
					}}
				>
					Configurar
				</Typography>
				<Typography sx={{ fontSize: '1rem', fontWeight: 600 }}>{definition.name}</Typography>
				<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontFamily: 'monospace' }}>
					{definition.source}
				</Typography>
			</Box>
			<Box
				sx={{
					borderRadius: '8px',
					border: 1,
					borderColor: 'divider',
					bgcolor: 'background.paper',
					p: 1.25,
					overflow: 'hidden'
				}}
			>
				<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mb: 1 }}>
					{missingRequired
						? 'Completá los campos requeridos para ver la vista previa'
						: 'Vista previa con los datos del alcance'}
				</Typography>
				{!missingRequired && (
					<Box sx={{ width: PREVIEW_WIDTH[size], zoom: 320 / PREVIEW_WIDTH[size], pointerEvents: 'none' }}>
						<WidgetRenderer
							instance={{
								instanceId: 'preview',
								widgetId: definition.id,
								size,
								title: title || undefined,
								config
							}}
							scope={scope}
						/>
					</Box>
				)}
			</Box>
			<TextField
				fullWidth
				variant="filled"
				size="small"
				label="Título"
				value={title}
				placeholder={definition.name}
				onChange={(e) => onTitleChange(e.target.value)}
				sx={filled}
			/>
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
				<SectionLabel>Alcance</SectionLabel>
				<Box
					sx={{
						p: 1.25,
						borderRadius: '6px',
						border: 1,
						borderColor: 'divider',
						bgcolor: 'background.paper'
					}}
				>
					<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>Heredado del tablero</Typography>
					<Typography sx={{ fontSize: '0.8125rem' }}>{`Campaña ${scope.campaign} · ${scopeType}`}</Typography>
				</Box>
			</Box>
			{(definition.configFields ?? []).map((field) => (
				<TextField
					key={field.key}
					select
					fullWidth
					required={field.required}
					variant="filled"
					size="small"
					label={field.label}
					value={config[field.key] ?? ''}
					onChange={(e) => onConfigChange(field.key, e.target.value)}
					helperText={field.options.find((o) => o.value === config[field.key])?.helper ?? field.helper}
					sx={filled}
				>
					{field.options.map((o) => (
						<MenuItem
							key={o.value}
							value={o.value}
						>
							{o.label}
						</MenuItem>
					))}
				</TextField>
			))}
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
				<SectionLabel>Tamaño</SectionLabel>
				<ToggleButtonGroup
					exclusive
					fullWidth
					size="small"
					value={size}
					onChange={(_, value: WidgetSize | null) => value && onSizeChange(value)}
					aria-label="Tamaño del widget"
				>
					{SIZES.map((s) => (
						<ToggleButton
							key={s}
							value={s}
							disabled={!definition.sizes.includes(s)}
							sx={{ fontWeight: 700 }}
						>
							{s}
						</ToggleButton>
					))}
				</ToggleButtonGroup>
				{definition.sizeHint && (
					<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{definition.sizeHint}</Typography>
				)}
			</Box>
		</Box>
	);
}

export default WidgetConfigPanel;
