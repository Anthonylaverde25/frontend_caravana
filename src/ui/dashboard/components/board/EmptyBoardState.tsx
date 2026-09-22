import { Box, Button, Chip, Paper, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { BatchTypeCode, WidgetDefinition } from '../../types/dashboard.types';
import { getWidgetDefinition } from '../../registry/widgetRegistry';
import { BATCH_TYPE_SCOPE_OPTIONS } from '../../registry/boardTemplates';

/** Widgets suggested for an empty board, by the batch type the board is scoped to. */
const SUGGESTIONS: Partial<Record<BatchTypeCode | 'ALL', string[]>> = {
	ALL: ['stock-total', 'repro-pregnancy-rate', 'ops-attention', 'stock-by-category'],
	SERVICE: ['repro-pregnancy-rate', 'repro-pregnancy-by-third', 'repro-bull-ratio-by-batch', 'repro-service-batches'],
	GROWING_REPLACEMENT_FEMALES: ['weights-vs-target', 'weights-adpv', 'weights-freshness', 'weights-dispersion'],
	GROWING_HEIFERS: ['weights-adpv', 'weights-batch-curve', 'weights-freshness', 'weights-change-breakdown'],
	GROWING_STEERS: ['weights-adpv', 'weights-batch-curve', 'weights-freshness', 'weights-adpv-by-batch'],
	WEANING: ['weights-weaning-weight', 'stock-balance', 'weights-dispersion']
};

interface EmptyBoardStateProps {
	batchTypeCode: BatchTypeCode | null;
	onOpenLibrary: () => void;
	onQuickAdd: (definition: WidgetDefinition) => void;
}

export function EmptyBoardState({ batchTypeCode, onOpenLibrary, onQuickAdd }: EmptyBoardStateProps) {
	const ids = SUGGESTIONS[batchTypeCode ?? 'ALL'] ?? SUGGESTIONS.ALL ?? [];
	const suggestions = ids.map(getWidgetDefinition).filter((d): d is WidgetDefinition => Boolean(d?.component));
	const scopeLabel = BATCH_TYPE_SCOPE_OPTIONS.find((o) => o.value === batchTypeCode)?.label;

	return (
		<Paper
			elevation={0}
			sx={{
				mx: 'auto',
				maxWidth: 640,
				p: { xs: 3, sm: 4.5 },
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				gap: 1.75,
				textAlign: 'center',
				border: 1,
				borderColor: 'divider',
				borderRadius: '12px'
			}}
		>
			<Box
				sx={{
					width: 56,
					height: 56,
					borderRadius: '14px',
					bgcolor: 'action.hover',
					color: 'primary.main',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center'
				}}
			>
				<FuseSvgIcon size={28}>heroicons-outline:rectangle-group</FuseSvgIcon>
			</Box>
			<Typography sx={{ fontSize: '1.25rem', fontWeight: 600 }}>El tablero está vacío</Typography>
			<Typography sx={{ fontSize: '0.875rem', color: 'text.secondary', maxWidth: 460 }}>
				Agregá widgets desde la biblioteca. Después podés moverlos, cambiarles el tamaño o quitarlos.
			</Typography>
			<Button
				variant="contained"
				onClick={onOpenLibrary}
				startIcon={<FuseSvgIcon size={16}>heroicons-outline:plus</FuseSvgIcon>}
				sx={{ px: 3.5, fontWeight: 700, borderRadius: '6px', textTransform: 'none', boxShadow: 'none' }}
			>
				Agregar widget
			</Button>
			{suggestions.length > 0 && (
				<Box
					sx={{
						width: '100%',
						mt: 1,
						pt: 2,
						borderTop: 1,
						borderColor: 'divider',
						display: 'flex',
						flexDirection: 'column',
						gap: 1.25,
						alignItems: 'center'
					}}
				>
					<Typography
						sx={{
							fontSize: '0.75rem',
							fontWeight: 600,
							letterSpacing: '0.06em',
							textTransform: 'uppercase',
							color: 'text.secondary'
						}}
					>
						{scopeLabel ? `Sugeridos para ${scopeLabel}` : 'Sugeridos'}
					</Typography>
					<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
						{suggestions.map((d) => (
							<Chip
								key={d.id}
								clickable
								onClick={() => onQuickAdd(d)}
								icon={<FuseSvgIcon size={14}>heroicons-outline:plus</FuseSvgIcon>}
								label={`${d.name} · ${d.defaultSize}`}
								variant="outlined"
							/>
						))}
					</Box>
				</Box>
			)}
		</Paper>
	);
}

export default EmptyBoardState;
