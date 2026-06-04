import { Box } from '@mui/material';
import ViewLayout from 'src/components/ViewLayout';
import UploadSectionOcr from './components/UploadSectionOcr';

/**
 * UploadDocumentOcrView Component
 * Isolated copy of the Document Analyzer for specific modifications.
 * Standardized using ViewLayout.
 */
function UploadDocumentOcrView() {
	return (
		<ViewLayout
			title="Analizador Documental AI (OCR)"
			subtitle="Importa tus planillas de campo para procesamiento automático con Azure y Google AI de forma aislada."
		>
			<Box>
				<UploadSectionOcr />
			</Box>
		</ViewLayout>
	);
}

export default UploadDocumentOcrView;
