import { useMemo } from 'react';
import { useSearchParams } from 'react-router';
import WorkTemplatesHubSubheader, { WorkTemplatesHubTabKey } from '../components/WorkTemplatesHubSubheader';
import WorkTemplateScanView from './WorkTemplateScanView';
import WorkTemplateGalleryView from './WorkTemplateGalleryView';

/**
 * WorkTemplatesHubView Component
 * Consolidated Hub for Zootechnical Work Templates & OCR Extraction:
 * - Tab 1: Escanear Planilla (AI)
 * - Tab 2: Galería de Planillas Zootécnicas
 */
export default function WorkTemplatesHubView() {
	const [searchParams, setSearchParams] = useSearchParams();

	const activeTab: WorkTemplatesHubTabKey = useMemo(() => {
		const rawTab = searchParams.get('tab');
		if (rawTab === 'gallery' || rawTab === 'scan') {
			return rawTab;
		}
		return 'scan';
	}, [searchParams]);

	const handleTabChange = (nextTab: WorkTemplatesHubTabKey) => {
		const next = new URLSearchParams(searchParams);
		if (nextTab === 'scan') {
			next.delete('tab');
		} else {
			next.set('tab', nextTab);
		}
		setSearchParams(next, { replace: true });
	};

	const subHeader = <WorkTemplatesHubSubheader activeTab={activeTab} onTabChange={handleTabChange} />;

	if (activeTab === 'gallery') {
		return <WorkTemplateGalleryView subHeader={subHeader} />;
	}

	return <WorkTemplateScanView subHeader={subHeader} />;
}
