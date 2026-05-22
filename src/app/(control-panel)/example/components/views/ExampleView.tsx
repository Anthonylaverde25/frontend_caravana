'use client';

import { useTranslation } from 'react-i18next';
import { Container, Box, Typography, Paper, Stack } from '@mui/material';
import ViewHeader from 'src/components/ViewHeader';
import '../../i18n';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

/**
 * ExampleView Component
 * A simplified view serving as a placeholder or template for other views.
 */
function ExampleView() {
	const { t } = useTranslation('examplePage');

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
				title="Vista de Ejemplo"
				subtitle="Esta es una ruta de ejemplo configurada para demostrar el enrutamiento."
			/>

			<Stack spacing={4} sx={{ mt: 4 }}>
				<Box>
					<Paper 
                        elevation={0}
                        sx={{ 
                            p: 6, 
                            borderRadius: '16px', 
                            border: '1px solid #e0e0e0', 
                            textAlign: 'center',
                            bgcolor: 'background.paper'
                        }}
                    >
                        <Stack spacing={2} alignItems="center" justifyContent="center">
                            <Box sx={{ p: 2, bgcolor: '#f5f5f5', color: 'text.secondary', borderRadius: '50%', display: 'flex' }}>
                                <FuseSvgIcon size={48}>lucide:star</FuseSvgIcon>
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 800 }}>
                                Página de Demostración
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 600 }}>
                                Puedes utilizar esta página como plantilla para crear nuevos módulos y componentes dentro del panel de control de la aplicación.
                            </Typography>
                        </Stack>
					</Paper>
				</Box>
			</Stack>
		</Container>
	);
}

export default ExampleView;
