import { Drawer, Box, Typography, IconButton, Stack, Chip, alpha, useTheme } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

type BatchDetailRow = {
	id: number;
	name: string;
	farm_name?: string | null;
	provider_id?: number | null;
	provider_name?: string | null;
	activity_name?: string | null;
	batch_type_name?: string | null;
	batch_type_code?: string | null;
	weight?: number | null;
	min_weight?: number | null;
	max_weight?: number | null;
	knows_to_eat?: boolean | null;
	age_in_months?: number | null;
	is_active?: boolean;
	created_at?: string;
	observaciones?: string | null;
	caravans: { current_weight?: number | null }[];
};

type BatchDetailDrawerProps = {
	open: boolean;
	onClose: () => void;
	batch: BatchDetailRow | null;
};

function formatDate(value?: string): string {
	if (!value) return '-';

	const d = new Date(value);

	if (Number.isNaN(d.getTime())) return value;

	return d.toLocaleDateString('es-AR', { year: 'numeric', month: 'short', day: 'numeric' });
}

function InfoCell({ label, value, accent }: { label: string; value: React.ReactNode; accent?: 'primary' | 'success' }) {
	return (
		<Box sx={{ p: 1.5, borderRight: '1px solid', borderBottom: '1px solid', borderColor: 'divider' }}>
			<Typography
				variant="caption"
				color="text.secondary"
				sx={{ fontWeight: 700, fontSize: '0.6rem', textTransform: 'uppercase', display: 'block' }}
			>
				{label}
			</Typography>
			<Typography
				variant="body2"
				sx={{
					fontWeight: 700,
					color:
						accent === 'primary' ? 'primary.main' : accent === 'success' ? 'success.main' : 'text.primary'
				}}
			>
				{value}
			</Typography>
		</Box>
	);
}

/**
 * BatchDetailDrawer Component
 * Right-side drawer showing complete batch information (provider, weights, age, etc.)
 */
function BatchDetailDrawer({ open, onClose, batch }: BatchDetailDrawerProps) {
	const theme = useTheme();

	if (!batch) return null;

	const weightRangeLabel =
		batch.min_weight !== null &&
		batch.min_weight !== undefined &&
		batch.max_weight !== null &&
		batch.max_weight !== undefined
			? `${batch.min_weight} – ${batch.max_weight} kg`
			: batch.min_weight !== null && batch.min_weight !== undefined
				? `Mín: ${batch.min_weight} kg`
				: batch.max_weight !== null && batch.max_weight !== undefined
					? `Máx: ${batch.max_weight} kg`
					: '-';

	const knowsToEat =
		batch.knows_to_eat !== undefined && batch.knows_to_eat !== null ? Boolean(batch.knows_to_eat) : null;

	const hasAge = batch.age_in_months !== null && batch.age_in_months !== undefined;

	const avgWeight = (() => {
		const weights = (batch.caravans || []).filter((c) => c.current_weight).map((c) => c.current_weight);

		if (weights.length === 0) return null;

		return Math.round((weights.reduce((a, b) => (a as number) + (b as number), 0) as number) / weights.length);
	})();

	return (
		<Drawer
			anchor="right"
			open={open}
			onClose={onClose}
			PaperProps={{
				sx: {
					width: { xs: '100%', sm: 500 },
					borderRadius: 0,
					border: 'none',
					boxShadow: (t) => t.shadows[10]
				}
			}}
		>
			<Box sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
				{/* Header */}
				<Box
					sx={{
						p: 3,
						bgcolor: alpha(theme.palette.primary.main, 0.04),
						borderBottom: '1px solid',
						borderColor: 'divider'
					}}
				>
					<Stack
						direction="row"
						justifyContent="space-between"
						alignItems="flex-start"
					>
						<Box>
							<Typography
								variant="caption"
								sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 1 }}
							>
								LOTE / GRUPO PROPIO
							</Typography>
							<Typography
								variant="h5"
								sx={{ fontWeight: 900, color: 'primary.main', lineHeight: 1.25 }}
							>
								{batch.name || 'Sin nombre'}
							</Typography>
							<Typography
								variant="caption"
								sx={{ color: 'text.secondary', fontWeight: 500, display: 'block', mt: 0.5 }}
							>
								{batch.caravans.length}{' '}
								{batch.caravans.length === 1 ? 'animal registrado' : 'animales registrados'}
							</Typography>
						</Box>
						<IconButton
							onClick={onClose}
							size="small"
						>
							<FuseSvgIcon size={20}>heroicons-outline:x</FuseSvgIcon>
						</IconButton>
					</Stack>
				</Box>

				<Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto' }}>
					{/* General Data Grid - Spreadsheet style */}
					<Box
						sx={{
							mb: 4,
							display: 'grid',
							gridTemplateColumns: '1fr 1fr',
							border: '1px solid',
							borderColor: 'divider',
							borderRadius: '4px',
							overflow: 'hidden'
						}}
					>
						<InfoCell
							label="FINCA / ESTABLECIMIENTO"
							value={batch.farm_name || '-'}
						/>
						<InfoCell
							label="PROVEEDOR"
							value={
								batch.provider_name ||
								(batch.provider_id ? `Proveedor #${batch.provider_id}` : 'Sin proveedor (propio)')
							}
						/>
						<InfoCell
							label="TIPO DE LOTE"
							value={batch.batch_type_name || batch.batch_type_code || '-'}
							accent="primary"
						/>
						<InfoCell
							label="ACTIVIDAD"
							value={batch.activity_name || '-'}
						/>
						<InfoCell
							label="PESO PROMEDIO"
							value={avgWeight !== null ? `${avgWeight} kg` : batch.weight ? `${batch.weight} kg` : '-'}
							accent="success"
						/>
						<InfoCell
							label="RANGO DE PESO (MÍN – MÁX)"
							value={weightRangeLabel}
						/>
						<InfoCell
							label="SABE COMER"
							value={
								knowsToEat === null ? (
									'-'
								) : (
									<Chip
										label={knowsToEat ? 'SÍ' : 'NO'}
										size="small"
										color={knowsToEat ? 'success' : 'default'}
										sx={{ height: 18, fontSize: '0.6rem', fontWeight: 800, borderRadius: '4px' }}
									/>
								)
							}
						/>
						<InfoCell
							label="EDAD"
							value={hasAge ? `${batch.age_in_months} meses` : '-'}
						/>
						<InfoCell
							label="ESTADO"
							value={
								<Chip
									label={batch.is_active ? 'ACTIVO' : 'INACTIVO'}
									size="small"
									color={batch.is_active ? 'success' : 'error'}
									sx={{ height: 18, fontSize: '0.6rem', fontWeight: 800, borderRadius: '4px' }}
								/>
							}
						/>
						<InfoCell
							label="CREADO"
							value={formatDate(batch.created_at)}
						/>
					</Box>

					{/* Observations */}
					<Typography
						variant="overline"
						sx={{ fontWeight: 800, color: 'text.secondary', mb: 1, display: 'block' }}
					>
						OBSERVACIONES
					</Typography>
					<Box
						sx={{
							p: 2,
							border: '1px solid',
							borderColor: 'divider',
							borderRadius: '4px',
							bgcolor: alpha(theme.palette.background.default, 0.5)
						}}
					>
						<Typography
							variant="body2"
							sx={{ fontWeight: 500, color: batch.observaciones ? 'text.primary' : 'text.disabled' }}
						>
							{batch.observaciones || 'Sin observaciones registradas.'}
						</Typography>
					</Box>
				</Box>
			</Box>
		</Drawer>
	);
}

export default BatchDetailDrawer;
