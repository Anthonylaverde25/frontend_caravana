import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Collapse, Paper, Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { CaravanSummary } from '@/core/caravans/domain/entities/CaravanSummary';
import HerdBatchServiceTab from '@/ui/herd/components/list/row/HerdBatchServiceTab';
import { SERVICE_COLOR } from '@/ui/herd/utils/herdFormat';
import { scrollToBatchElement } from '@/ui/herd/utils/herdScroll';
import { computeGestationBatchStats, type GestationBatchGroup } from './gestationListUtils';
import GestationBatchRowHeader from './row/GestationBatchRowHeader';
import GestationBatchRowActions from './row/GestationBatchRowActions';
import GestationBatchOverviewAside from './row/GestationBatchOverviewAside';
import GestationBatchCaravansTable from './row/GestationBatchCaravansTable';

interface GestationBatchRowProps {
	group: GestationBatchGroup;
	defaultExpanded?: boolean;
	selectedCaravanId?: number | null;
	onViewCaravan: (caravan: CaravanSummary) => void;
	onEditCaravan: (caravan: CaravanSummary) => void;
	onWeighCaravan: (caravan: CaravanSummary) => void;
	onOpenServiceOrder?: (serviceOrderId: number) => void;
}

/**
 * One gestational batch row: minimal header with calving metrics and batch actions,
 * expanding to its overview aside and gestating females table. Mirrors HerdBatchRow.
 */
export function GestationBatchRow({
	group,
	defaultExpanded = false,
	selectedCaravanId,
	onViewCaravan,
	onEditCaravan,
	onWeighCaravan,
	onOpenServiceOrder
}: GestationBatchRowProps) {
	const [expanded, setExpanded] = useState(defaultExpanded);
	const rowRef = useRef<HTMLDivElement>(null);
	const stats = useMemo(() => computeGestationBatchStats(group.caravans), [group.caravans]);
	const service = group.batch?.active_service_order ?? null;
	const openServiceOrder = service && onOpenServiceOrder ? () => onOpenServiceOrder(service.id) : undefined;

	useEffect(() => {
		setExpanded(defaultExpanded);
	}, [defaultExpanded]);

	const handleToggle = () => {
		setExpanded((prev) => {
			const nextState = !prev;
			if (nextState) {
				requestAnimationFrame(() => {
					scrollToBatchElement(rowRef.current);
				});
			}
			return nextState;
		});
	};

	return (
		<Paper
			ref={rowRef}
			elevation={0}
			sx={{
				position: 'relative',
				scrollMarginTop: { xs: '68px', sm: '78px' },
				borderRadius: expanded ? '0 10px 10px 0' : '10px',
				bgcolor: (theme) =>
					group.isUnassigned ? alpha(theme.palette.warning.main, 0.08) : 'background.paper',
				borderLeft: '4px solid',
				borderLeftColor: (theme) =>
					expanded
						? group.isUnassigned
							? theme.palette.warning.main
							: service
								? SERVICE_COLOR
								: theme.palette.primary.main
						: 'transparent',
				boxShadow: (theme) =>
					expanded
						? `0 4px 16px ${alpha(theme.palette.primary.main, 0.1)}`
						: theme.palette.mode === 'dark'
							? '0 1px 3px rgba(0,0,0,0.35)'
							: '0 1px 3px rgba(0,0,0,0.06)',
				transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
			}}
		>
			{service && (
				<HerdBatchServiceTab
					code={service.code}
					onOpen={openServiceOrder}
				/>
			)}

			<Stack
				direction="row"
				alignItems="center"
				spacing={1}
				useFlexGap
				sx={{
					flexWrap: { xs: 'wrap', md: 'nowrap' },
					borderRadius: expanded ? '0 9px 0 0' : '9px',
					bgcolor: (theme) =>
						expanded && !group.isUnassigned ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
					transition: 'background-color 0.2s ease'
				}}
			>
				<GestationBatchRowHeader
					group={group}
					stats={stats}
					expanded={expanded}
					onToggle={handleToggle}
				/>
				<GestationBatchRowActions
					group={group}
					onOpenServiceOrder={openServiceOrder}
				/>
			</Stack>

			<Collapse
				in={expanded}
				timeout="auto"
				unmountOnExit
			>
				<Box
					sx={{
						display: 'grid',
						gridTemplateColumns: { xs: '1fr', md: '260px minmax(0, 1fr)' },
						borderTop: 1,
						borderColor: 'divider',
						borderRadius: '0 0 9px 0',
						bgcolor: 'background.paper',
						overflow: 'hidden'
					}}
				>
					<GestationBatchOverviewAside stats={stats} />
					<Box sx={{ minWidth: 0 }}>
						<GestationBatchCaravansTable
							batchId={group.id}
							caravans={group.caravans}
							highlightId={selectedCaravanId}
							onViewCaravan={onViewCaravan}
							onEditCaravan={onEditCaravan}
							onWeighCaravan={onWeighCaravan}
						/>
					</Box>
				</Box>
			</Collapse>
		</Paper>
	);
}

export default GestationBatchRow;
