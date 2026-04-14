'use client';

import DemoContent from '@fuse/core/DemoContent';
import { useTranslation } from 'react-i18next';
import { Container, Box } from '@mui/material';
import ViewHeader from 'src/components/ViewHeader';
import '../../i18n';

/**
 * ExampleView Component
 * Semantically correct header and container.
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
				title={t('TITLE')}
				subtitle="Esta es una vista de ejemplo configurada con el estándar de cabecera minimalista y profesional del proyecto."
			/>

			<Box sx={{ mt: 2 }}>
				<DemoContent />
			</Box>
		</Container>
	);
}

export default ExampleView;
