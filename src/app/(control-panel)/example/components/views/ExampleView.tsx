'use client';

import DemoContent from '@fuse/core/DemoContent';
import { useTranslation } from 'react-i18next';
import { Container, Box, Typography } from '@mui/material';
import ViewHeader from 'src/components/ViewHeader';
import '../../i18n';

import { BatchWeightChart } from 'src/ui/batches/components/BatchWeightChart';

/**
 * ExampleView Component
 * Semantically correct header and container.
 */
function ExampleView() {
	const { t } = useTranslation('examplePage');

	const mockHistory = [
		{ id: 1, weight: 150.5, weighing_date: '2024-01-10', type: 'INITIAL' },
		{ id: 2, weight: 185.2, weighing_date: '2024-02-15', type: 'CONTROL' },
		{ id: 3, weight: 220.8, weighing_date: '2024-03-20', type: 'TRANSFER' },
		{ id: 4, weight: 275.4, weighing_date: '2024-04-25', type: 'CONTROL' },
		{ id: 5, weight: 340.0, weighing_date: '2024-05-30', type: 'TRANSFER' },
	];

	return (
		<Container
			maxWidth="xl"
			sx={{
				py: 4,
				display: 'flex',
				flexDirection: 'column',
				width: '100%',
				px: { xs: 2, md: 6 }
			}}
		>
			<ViewHeader
				title={t('TITLE')}
				subtitle="Demostración del componente de Gráfico de Evolución de Peso (Jhoangel AI Design)."
			/>

			<Box sx={{ mt: 4 }}>
				<Box sx={{ p: 4, bgcolor: 'background.paper', borderRadius: '16px', border: '1px solid #e0e0e0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
					<Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: 'primary.main' }}>
						Curva de Crecimiento del Lote (Ejemplo)
					</Typography>
					<BatchWeightChart data={mockHistory} />
				</Box>
			</Box>
		</Container>
	);
}

export default ExampleView;
