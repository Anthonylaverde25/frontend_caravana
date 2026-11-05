import { useMemo } from 'react';
import { useDteMetrics } from '../widgets/dte/useDteMetrics';
import { useDiagnosticProtocols } from '@/features/gestation/hooks/useVeterinaryProtocols';
import { useOperationalKpis } from './useOperationalKpis';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import { useCompany } from '@/contexts/CompanyContext';

export interface CriticalAlertItem {
	id: string;
	severity: 'warning' | 'info' | 'error';
	title: string;
	description: string;
	countText: string;
	icon: string;
	actionUrl: string;
	actionLabel: string;
}

export function useCriticalAlerts() {
	const { activeCompanyId } = useCompany();
	const { inTransit, isLoading: isDteLoading } = useDteMetrics();
	const { data: protocols = [], isLoading: isProtocolsLoading } = useDiagnosticProtocols();
	const { summary, isLoading: isOpsLoading } = useOperationalKpis();
	const { data: caravans = [], isLoading: isCaravansLoading } = useCaravans(activeCompanyId, 'all');

	const alerts = useMemo<CriticalAlertItem[]>(() => {
		const list: CriticalAlertItem[] = [];

		// 1. Tropas en Tránsito (DTe en viaje)
		if (inTransit.dtes > 0) {
			list.push({
				id: 'dte_in_transit',
				severity: 'info',
				title: 'Hacienda en Tránsito (DTe)',
				description: `${inTransit.heads} cabezas en viaje pendientes de recepción y control en manga.`,
				countText: `${inTransit.dtes} ${inTransit.dtes === 1 ? 'guía' : 'guías'}`,
				icon: 'heroicons-outline:truck',
				actionUrl: '/entry-orders',
				actionLabel: 'Ver ingresos'
			});
		}

		// 2. Protocolos de laboratorio demorados (> 10 días sin resultado)
		const overdueProtocols = protocols.filter((p) => {
			if (p.status === 'VOIDED' || !p.sample_date) return false;
			const sampleDate = new Date(p.sample_date);
			const today = new Date();
			const daysDiff = Math.floor((today.getTime() - sampleDate.getTime()) / (1000 * 60 * 60 * 24));
			return daysDiff >= 10 && (p.result_date === null || (p.pending_samples_count ?? 0) > 0);
		});

		if (overdueProtocols.length > 0) {
			list.push({
				id: 'lab_overdue',
				severity: 'warning',
				title: 'Muestras de Laboratorio Demoradas',
				description: `${overdueProtocols.length} ${overdueProtocols.length === 1 ? 'protocolo' : 'protocolos'} con más de 10 días de espera de informes.`,
				countText: `${overdueProtocols.length} pendientes`,
				icon: 'heroicons-outline:beaker',
				actionUrl: '/gestation/diagnostic-protocols',
				actionLabel: 'Ver laboratorio'
			});
		}

		// 3. Animales sin lote asignado
		const unassignedCount = caravans.filter((c) => c.batch_id == null).length;
		if (unassignedCount > 0 && caravans.length > 0) {
			list.push({
				id: 'unassigned_caravans',
				severity: 'warning',
				title: 'Hacienda sin Asignar a Lote',
				description: `${unassignedCount} cabezas activas no tienen potrero ni lote productivo asignado.`,
				countText: `${unassignedCount} cabezas`,
				icon: 'heroicons-outline:exclamation-triangle',
				actionUrl: '/herd',
				actionLabel: 'Asignar lotes'
			});
		}

		// 4. Órdenes operativas pendientes
		const totalPendingDocs = summary?.total_pending_documents ?? 0;
		if (totalPendingDocs > 0) {
			list.push({
				id: 'pending_work_orders',
				severity: 'info',
				title: 'Órdenes de Trabajo Pendientes',
				description: `${totalPendingDocs} tareas de manga y campo (ingresos, destetes, traslados) esperando registro.`,
				countText: `${totalPendingDocs} órdenes`,
				icon: 'heroicons-outline:clipboard-document-list',
				actionUrl: '/entry-orders',
				actionLabel: 'Ver órdenes'
			});
		}

		return list;
	}, [inTransit, protocols, summary, caravans]);

	const isLoading = isDteLoading || isProtocolsLoading || isOpsLoading || isCaravansLoading;

	return {
		alerts,
		hasAlerts: alerts.length > 0,
		isLoading
	};
}
