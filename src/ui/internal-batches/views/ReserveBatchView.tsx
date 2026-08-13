'use client';

import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import ViewLayout from 'src/components/ViewLayout';
import {
	Box,
	Button,
	Chip,
	CircularProgress,
	Paper,
	Stack,
	Typography,
	useTheme,
	alpha,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useCompany } from '@/contexts/CompanyContext';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import { useReserveBatch } from '@/features/batches/hooks/useReserveBatch';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';
import ReserveCaravanDataTable from '../components/ReserveCaravanDataTable';

/**
 * ReserveBatchView Component
 * Renders the dedicated animal inventory for the System Reserve Batch (Lote Reserva | Animales Apartados).
 * Displays all caravans assigned to this structural system batch with KPIs and pedigree shortcuts.
 */
function ReserveBatchView() {
	const theme = useTheme();
	const isDark = theme.palette.mode === 'dark';
	const navigate = useNavigate();

	const { activeCompanyId } = useCompany();
	const { data: reserveBatch, isLoading: isLoadingBatch } = useReserveBatch();
	const { data: caravans = [], isLoading: isLoadingCaravans } = useCaravans(activeCompanyId);

	// Map of all caravans for fast Wright inbreeding calculation
	const allCaravansMap = useMemo(() => {
		const map = new Map<number, Caravan>();
		caravans.forEach((c) => map.set(c.id, c));
		return map;
	}, [caravans]);

	// Filter only caravans belonging to the System Reserve Batch
	const reserveCaravans = useMemo(() => {
		if (!reserveBatch) return [];
		return caravans.filter((c) => c.batch_id === reserveBatch.id);
	}, [caravans, reserveBatch]);

	// Calculate summary metrics
	const metrics = useMemo(() => {
		const total = reserveCaravans.length;
		const females = reserveCaravans.filter((c) => c.sex === 'H').length;
		const males = reserveCaravans.filter((c) => c.sex === 'M').length;
		const totalWeight = reserveCaravans.reduce((sum, c) => sum + (c.entry_weight || 0), 0);
		const avgWeight = total > 0 ? (totalWeight / total).toFixed(1) : '0';

		return {
			total,
			females,
			males,
			avgWeight,
		};
	}, [reserveCaravans]);

	const isLoading = isLoadingBatch || isLoadingCaravans;

	if (isLoading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: 2 }}>
				<CircularProgress />
				<Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
					Cargando Lote Reserva e inventario de animales apartados...
				</Typography>
			</Box>
		);
	}

	return (
		<ViewLayout
			title="Lote Reserva | Animales Apartados"
			subtitle="Lote interno protegido del sistema para animales apartados por consanguinidad, descarte reproductivo o reserva genética."
			actions={
				<Stack direction="row" spacing={1.5} alignItems="center">
					<Chip
						icon={<FuseSvgIcon size={16}>heroicons-outline:shield-check</FuseSvgIcon>}
						label="Lote del Sistema (Inmutable)"
						variant="filled"
						sx={{
							fontWeight: 800,
							fontSize: '0.75rem',
							bgcolor: '#6366f1',
							color: '#ffffff',
						}}
					/>

					<Button
						variant="contained"
						color="primary"
						startIcon={<FuseSvgIcon size={18}>heroicons-outline:academic-cap</FuseSvgIcon>}
						onClick={() => navigate('/gestation/pedigree')}
						sx={{
							fontWeight: 800,
							textTransform: 'none',
							borderRadius: '6px',
							boxShadow: 'none',
							'&:hover': { boxShadow: 'none' },
						}}
					>
						Apartar Más desde Pedigree
					</Button>
				</Stack>
			}
		>
			<Stack spacing={3}>
				{/* 1. Summary KPI Cards */}
				<Box
					sx={{
						display: 'grid',
						gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
						gap: 2,
					}}
				>
					{/* Card 1: Total Isolated */}
					<Paper
						elevation={0}
						sx={{
							p: 2,
							borderRadius: '8px',
							border: '1px solid',
							borderColor: 'divider',
							bgcolor: 'background.paper',
						}}
					>
						<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
							Animales en Reserva
						</Typography>
						<Typography variant="h5" sx={{ fontWeight: 900, color: '#4f46e5', mt: 0.5 }}>
							{metrics.total} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'gray' }}>cabezas</span>
						</Typography>
					</Paper>

					{/* Card 2: Females */}
					<Paper
						elevation={0}
						sx={{
							p: 2,
							borderRadius: '8px',
							border: '1px solid',
							borderColor: 'divider',
							bgcolor: 'background.paper',
						}}
					>
						<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
							Hembras Apartadas
						</Typography>
						<Typography variant="h5" sx={{ fontWeight: 900, color: 'secondary.main', mt: 0.5 }}>
							{metrics.females} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'gray' }}>hembras (♀)</span>
						</Typography>
					</Paper>

					{/* Card 3: Males */}
					<Paper
						elevation={0}
						sx={{
							p: 2,
							borderRadius: '8px',
							border: '1px solid',
							borderColor: 'divider',
							bgcolor: 'background.paper',
						}}
					>
						<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
							Machos Apartados
						</Typography>
						<Typography variant="h5" sx={{ fontWeight: 900, color: 'info.main', mt: 0.5 }}>
							{metrics.males} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'gray' }}>machos (♂)</span>
						</Typography>
					</Paper>

					{/* Card 4: Average Weight */}
					<Paper
						elevation={0}
						sx={{
							p: 2,
							borderRadius: '8px',
							border: '1px solid',
							borderColor: 'divider',
							bgcolor: 'background.paper',
						}}
					>
						<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
							Peso Promedio en Reserva
						</Typography>
						<Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary', mt: 0.5 }}>
							{metrics.avgWeight} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'gray' }}>kg / cab</span>
						</Typography>
					</Paper>
				</Box>

				{/* 2. System Batch Descriptive Info */}
				<Paper
					elevation={0}
					sx={{
						p: 2,
						borderRadius: '6px',
						border: '1px solid',
						borderColor: '#c7d2fe',
						bgcolor: isDark ? 'rgba(99, 102, 241, 0.08)' : '#eef2ff',
						borderLeft: '4px solid #6366f1',
					}}
				>
					<Stack direction="row" spacing={2} alignItems="center">
						<Box>
							<Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#3730a3' }}>
								🏷️ Inventario de Animales Aislados del Rodeo Activo
							</Typography>
							<Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.82rem', mt: 0.3 }}>
								Los animales listados en esta vista fueron transferidos al Lote Reserva para evitar emparejamientos con alta consanguinidad, para engorde o para destino a faena.
							</Typography>
						</Box>
					</Stack>
				</Paper>

				{/* 3. Dedicated Caravans DataTable */}
				{reserveCaravans.length > 0 ? (
					<ReserveCaravanDataTable
						caravans={reserveCaravans}
						allCaravansMap={allCaravansMap}
					/>
				) : (
					<Paper
						elevation={0}
						sx={{
							p: 6,
							textAlign: 'center',
							borderRadius: '8px',
							border: 1,
							borderColor: 'divider',
							bgcolor: 'background.paper',
						}}
					>
						<Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
							<FuseSvgIcon size={48} color="disabled">
								heroicons-outline:archive-box
							</FuseSvgIcon>
						</Box>
						<Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', mb: 1 }}>
							No hay animales apartados en este momento
						</Typography>
						<Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
							Actualmente no se registran caravanas asignadas al Lote Reserva. Puede transferir animales con consanguinidad crítica o alertas desde la tabla de Pedigree.
						</Typography>
						<Button
							variant="contained"
							color="primary"
							startIcon={<FuseSvgIcon size={18}>heroicons-outline:academic-cap</FuseSvgIcon>}
							onClick={() => navigate('/gestation/pedigree')}
							sx={{ fontWeight: 800, textTransform: 'none', px: 3 }}
						>
							Ir a Pedigree & Genealogía
						</Button>
					</Paper>
				)}
			</Stack>
		</ViewLayout>
	);
}

export default ReserveBatchView;
