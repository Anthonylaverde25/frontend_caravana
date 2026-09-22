import { useMemo, useState } from 'react';
import { Box, Button, Dialog, IconButton, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { BoardScope, BoardWidgetInstance, WidgetDefinition, WidgetSize } from '../../../types/dashboard.types';
import { WIDGET_DEFINITIONS, getWidgetDefinition } from '../../../registry/widgetRegistry';
import { NewWidgetInput } from '../../../hooks/useDashboardBoards';
import { CategoryFilter, WidgetCategoryNav } from './WidgetCategoryNav';
import { WidgetCatalogGrid } from './WidgetCatalogGrid';
import { WidgetConfigPanel } from './WidgetConfigPanel';

interface AddWidgetDialogProps {
	open: boolean;
	scope: BoardScope;
	boardWidgets: BoardWidgetInstance[];
	initialWidgetId?: string | null;
	onClose: () => void;
	onAdd: (input: NewWidgetInput) => void;
}

function matches(d: WidgetDefinition, term: string) {
	const q = term.trim().toLowerCase();

	return !q || `${d.name} ${d.description} ${d.source}`.toLowerCase().includes(q);
}

/** Orchestrator: catalog filters, current selection and its configuration. */
export function AddWidgetDialog({
	open,
	scope,
	boardWidgets,
	initialWidgetId = null,
	onClose,
	onAdd
}: AddWidgetDialogProps) {
	const initial = initialWidgetId ? (getWidgetDefinition(initialWidgetId) ?? null) : null;
	const [category, setCategory] = useState<CategoryFilter>(initial?.category ?? 'ALL');
	const [search, setSearch] = useState('');
	const [showUnavailable, setShowUnavailable] = useState(true);
	const [selected, setSelected] = useState<WidgetDefinition | null>(initial);
	const [title, setTitle] = useState('');
	const [size, setSize] = useState<WidgetSize>(initial?.defaultSize ?? 'S');
	const [config, setConfig] = useState<Record<string, string>>({});

	const usageById = useMemo(
		() =>
			boardWidgets.reduce<Record<string, number>>(
				(acc, w) => ({ ...acc, [w.widgetId]: (acc[w.widgetId] ?? 0) + 1 }),
				{}
			),
		[boardWidgets]
	);
	const visible = WIDGET_DEFINITIONS.filter((d) => showUnavailable || d.dataStatus !== 'REQUIRES_NEW_DATA');
	const counts = visible.reduce<Record<CategoryFilter, number>>(
		(acc, d) => ({ ...acc, [d.category]: (acc[d.category] ?? 0) + 1 }),
		{ ALL: visible.length } as Record<CategoryFilter, number>
	);
	const filtered = visible.filter((d) => (category === 'ALL' || d.category === category) && matches(d, search));
	const missingRequired = (selected?.configFields ?? []).some((f) => f.required && !config[f.key]);

	const handleSelect = (definition: WidgetDefinition) => {
		setSelected(definition);
		setSize(definition.defaultSize);
		setTitle('');
		setConfig({});
	};

	const handleAdd = () => {
		if (!selected || missingRequired) return;

		onAdd({
			widgetId: selected.id,
			size,
			title: title.trim() || undefined,
			config: Object.keys(config).length ? config : undefined
		});
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			fullWidth
			maxWidth="xl"
			aria-labelledby="add-widget-title"
			PaperProps={{
				sx: { borderRadius: '8px', boxShadow: 1, bgcolor: 'background.paper', height: 'min(900px, 92vh)' }
			}}
		>
			<Box
				sx={{
					p: 2,
					px: 3,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					borderBottom: 1,
					borderColor: 'divider'
				}}
			>
				<Typography
					id="add-widget-title"
					variant="h6"
					sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'text.primary' }}
				>
					Agregar widget
				</Typography>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
					<Typography
						sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}
					>{`${boardWidgets.length} widgets en el tablero`}</Typography>
					<IconButton
						onClick={onClose}
						aria-label="Cerrar"
						sx={{ color: 'primary.main' }}
					>
						<FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
					</IconButton>
				</Box>
			</Box>
			<Box
				sx={{
					flex: '1 1 auto',
					minHeight: 0,
					display: 'grid',
					gridTemplateColumns: { xs: '1fr', md: '220px 1fr 380px' }
				}}
			>
				<Box sx={{ display: { xs: 'none', md: 'block' } }}>
					<WidgetCategoryNav
						value={category}
						counts={counts}
						showUnavailable={showUnavailable}
						onChange={setCategory}
						onToggleUnavailable={setShowUnavailable}
					/>
				</Box>
				<WidgetCatalogGrid
					widgets={filtered}
					search={search}
					selectedId={selected?.id ?? null}
					usageById={usageById}
					onSearch={setSearch}
					onSelect={handleSelect}
				/>
				<Box sx={{ borderLeft: 1, borderColor: 'divider', minHeight: 0, display: 'flex' }}>
					<WidgetConfigPanel
						definition={selected}
						scope={scope}
						title={title}
						size={size}
						config={config}
						onTitleChange={setTitle}
						onSizeChange={setSize}
						onConfigChange={(key, value) => setConfig((prev) => ({ ...prev, [key]: value }))}
					/>
				</Box>
			</Box>
			<Box
				sx={{
					p: 2,
					px: 3,
					bgcolor: 'background.default',
					borderTop: 1,
					borderColor: 'divider',
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					gap: 2
				}}
			>
				<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
					Se agrega al final del tablero. Después podés moverlo.
				</Typography>
				<Box sx={{ display: 'flex', gap: 1 }}>
					<Button
						variant="text"
						onClick={onClose}
						sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}
					>
						Cancelar
					</Button>
					<Button
						variant="contained"
						onClick={handleAdd}
						disabled={!selected || missingRequired}
						sx={{
							bgcolor: 'primary.main',
							color: 'primary.contrastText',
							px: 3.5,
							fontWeight: 700,
							borderRadius: '6px',
							textTransform: 'none',
							boxShadow: 'none',
							'&:hover': { bgcolor: 'primary.dark', boxShadow: 'none' }
						}}
					>
						Agregar al tablero
					</Button>
				</Box>
			</Box>
		</Dialog>
	);
}

export default AddWidgetDialog;
