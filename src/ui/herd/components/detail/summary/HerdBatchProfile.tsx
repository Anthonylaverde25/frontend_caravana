import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import type { Batch } from '@/core/batches/domain/entities/Batch';
import type { BatchOverview } from '@/core/batches/domain/entities/BatchOverview';
import { managementSystemLabel } from '@/ui/activities/components/production-sheet/managementSystem';
import HerdBatchComposition from './HerdBatchComposition';
import { formatDate } from '../../../utils/herdFormat';

interface HerdBatchProfileProps {
	batch: Batch;
	overview: BatchOverview | undefined;
	onChangeManagement: () => void;
	onTagCalves: () => void;
	onCastrate?: () => void;
}

const linkSx = { p: 0, minWidth: 0, fontSize: '0.8125rem', fontWeight: 500, textTransform: 'none' } as const;

/**
 * The side sheet of the batch: what it is (activity, type, management, notes) and who is in it.
 * A column of the page, not a card: a rule on its edge and a sheet running to both sides.
 */
export function HerdBatchProfile({
	batch,
	overview,
	onChangeManagement,
	onTagCalves,
	onCastrate
}: HerdBatchProfileProps) {
	const isConfined = batch.is_confined ?? null;

	return (
		<Box
			component="aside"
			aria-label="Ficha del lote"
			sx={{
				// Beside the content it stays at 340px; alone on a line it takes the whole width.
				flex: '1 1 340px',
				minWidth: 0,
				pb: 3,
				bgcolor: 'background.default',
				borderRight: { md: 1 },
				borderBottom: { xs: 1, md: 0 },
				borderColor: { xs: 'divider', md: 'divider' }
			}}
		>
			<Box
				component="dl"
				sx={{ m: 0, p: 3, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '14px 16px' }}
			>
				<Fact label="Actividad">{batch.activity_name ?? '—'}</Fact>
				<Fact label="Tipo de lote">{batch.batch_type_name ?? '—'}</Fact>
				<Fact label="Manejo">
					{isConfined != null && `${managementSystemLabel({ isConfined })} · `}
					<Button
						variant="text"
						size="small"
						onClick={onChangeManagement}
						sx={linkSx}
					>
						{isConfined == null ? 'Definir manejo' : 'Cambiar'}
					</Button>
				</Fact>
				<Fact label="Creado">{batch.created_at ? formatDate(batch.created_at) : '—'}</Fact>
				{batch.observaciones && (
					<Box sx={{ gridColumn: 'span 2', minWidth: 0 }}>
						<Label>Observaciones</Label>
						<Typography
							component="dd"
							sx={{ m: 0, mt: 0.25, fontSize: '0.8125rem', whiteSpace: 'pre-line' }}
						>
							{batch.observaciones}
						</Typography>
					</Box>
				)}
			</Box>

			<HerdBatchComposition
				batch={batch}
				overview={overview}
				onTagCalves={onTagCalves}
				onCastrate={onCastrate}
			/>
		</Box>
	);
}

function Label({ children }: { children: React.ReactNode }) {
	return (
		<Typography
			component="dt"
			sx={{ fontSize: '0.75rem', color: 'text.secondary' }}
		>
			{children}
		</Typography>
	);
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<Box sx={{ minWidth: 0 }}>
			<Label>{label}</Label>
			<Typography
				component="dd"
				sx={{ m: 0, mt: 0.25, fontSize: '0.8125rem', fontWeight: 500 }}
			>
				{children}
			</Typography>
		</Box>
	);
}

export default HerdBatchProfile;
