import { Box } from '@mui/material';
import ViewLayout from 'src/components/ViewLayout';
import UploadSection from 'src/components/caravan/UploadSection';

/**
 * UploadView Component
 * Semantically correct header for file uploads and analysis.
 * Standardized using ViewLayout.
 */
function UploadView() {
	return (
		<ViewLayout
			title="Analizador Documental AI"
			subtitle="Importa tus planillas de campo para procesamiento automático con Azure y Google AI."
		>
			<Box>
				<UploadSection />
			</Box>
		</ViewLayout>
	);
}

export default UploadView;
