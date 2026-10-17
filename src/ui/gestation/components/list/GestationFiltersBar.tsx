import {
	Box,
	Button,
	Chip,
	FormControl,
	IconButton,
	InputAdornment,
	MenuItem,
	Select,
	Stack,
	TextField,
	Typography,
	useTheme
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type {
	GestationAlertFilter,
	GestationListFilters,
	GestationRiskFilter,
	GestationStageFilter
} from './gestationListUtils';

interface GestationFiltersBarProps {
	filters: GestationListFilters;
	activeFiltersCount: number;
	onSearchChange: (search: string) => void;
	onStageChange: (stage: GestationStageFilter) => void;
	onRiskChange: (risk: GestationRiskFilter) => void;
	onAlertFilterChange: (alertFilter: GestationAlertFilter) => void;
	onResetFilters: () => void;
}

const STAGE_OPTIONS: { id: GestationStageFilter; label: string }[] = [
	{ id: 'ALL', label: 'Todos los Estadios' },
	{ id: 'head', label: 'Cabeza (> 2m)' },
	{ id: 'body', label: 'Cuerpo (1-2m)' },
	{ id: 'tail', label: 'Cola (< 1m)' }
];

const RISK_OPTIONS: { id: GestationRiskFilter; label: string }[] = [
	{ id: 'ALL', label: 'Todos los Riesgos' },
	{ id: 'High', label: 'Alto Riesgo' },
	{ id: 'Medium', label: 'Riesgo Medio' },
	{ id: 'Low', label: 'Riesgo Bajo' }
];

const ALERT_OPTIONS: { id: GestationAlertFilter; label: string }[] = [
	{ id: 'ALL', label: 'Todos los Estados' },
	{ id: 'IMMINENT', label: 'Parto Próximo (≤ 45 d)' },
	{ id: 'OVERDUE', label: 'Con Parto Vencido' }
];

function FilterDropdown<T extends string>({
	value,
	options,
	icon,
	minWidth,
	controlBg,
	borderColor,
	onChange
}: {
	value: T;
	options: { id: T; label: string }[];
	icon: string;
	minWidth: number;
	controlBg: string;
	borderColor: string;
	onChange: (next: T) => void;
}) {
	return (
		<FormControl
			size="small"
			sx={{ minWidth, bgcolor: controlBg, borderRadius: '6px' }}
		>
			<Select
				value={value}
				onChange={(e) => onChange(e.target.value as T)}
				displayEmpty
				renderValue={(selected) => {
					const opt = options.find((o) => o.id === selected);
					const active = selected !== 'ALL';
					return (
						<Stack
							direction="row"
							spacing={1}
							alignItems="center"
						>
							<FuseSvgIcon
								size={16}
								sx={{ color: active ? 'primary.main' : 'text.secondary' }}
							>
								{icon}
							</FuseSvgIcon>
							<Typography
								variant="body2"
								sx={{
									fontSize: '0.82rem',
									fontWeight: active ? 700 : 500,
									color: active ? 'primary.main' : 'text.primary'
								}}
							>
								{opt?.label ?? selected}
							</Typography>
						</Stack>
					);
				}}
				sx={{
					borderRadius: '6px',
					'& .MuiOutlinedInput-notchedOutline': { borderColor }
				}}
			>
				{options.map((opt) => (
					<MenuItem
						key={opt.id}
						value={opt.id}
					>
						<Typography
							variant="body2"
							sx={{ fontSize: '0.82rem' }}
						>
							{opt.label}
						</Typography>
					</MenuItem>
				))}
			</Select>
		</FormControl>
	);
}

/**
 * Filter bar for GestationListView, matching the Herd BatchFiltersBar surface and tokens.
 */
export function GestationFiltersBar({
	filters,
	activeFiltersCount,
	onSearchChange,
	onStageChange,
	onRiskChange,
	onAlertFilterChange,
	onResetFilters
}: GestationFiltersBarProps) {
	const theme = useTheme();
	const isDark = theme.palette.mode === 'dark';
	const borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0';
	const controlBg = isDark ? 'rgba(255, 255, 255, 0.04)' : '#ffffff';

	return (
		<Box
			sx={{
				p: 2.5,
				borderBottom: 1,
				borderColor: 'divider',
				bgcolor: isDark ? 'background.default' : '#f8fafc'
			}}
		>
			<Box sx={{ mb: 2 }}>
				<TextField
					size="small"
					placeholder="Buscar por nombre de lote, caravana (#identificación) o categoría..."
					value={filters.search}
					onChange={(e) => onSearchChange(e.target.value)}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<FuseSvgIcon
									size={18}
									sx={{ color: 'text.secondary' }}
								>
									heroicons-outline:magnifying-glass
								</FuseSvgIcon>
							</InputAdornment>
						),
						endAdornment: filters.search ? (
							<InputAdornment position="end">
								<IconButton
									size="small"
									onClick={() => onSearchChange('')}
									edge="end"
									aria-label="Limpiar búsqueda"
								>
									<FuseSvgIcon size={16}>heroicons-outline:x-mark</FuseSvgIcon>
								</IconButton>
							</InputAdornment>
						) : null
					}}
					sx={{
						width: { xs: '100%', md: 460 },
						bgcolor: controlBg,
						borderRadius: '6px',
						'& .MuiOutlinedInput-notchedOutline': { borderColor }
					}}
				/>
			</Box>

			<Stack
				direction={{ xs: 'column', sm: 'row' }}
				spacing={1.5}
				alignItems={{ xs: 'stretch', sm: 'center' }}
				flexWrap="wrap"
				useFlexGap
			>
				<FilterDropdown
					value={filters.stage}
					options={STAGE_OPTIONS}
					icon="heroicons-outline:chart-pie"
					minWidth={195}
					controlBg={controlBg}
					borderColor={borderColor}
					onChange={onStageChange}
				/>
				<FilterDropdown
					value={filters.risk}
					options={RISK_OPTIONS}
					icon="heroicons-outline:shield-exclamation"
					minWidth={195}
					controlBg={controlBg}
					borderColor={borderColor}
					onChange={onRiskChange}
				/>
				<FilterDropdown
					value={filters.alertFilter}
					options={ALERT_OPTIONS}
					icon="heroicons-outline:clock"
					minWidth={210}
					controlBg={controlBg}
					borderColor={borderColor}
					onChange={onAlertFilterChange}
				/>

				{activeFiltersCount > 0 && (
					<Button
						size="small"
						variant="outlined"
						onClick={onResetFilters}
						startIcon={<FuseSvgIcon size={16}>heroicons-outline:arrow-path</FuseSvgIcon>}
						sx={{
							borderRadius: '6px',
							textTransform: 'none',
							fontSize: '0.78rem',
							fontWeight: 600,
							color: 'text.secondary',
							borderColor,
							bgcolor: controlBg,
							'&:hover': { bgcolor: 'action.hover', borderColor: 'text.secondary' }
						}}
					>
						<Stack
							direction="row"
							spacing={1}
							alignItems="center"
						>
							<span>Limpiar filtros</span>
							<Chip
								label={activeFiltersCount}
								size="small"
								color="primary"
								sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800 }}
							/>
						</Stack>
					</Button>
				)}
			</Stack>
		</Box>
	);
}

export default GestationFiltersBar;
