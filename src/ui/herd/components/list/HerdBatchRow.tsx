import { useEffect, useRef, useState } from 'react';
import { Collapse, Paper, Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { Batch } from '@/core/batches/domain/entities/Batch';
import type { CaravanSummary } from '@/core/caravans/domain/entities/CaravanSummary';
import HerdBatchRowHeader from './row/HerdBatchRowHeader';
import HerdBatchRowActions from './row/HerdBatchRowActions';
import HerdBatchServiceTab from './row/HerdBatchServiceTab';
import HerdBatchExpandedPanel from './row/HerdBatchExpandedPanel';
import { SERVICE_COLOR } from '../../utils/herdFormat';
import { scrollToBatchElement } from '../../utils/herdScroll';

interface HerdBatchRowProps {
	batch: Batch;
	defaultExpanded?: boolean;
	/** The caravan open in the detail drawer, marked in the table. */
	selectedCaravanId?: number | null;
	onViewCaravan: (caravan: CaravanSummary) => void;
	onAddCaravans: (batch: Batch) => void;
	onWeighBatch: (batch: Batch) => void;
	onStartService: (batch: Batch) => void;
	onOpenServiceOrder?: (serviceOrderId: number) => void;
}

/**
 * One own batch: a minimal header (name, then head | activity | kg/head) with its actions, that
 * expands to its overview and latest caravans.
 */
export function HerdBatchRow({
	batch,
	defaultExpanded = false,
	selectedCaravanId,
	onViewCaravan,
	onAddCaravans,
	onWeighBatch,
	onStartService,
	onOpenServiceOrder
}: HerdBatchRowProps) {
	const [expanded, setExpanded] = useState(defaultExpanded);
	const rowRef = useRef<HTMLDivElement>(null);
	const service = batch.active_service_order;
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
				bgcolor: 'background.paper',
				borderLeft: '4px solid',
				borderLeftColor: (theme) =>
					expanded
						? service
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
					bgcolor: (theme) => (expanded ? alpha(theme.palette.primary.main, 0.05) : 'transparent'),
					transition: 'background-color 0.2s ease'
				}}
			>
				<HerdBatchRowHeader
					batch={batch}
					expanded={expanded}
					onToggle={handleToggle}
				/>
				<HerdBatchRowActions
					batch={batch}
					onAddCaravans={() => onAddCaravans(batch)}
					onWeighBatch={() => onWeighBatch(batch)}
					onStartService={() => onStartService(batch)}
					onOpenServiceOrder={openServiceOrder}
				/>
			</Stack>

			<Collapse
				in={expanded}
				timeout="auto"
				unmountOnExit
			>
				<HerdBatchExpandedPanel
					batch={batch}
					selectedCaravanId={selectedCaravanId}
					onViewCaravan={onViewCaravan}
				/>
			</Collapse>
		</Paper>
	);
}

export default HerdBatchRow;
