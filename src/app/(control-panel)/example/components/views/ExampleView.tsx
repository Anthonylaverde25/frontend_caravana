'use client';

import { useTranslation } from 'react-i18next';
import { Container, Box, Typography, Grid, Paper, Stack } from '@mui/material';
import ViewHeader from 'src/components/ViewHeader';
import '../../i18n';

import { BatchWeightChart } from 'src/ui/batches/components/BatchWeightChart';
import { BatchesComparativeChart } from 'src/ui/batches/components/BatchesComparativeChart';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

/**
 * ExampleView Component
 * Dashboard for Batch Comparison and Evolution.
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
				title="Análisis Comparativo de Biomasa"
				subtitle="Monitoreo en tiempo real del peso promedio por lote y evolución de crecimiento."
			/>

			<Stack spacing={4} sx={{ mt: 4 }}>
				{/* Comparative Chart Section - Full Width */}
				<Box>
					<Paper 
                        elevation={0}
                        sx={{ 
                            p: 4, 
                            borderRadius: '16px', 
                            border: '1px solid #e0e0e0', 
                            boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                            bgcolor: 'background.paper'
                        }}
                    >
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
                            <Box sx={{ p: 1, bgcolor: '#e3f2fd', color: '#0a6ed1', borderRadius: '8px', display: 'flex' }}>
                                <FuseSvgIcon size={24}>heroicons-outline:adjustments-horizontal</FuseSvgIcon>
                            </Box>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 900, color: '#333' }}>
                                    Análisis Comparativo de Biomasa (Multi-Lote)
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                    Comparativa de crecimiento acumulado entre lotes activos
                                </Typography>
                            </Box>
                        </Stack>
						
						<BatchesComparativeChart />
					</Paper>
				</Box>

				{/* Individual Batch Detail Example - Full Width */}
				<Box>
					<Paper 
                        elevation={0}
                        sx={{ 
                            p: 4, 
                            borderRadius: '16px', 
                            border: '1px solid #e0e0e0', 
                            bgcolor: 'background.paper'
                        }}
                    >
						<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
                            <Box sx={{ p: 1, bgcolor: '#f1f8e9', color: '#2e7d32', borderRadius: '8px', display: 'flex' }}>
                                <FuseSvgIcon size={24}>heroicons-outline:presentation-chart-line</FuseSvgIcon>
                            </Box>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 900, color: '#333' }}>
                                    Evolución Individual: Lote de Ejemplo
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                    Historial de crecimiento detallado (Single Series)
                                </Typography>
                            </Box>
                        </Stack>
						<BatchWeightChart data={mockHistory} />
					</Paper>
				</Box>
			</Stack>
		</Container>
	);
}

export default ExampleView;
