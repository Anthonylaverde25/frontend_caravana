import { useMemo } from 'react';
import { useSearchParams } from 'react-router';
import AdministrativeBatchesSubheader, { AdministrativeBatchesTabKey } from '../components/AdministrativeBatchesSubheader';
import InternalConsumptionView from './InternalConsumptionView';
import InternalDeathView from './InternalDeathView';
import InternalExitView from './InternalExitView';
import QuarantineView from './QuarantineView';
import ReserveBatchView from './ReserveBatchView';

/**
 * AdministrativeBatchesView Component
 * Consolidated Hub for all system/administrative internal batches:
 * - Tab 1: Consumo Interno (INTERNAL_CONSUMPTION)
 * - Tab 2: Muertes / Bajas (INTERNAL_DEATH)
 * - Tab 3: Egresos (INTERNAL_EXIT)
 * - Tab 4: Cuarentena (QUARANTINE)
 * - Tab 5: Lote Reserva (RESERVE)
 */
export default function AdministrativeBatchesView() {
	const [searchParams, setSearchParams] = useSearchParams();

	const activeTab: AdministrativeBatchesTabKey = useMemo(() => {
		const rawTab = searchParams.get('tab');
		if (
			rawTab === 'consumption' ||
			rawTab === 'death' ||
			rawTab === 'exit' ||
			rawTab === 'quarantine' ||
			rawTab === 'reserve'
		) {
			return rawTab;
		}
		return 'consumption';
	}, [searchParams]);

	const handleTabChange = (nextTab: AdministrativeBatchesTabKey) => {
		const next = new URLSearchParams(searchParams);
		if (nextTab === 'consumption') {
			next.delete('tab');
		} else {
			next.set('tab', nextTab);
		}
		setSearchParams(next, { replace: true });
	};

	const subHeader = <AdministrativeBatchesSubheader activeTab={activeTab} onTabChange={handleTabChange} />;

	if (activeTab === 'death') {
		return <InternalDeathView subHeader={subHeader} />;
	}

	if (activeTab === 'exit') {
		return <InternalExitView subHeader={subHeader} />;
	}

	if (activeTab === 'quarantine') {
		return <QuarantineView subHeader={subHeader} />;
	}

	if (activeTab === 'reserve') {
		return <ReserveBatchView subHeader={subHeader} />;
	}

	return <InternalConsumptionView subHeader={subHeader} />;
}
