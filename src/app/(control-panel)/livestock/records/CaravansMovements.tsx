import { Container, Box, CircularProgress, Typography } from '@mui/material';
import { useState } from 'react';
import ViewHeader from 'src/components/ViewHeader';
import MovementDataTable from 'src/components/caravan/MovementDataTable';
import CaravanDetailDrawer from 'src/components/caravan/CaravanDetailDrawer';
import { useAllCaravanMovements } from '@/features/caravans/hooks/useCaravanMovements';

/**
 * CaravansMovements Component
 * Functional view showing the latest movements across the system.
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
		<Container
			maxWidth="xl"
			sx={{
				display: 'flex',
				flexDirection: 'column',
				width: '100%',
			}}
		>
			<ViewHeader
				title="Historial de Movimientos"
				subtitle="Auditoría completa de trazabilidad: visualiza los últimos movimientos, ingresos y traslados registrados."
				backUrl="/caravans"
			/>

			<Box sx={{ mt: 1, position: 'relative', minHeight: 400 }}>
				{isLoading ? (
					<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
						<CircularProgress size={32} thickness={5} sx={{ color: 'primary.main' }} />
						<Typography variant="body2" sx={{ ml: 2, fontWeight: 700, color: 'text.secondary' }}>
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
		</Container>
	);
}

export default CaravansMovements;