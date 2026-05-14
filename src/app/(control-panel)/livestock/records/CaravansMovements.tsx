import { Box, CircularProgress, Typography } from '@mui/material';
import { useState } from 'react';
import ViewLayout from 'src/components/ViewLayout';
import MovementDataTable from 'src/components/caravan/MovementDataTable';
import CaravanDetailDrawer from 'src/components/caravan/CaravanDetailDrawer';
import { useAllCaravanMovements } from '@/features/caravans/hooks/useCaravanMovements';
import { Button } from '@mui/material';
import { Link } from 'react-router';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

/**
 * CaravansMovements Component
 * Functional view showing the latest movements across the system.
 * Standardized using ViewLayout.
 */
function CaravansMovements() {
	const [selectedCaravan, setSelectedCaravan] = useState<string | null>(null);
	const { data: movements = [], isLoading } = useAllCaravanMovements();

	const handleCaravanClick = (identification: string) => {
		setSelectedCaravan(identification);
	};

	const handleCloseDrawer = () => {
		setSelectedCaravan(null);
	};

	return (
		<ViewLayout
			title="Historial de Movimientos"
			subtitle="Auditoría completa de trazabilidad: visualiza los últimos movimientos, ingresos y traslados registrados."
			actions={
				<Button
					variant="text"
					component={Link}
					to="/caravans"
					startIcon={<FuseSvgIcon size={20}>heroicons-outline:arrow-left</FuseSvgIcon>}
					sx={{ color: 'primary.main', fontWeight: 600, textTransform: 'none' }}
				>
					Volver a Caravanas
				</Button>
			}
		>
			<Box sx={{ position: 'relative', minHeight: 400 }}>
				{isLoading ? (
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							height: 400,
						}}
					>
						<CircularProgress
							size={32}
							thickness={5}
							sx={{ color: 'primary.main' }}
						/>
						<Typography
							variant="body2"
							sx={{ ml: 2, fontWeight: 700, color: 'text.secondary' }}
						>
							CARGANDO AUDITORÍA...
						</Typography>
					</Box>
				) : (
					<MovementDataTable
						data={movements as any}
						onCaravanClick={handleCaravanClick}
					/>
				)}
			</Box>

			<CaravanDetailDrawer
				open={!!selectedCaravan}
				onClose={handleCloseDrawer}
				caravanIdentification={selectedCaravan}
			/>
		</ViewLayout>
	);
}

export default CaravansMovements;