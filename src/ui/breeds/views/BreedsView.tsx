import { Box, Paper } from '@mui/material';
import ViewLayout from 'src/components/ViewLayout';
import { BreedsTable } from '../components/BreedsTable';

/**
 * BreedsView Component
 * Management of animal breeds.
 * Standardized using ViewLayout.
 */
function BreedsView() {
	return (
		<ViewLayout
			title="Gestión de Razas"
			subtitle="Administra las razas de animales disponibles en el sistema."
		>
			<Box component="main">
				<Paper
					elevation={0}
					sx={{
						borderRadius: '8px',
						border: '1px solid #d8dde6',
						overflow: 'hidden',
						bgcolor: '#ffffff',
					}}
				>
					<BreedsTable />
				</Paper>
			</Box>
		</ViewLayout>
	);
}

export default BreedsView;
