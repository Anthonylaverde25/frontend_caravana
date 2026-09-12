import React, { useState, useMemo } from 'react';
import { Box, Paper, Stack, Typography, Collapse, CircularProgress, useTheme, alpha, Divider } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useDiagnosticProtocols } from '@/features/gestation/hooks/useVeterinaryProtocols';
import {
	PendingProtocolItem,
	PendingLabMetrics,
	calculateDaysElapsed,
	getUrgencyLevel,
	resolveDestinationLabel
} from './types';
import { PendingLabProtocolsHeader } from './PendingLabProtocolsHeader';
import { PendingLabProtocolsMetrics } from './PendingLabProtocolsMetrics';
import { PendingLabProtocolRow } from './PendingLabProtocolRow';

interface PendingLabProtocolsWidgetProps {
	hideIfEmpty?: boolean;
}

export const PendingLabProtocolsWidget: React.FC<PendingLabProtocolsWidgetProps> = ({ hideIfEmpty = false }) => {
	const theme = useTheme();
	const isDark = theme.palette.mode === 'dark';

	const { data: protocols = [], isLoading } = useDiagnosticProtocols();

	const [isExpanded, setIsExpanded] = useState<boolean>(true);
	const [filterType, setFilterType] = useState<'ALL' | 'IN_SITU' | 'DERIVED' | 'OVERDUE'>('ALL');

	// Filter and map pending protocols
	const pendingItems = useMemo<PendingProtocolItem[]>(() => {
		return protocols
			.filter((p) => {
				if (p.status === 'VOIDED') return false;

				// Extraction acts pending lab report or samples
				if (p.protocol_type === 'EXTRACTION_ACT') {
					return (p.pending_samples_count ?? 0) > 0 || p.result_date === null;
				}

				// Digitized or other protocols with pending sample results
				return (p.pending_samples_count ?? 0) > 0;
			})
			.map((protocol) => {
				const daysWaiting = calculateDaysElapsed(protocol.sample_date);
				const urgency = getUrgencyLevel(daysWaiting);
				const { isDerived, label: destinationLabel } = resolveDestinationLabel(protocol);
				const veterinarianDisplay =
					protocol.signed_veterinarian_name ||
					protocol.veterinarian_name ||
					(protocol.signed_license_number
						? `MP ${protocol.signed_license_number}`
						: 'Sin profesional asignado');

				const pendingSamples = protocol.pending_samples_count ?? protocol.samples_count ?? 0;
				const totalSamples = protocol.samples_count ?? 0;

				return {
					protocol,
					daysWaiting,
					urgency,
					pendingSamples,
					totalSamples,
					isDerived,
					destinationLabel,
					veterinarianDisplay
				};
			})
			.sort((a, b) => b.daysWaiting - a.daysWaiting); // Most delayed first
	}, [protocols]);

	// Compute aggregated metrics
	const metrics = useMemo<PendingLabMetrics>(() => {
		let inSituCount = 0;
		let derivedCount = 0;
		let recentCount = 0;
		let attentionCount = 0;
		let overdueCount = 0;
		let totalPendingSamples = 0;

		pendingItems.forEach((item) => {
			totalPendingSamples += item.pendingSamples;

			if (item.isDerived) {
				derivedCount++;
			} else {
				inSituCount++;
			}

			if (item.urgency === 'OVERDUE') overdueCount++;
			else if (item.urgency === 'ATTENTION') attentionCount++;
			else recentCount++;
		});

		return {
			totalProtocols: pendingItems.length,
			totalPendingSamples,
			inSituCount,
			derivedCount,
			recentCount,
			attentionCount,
			overdueCount
		};
	}, [pendingItems]);

	// Filtered items based on active metric tab
	const displayedItems = useMemo(() => {
		if (filterType === 'IN_SITU') return pendingItems.filter((i) => !i.isDerived);

		if (filterType === 'DERIVED') return pendingItems.filter((i) => i.isDerived);

		if (filterType === 'OVERDUE') return pendingItems.filter((i) => i.urgency === 'OVERDUE');

		return pendingItems;
	}, [pendingItems, filterType]);

	if (isLoading) {
		return (
			<Paper
				elevation={0}
				sx={{
					p: 3,
					textAlign: 'center',
					borderRadius: '8px',
					border: '1px solid',
					borderColor: theme.palette.divider,
					bgcolor: 'background.paper'
				}}
			>
				<Stack
					direction="row"
					spacing={1.5}
					alignItems="center"
					justifyContent="center"
				>
					<CircularProgress size={20} />
					<Typography
						variant="body2"
						sx={{ color: 'text.secondary', fontWeight: 600 }}
					>
						Verificando protocolos de laboratorio en curso...
					</Typography>
				</Stack>
			</Paper>
		);
	}

	if (pendingItems.length === 0) {
		if (hideIfEmpty) return null;

		return (
			<Paper
				elevation={0}
				sx={{
					px: 3,
					py: 2,
					borderRadius: '8px',
					border: '1px solid',
					borderColor: theme.palette.divider,
					bgcolor: isDark ? 'rgba(52, 211, 153, 0.05)' : '#f0fdf4',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between'
				}}
			>
				<Stack
					direction="row"
					spacing={1.5}
					alignItems="center"
				>
					<Box
						sx={{
							width: 36,
							height: 36,
							borderRadius: '8px',
							bgcolor: isDark ? 'rgba(52, 211, 153, 0.15)' : '#dcfce7',
							color: isDark ? '#34d399' : '#15803d',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center'
						}}
					>
						<FuseSvgIcon size={20}>heroicons-outline:check-badge</FuseSvgIcon>
					</Box>
					<Box>
						<Typography
							variant="subtitle2"
							sx={{ fontWeight: 700, color: 'text.primary' }}
						>
							Sanidad al día: Sin protocolos de laboratorio pendientes
						</Typography>
						<Typography
							variant="caption"
							sx={{ color: 'text.secondary' }}
						>
							Todos los raspajes prepuciales y determinaciones diagnósticas cuentan con informe de
							laboratorio registrado.
						</Typography>
					</Box>
				</Stack>
			</Paper>
		);
	}

	const hasOverdue = metrics.overdueCount > 0;

	return (
		<Paper
			elevation={0}
			sx={{
				border: '1px solid',
				borderColor: hasOverdue ? alpha(theme.palette.error.main, 0.3) : alpha(theme.palette.primary.main, 0.3),
				borderRadius: '8px',
				overflow: 'hidden',
				bgcolor: 'background.paper',
				boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
			}}
		>
			{/* 1. Header with Badges and Actions */}
			<PendingLabProtocolsHeader
				metrics={metrics}
				isExpanded={isExpanded}
				onToggleExpand={() => setIsExpanded((prev) => !prev)}
			/>

			{/* 2. Analytical KPI Metric Facets */}
			<PendingLabProtocolsMetrics
				metrics={metrics}
				activeFilter={filterType}
				onSelectFilter={setFilterType}
			/>

			{/* 3. Expandable Protocols List Workbench */}
			<Collapse
				in={isExpanded}
				timeout="auto"
			>
				<Divider sx={{ borderColor: theme.palette.divider }} />

				<Box sx={{ p: 2 }}>
					{displayedItems.length === 0 ? (
						<Box sx={{ py: 3, textAlign: 'center' }}>
							<Typography
								variant="body2"
								sx={{ color: 'text.secondary' }}
							>
								No hay protocolos para el filtro seleccionado ({filterType}).
							</Typography>
						</Box>
					) : (
						<Stack spacing={1}>
							{displayedItems.map((item) => (
								<PendingLabProtocolRow
									key={item.protocol.id}
									item={item}
								/>
							))}
						</Stack>
					)}
				</Box>

				{/* 4. Domain Footer Guidance */}
				<Box
					sx={{
						px: 3,
						py: 1.5,
						borderTop: '1px solid',
						borderColor: theme.palette.divider,
						bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#fafafa'
					}}
				>
					<Typography
						variant="caption"
						sx={{ color: 'text.disabled', fontSize: '0.68rem', display: 'block' }}
					>
						💡 <strong>Criterio Técnico Veterinario:</strong> Los cultivos de raspado prepucial para
						Tricomoniasis y Campylobacteriosis requieren entre 5 y 7 días hábiles de incubación. Toda
						muestra sin informe emitido tras 14 días calendario debe ser intimada formalmente al centro de
						diagnóstico para preservar la validez del pre-servicio.
					</Typography>
				</Box>
			</Collapse>
		</Paper>
	);
};

export default PendingLabProtocolsWidget;
