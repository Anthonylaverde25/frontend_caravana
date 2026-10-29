import { useMemo } from 'react';
import { useSearchParams } from 'react-router';
import HealthHubSubheader, { HealthHubTabKey } from '../components/HealthHubSubheader';
import { PreServiceView } from '@/ui/gestation/views/PreServiceView';
import { DiagnosticProtocolsView } from '@/ui/gestation/views/DiagnosticProtocolsView';
import { PortalDirectoryView } from '@/ui/gestation/views/veterinary-portal/PortalDirectoryView';

/**
 * HealthHubView Component
 * Consolidated Hub for Sanidad & Control Veterinario.
 * Hosts "Pre-Servicio & Toros", "Protocolos Diagnósticos", and "Portales Veterinarios"
 * under canonical subHeader tabs, synchronizing state with the URL (?tab=...).
 */
export default function HealthHubView() {
	const [searchParams, setSearchParams] = useSearchParams();

	const activeTab: HealthHubTabKey = useMemo(() => {
		const rawTab = searchParams.get('tab');
		if (rawTab === 'protocols' || rawTab === 'portal' || rawTab === 'pre-service') {
			return rawTab;
		}
		return 'pre-service';
	}, [searchParams]);

	const handleTabChange = (nextTab: HealthHubTabKey) => {
		const next = new URLSearchParams(searchParams);
		if (nextTab === 'pre-service') {
			next.delete('tab');
		} else {
			next.set('tab', nextTab);
		}
		setSearchParams(next, { replace: true });
	};

	const subHeader = <HealthHubSubheader activeTab={activeTab} onTabChange={handleTabChange} />;

	if (activeTab === 'protocols') {
		return <DiagnosticProtocolsView subHeader={subHeader} />;
	}

	if (activeTab === 'portal') {
		return <PortalDirectoryView subHeader={subHeader} />;
	}

	return <PreServiceView subHeader={subHeader} />;
}
