import { useMemo } from 'react';
import { useSearchParams } from 'react-router';
import HerdHubSubheader, { HerdHubTabKey } from '../components/HerdHubSubheader';
import HerdView from './HerdView';
import ActivitiesView from '@/ui/activities/views/ActivitiesView';
import CaravansMovements from '@/app/(control-panel)/livestock/records/CaravansMovements';
import { useBatches } from '@/features/batches/hooks/useBatches';

/**
 * HerdHubView Component
 * Consolidated Hub for Hacienda Propia, Production Sheets & Livestock Traceability:
 * - Tab 1: Lotes & Caravanas (Herd batches holding cattle, and quick intake)
 * - Tab 2: Lotes Vacíos (Own batches holding 0 head)
 * - Tab 3: Planilla de Producción (Zootechnical stages: Cría, Recría, Invernada)
 * - Tab 4: Historial de Movimientos (Chronological traceability audit ledger)
 */
export default function HerdHubView() {
	const [searchParams, setSearchParams] = useSearchParams();
	const { data: batches } = useBatches(undefined, undefined, 'own');

	const ownBatches = useMemo(
		() => (Array.isArray(batches) ? batches.filter((b) => b && b.provider_id == null) : []),
		[batches]
	);

	const stockedCount = useMemo(() => ownBatches.filter((b) => b.head_count > 0).length, [ownBatches]);
	const emptyCount = useMemo(() => ownBatches.filter((b) => b.head_count <= 0).length, [ownBatches]);

	const activeTab: HerdHubTabKey = useMemo(() => {
		const rawTab = searchParams.get('tab');
		if (
			rawTab === 'production' ||
			rawTab === 'movements' ||
			rawTab === 'empty-batches' ||
			rawTab === 'batches'
		) {
			return rawTab;
		}
		// Also support legacy ?tab=activities gracefully
		if (rawTab === 'activities') {
			return 'production';
		}
		return 'batches';
	}, [searchParams]);

	const handleTabChange = (nextTab: HerdHubTabKey) => {
		const next = new URLSearchParams(searchParams);
		if (nextTab === 'batches') {
			next.delete('tab');
		} else {
			next.set('tab', nextTab);
		}
		setSearchParams(next, { replace: true });
	};

	const subHeader = (
		<HerdHubSubheader
			activeTab={activeTab}
			onTabChange={handleTabChange}
			stockedCount={stockedCount}
			emptyCount={emptyCount}
		/>
	);

	if (activeTab === 'production') {
		return <ActivitiesView subHeader={subHeader} />;
	}

	if (activeTab === 'movements') {
		return <CaravansMovements subHeader={subHeader} hideBackButton />;
	}

	if (activeTab === 'empty-batches') {
		return <HerdView subHeader={subHeader} emptyBatchesOnly />;
	}

	return <HerdView subHeader={subHeader} stockedBatchesOnly />;
}
