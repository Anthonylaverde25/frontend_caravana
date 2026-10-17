import { useState } from 'react';
import { Box, CircularProgress, Collapse, Paper, Stack, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useBatchWeightHistory } from '@/features/batches/hooks/useBatchWeightHistory';
import { BatchWeightChart } from 'src/ui/batches/components/BatchWeightChart';

interface HerdBatchWeightSectionProps {
	batchId: number;
}

/** The weight curve of the batch, collapsed by default: its history is asked for only when opened. */
export function HerdBatchWeightSection({ batchId }: HerdBatchWeightSectionProps) {
	const [open, setOpen] = useState(false);

	return (
		<Paper
			elevation={0}
			sx={{ borderRadius: '8px', border: 1, borderColor: 'divider', overflow: 'hidden' }}
		>
			<Stack
				direction="row"
				spacing={1}
				alignItems="center"
				sx={{ p: 2, cursor: 'pointer' }}
				onClick={() => setOpen((prev) => !prev)}
			>
				<FuseSvgIcon
					size={20}
					sx={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}
				>
					heroicons-outline:chevron-right
				</FuseSvgIcon>
				<Typography
					variant="subtitle2"
					sx={{ fontWeight: 800 }}
				>
					Evolución de peso
				</Typography>
				<Typography
					variant="caption"
					color="text.secondary"
				>
					Pesajes y movimientos de animales
				</Typography>
			</Stack>
			<Collapse
				in={open}
				unmountOnExit
			>
				<Box sx={{ borderTop: 1, borderColor: 'divider', p: 2 }}>
					<HerdBatchWeightChart batchId={batchId} />
				</Box>
			</Collapse>
		</Paper>
	);
}

function HerdBatchWeightChart({ batchId }: HerdBatchWeightSectionProps) {
	const { data = [], isLoading } = useBatchWeightHistory(batchId);

	if (isLoading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
				<CircularProgress size={24} />
			</Box>
		);
	}

	return <BatchWeightChart data={data} />;
}

export default HerdBatchWeightSection;
