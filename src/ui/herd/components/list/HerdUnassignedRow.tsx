import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Box, Button, ButtonBase, Collapse, Paper, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { CaravanSummary } from '@/core/caravans/domain/entities/CaravanSummary';
import { useCaravansSummary } from '@/features/caravans/hooks/useCaravansSummary';
import HerdBatchRecentCaravans from './HerdBatchRecentCaravans';
import { herdBatchPath, UNASSIGNED_ANCHOR, UNASSIGNED_BATCH } from '../../utils/herdFormat';
import { scrollToBatchElement } from '../../utils/herdScroll';

interface HerdUnassignedRowProps {
	selectedCaravanId?: number | null;
	onViewCaravan: (caravan: CaravanSummary) => void;
}

/**
 * Caravans in no batch: same row pattern as a batch, in the warning tone. Target of the
 * "Sin lote asignado" KPI.
 */
export function HerdUnassignedRow({ selectedCaravanId, onViewCaravan }: HerdUnassignedRowProps) {
	const navigate = useNavigate();
	const [expanded, setExpanded] = useState(false);
	const rowRef = useRef<HTMLDivElement>(null);
	const { data } = useCaravansSummary({ batchId: UNASSIGNED_BATCH, perPage: 1 });
	const total = data?.meta.total ?? 0;

	if (total === 0) {
		return null;
	}

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
			id={UNASSIGNED_ANCHOR}
			elevation={0}
			sx={{
				scrollMarginTop: { xs: '68px', sm: '78px' },
				borderRadius: expanded ? '0 10px 10px 0' : '10px',
				overflow: 'hidden',
				bgcolor: (theme) => alpha(theme.palette.warning.main, 0.08),
				borderLeft: '4px solid',
				borderLeftColor: (theme) => (expanded ? theme.palette.warning.main : 'transparent'),
				boxShadow: (theme) =>
					theme.palette.mode === 'dark'
						? '0 1px 3px rgba(0,0,0,0.35)'
						: '0 1px 3px rgba(0,0,0,0.06)',
				transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
			}}
		>
			<Stack
				direction="row"
				alignItems="center"
				spacing={1}
				useFlexGap
				sx={{ flexWrap: { xs: 'wrap', md: 'nowrap' }, pr: 1.5 }}
			>
				<ButtonBase
					onClick={handleToggle}
					aria-expanded={expanded}
					aria-label={`${expanded ? 'Contraer' : 'Expandir'} caravanas sin lote`}
					sx={{
						flex: 1,
						minWidth: 0,
						justifyContent: 'flex-start',
						textAlign: 'left',
						gap: 1.5,
						py: 1.5,
						pl: 1,
						borderRadius: '8px'
					}}
				>
					<Box
						sx={{
							width: 40,
							height: 40,
							flexShrink: 0,
							display: 'grid',
							placeItems: 'center',
							color: 'warning.dark'
						}}
					>
						<FuseSvgIcon
							size={18}
							sx={{ transition: 'transform 0.2s ease', transform: expanded ? 'rotate(90deg)' : 'none' }}
						>
							heroicons-outline:chevron-right
						</FuseSvgIcon>
					</Box>
					<Box sx={{ minWidth: 0 }}>
						<Typography
							sx={{ fontSize: '0.95rem', fontWeight: 700, color: 'text.primary', lineHeight: 1.3 }}
						>
							Sin lote asignado
						</Typography>
						<Typography sx={{ mt: 0.5, fontSize: '0.75rem', fontWeight: 600, color: 'warning.dark' }}>
							{`${total.toLocaleString('es-AR')} caravanas fuera de todo lote`}
						</Typography>
					</Box>
				</ButtonBase>

				<Button
					variant="outlined"
					size="small"
					color="warning"
					onClick={() => navigate(herdBatchPath(UNASSIGNED_BATCH))}
					sx={{
						height: 36,
						borderRadius: '8px',
						fontWeight: 600,
						textTransform: 'none',
						bgcolor: 'background.paper'
					}}
				>
					Ver caravanas
				</Button>
			</Stack>

			<Collapse
				in={expanded}
				timeout="auto"
				unmountOnExit
			>
				<Box sx={{ borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
					<HerdBatchRecentCaravans
						batchId={UNASSIGNED_BATCH}
						highlightId={selectedCaravanId}
						onView={onViewCaravan}
					/>
				</Box>
			</Collapse>
		</Paper>
	);
}

export default HerdUnassignedRow;
