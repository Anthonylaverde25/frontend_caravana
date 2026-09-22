import { Box, ButtonBase, InputAdornment, TextField, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { WidgetDefinition } from '../../../types/dashboard.types';
import { StatusPill } from '../../primitives/StatusPill';

interface WidgetCatalogGridProps {
	widgets: WidgetDefinition[];
	search: string;
	selectedId: string | null;
	usageById: Record<string, number>;
	onSearch: (value: string) => void;
	onSelect: (definition: WidgetDefinition) => void;
}

function SizeTag({ size }: { size: string }) {
	return (
		<Box
			component="span"
			sx={{
				px: 0.75,
				borderRadius: '4px',
				bgcolor: 'text.primary',
				color: 'background.paper',
				fontSize: '0.6875rem',
				fontWeight: 700
			}}
		>
			{size}
		</Box>
	);
}

function CatalogTile({
	definition,
	selected,
	usage,
	onSelect
}: {
	definition: WidgetDefinition;
	selected: boolean;
	usage: number;
	onSelect: () => void;
}) {
	const unavailable = definition.dataStatus === 'REQUIRES_NEW_DATA';

	return (
		<ButtonBase
			onClick={onSelect}
			disabled={unavailable}
			aria-pressed={selected}
			sx={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'stretch',
				gap: 0.75,
				p: 1.5,
				textAlign: 'left',
				borderRadius: '8px',
				border: selected ? 2 : 1,
				borderStyle: unavailable ? 'dashed' : 'solid',
				borderColor: selected ? 'primary.main' : 'divider',
				bgcolor: unavailable ? 'action.hover' : 'background.paper',
				'&.Mui-disabled': { opacity: 1 }
			}}
		>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
				<Typography
					sx={{
						fontSize: '0.875rem',
						fontWeight: 600,
						color: unavailable ? 'text.secondary' : 'text.primary'
					}}
				>
					{definition.name}
				</Typography>
				<Box sx={{ display: 'flex', gap: 0.5 }}>
					{definition.sizes.map((s) => (
						<SizeTag
							key={s}
							size={s}
						/>
					))}
				</Box>
			</Box>
			<Typography sx={{ fontSize: '0.75rem', color: unavailable ? 'warning.dark' : 'text.secondary' }}>
				{unavailable ? `Falta: ${definition.missingData}` : definition.description}
			</Typography>
			<Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
				{unavailable && (
					<StatusPill
						tone="warn"
						label="No disponible"
					/>
				)}
				{definition.dataStatus === 'LIVE' && (
					<StatusPill
						tone="info"
						label="Datos reales"
						hideIcon
					/>
				)}
				{usage > 0 && (
					<StatusPill
						tone="ok"
						label={usage > 1 ? `En el tablero ×${usage}` : 'En el tablero'}
					/>
				)}
			</Box>
		</ButtonBase>
	);
}

export function WidgetCatalogGrid({
	widgets,
	search,
	selectedId,
	usageById,
	onSearch,
	onSelect
}: WidgetCatalogGridProps) {
	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75, p: 2, minHeight: 0, overflowY: 'auto' }}>
			<TextField
				fullWidth
				variant="filled"
				size="small"
				label="Buscar widget"
				placeholder="Nombre, dato o tabla…"
				value={search}
				onChange={(e) => onSearch(e.target.value)}
				InputProps={{
					startAdornment: (
						<InputAdornment position="start">
							<FuseSvgIcon size={16}>heroicons-outline:magnifying-glass</FuseSvgIcon>
						</InputAdornment>
					)
				}}
				sx={{ '& .MuiFilledInput-root': { bgcolor: 'action.hover' } }}
			/>
			{widgets.length === 0 ? (
				<Typography sx={{ py: 4, textAlign: 'center', fontSize: '0.875rem', color: 'text.secondary' }}>
					Ningún widget coincide con la búsqueda.
				</Typography>
			) : (
				<Box
					sx={{
						display: 'grid',
						gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
						gap: 1.5
					}}
				>
					{widgets.map((d) => (
						<CatalogTile
							key={d.id}
							definition={d}
							selected={d.id === selectedId}
							usage={usageById[d.id] ?? 0}
							onSelect={() => onSelect(d)}
						/>
					))}
				</Box>
			)}
		</Box>
	);
}

export default WidgetCatalogGrid;
