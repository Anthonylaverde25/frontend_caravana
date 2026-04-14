import { Container, Box } from '@mui/material';
import ViewHeader from 'src/components/ViewHeader';
import TemplateGenerator from 'src/components/caravan/TemplateGenerator';

/**
 * TemplateView Component
 * Semantically correct header for template generation.
 */
function TemplateView() {
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
				title="Generador de Planillas"
				subtitle="Configura y genera planillas en blanco profesionales listas para imprimir y llevar al campo."
			/>

			<Box sx={{ mt: 2 }}>
				<TemplateGenerator />
			</Box>
		</Container>
	);
}

export default TemplateView;
