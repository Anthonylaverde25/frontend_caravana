import { Container, Box } from '@mui/material';
import ViewHeader from 'src/components/ViewHeader';
import UploadSection from 'src/components/caravan/UploadSection';

/**
 * UploadView Component
 * Semantically correct header for file uploads and analysis.
 */
function UploadView() {
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
				title="Analizador Documental AI"
				subtitle="Importa tus planillas de campo para procesamiento automático con Azure y Google AI."
			/>

			<Box sx={{ mt: 2 }}>
				<UploadSection />
			</Box>
		</Container>
	);
}

export default UploadView;
