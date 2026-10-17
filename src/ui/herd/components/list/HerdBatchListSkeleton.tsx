import { Box, Paper, Skeleton, Stack } from '@mui/material';
import HerdCaravanTableSkeleton from '../shared/HerdCaravanTableSkeleton';

/**
 * Skeleton wireframe for the Herd view KPI strip.
 * Mirrors the 5 KPI metric cards with exact grid constraints.
 */
function HerdKpiStripSkeleton() {
	return (
		<Paper
			elevation={0}
			sx={{
				display: 'grid',
				gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
				border: 1,
				borderColor: 'divider',
				borderRadius: '10px',
				overflow: 'hidden',
				'& > *:not(:last-child)': { borderRight: 1, borderColor: 'divider' }
			}}
		>
			{Array.from({ length: 5 }).map((_, index) => (
				<Box
					key={index}
					sx={{ px: 2.5, py: 2, display: 'flex', flexDirection: 'column', gap: 0.75, minWidth: 0 }}
				>
					<Skeleton
						variant="text"
						width={70 + (index % 3) * 15}
						height={16}
					/>
					<Skeleton
						variant="text"
						width={90 + (index % 2) * 20}
						height={38}
						sx={{ borderRadius: '4px' }}
					/>
					<Skeleton
						variant="text"
						width={110 + (index % 3) * 15}
						height={16}
					/>
				</Box>
			))}
		</Paper>
	);
}

/**
 * Skeleton wireframe for the batch filters bar.
 */
function BatchFiltersBarSkeleton() {
	return (
		<Box
			sx={{
				p: 2.5,
				borderBottom: 1,
				borderColor: 'divider',
				bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'background.default' : '#f8fafc')
			}}
		>
			{/* Search input placeholder */}
			<Box sx={{ mb: 2 }}>
				<Skeleton
					variant="rounded"
					height={40}
					sx={{ borderRadius: '6px' }}
				/>
			</Box>
			{/* Filters and chips placeholder */}
			<Stack
				direction={{ xs: 'column', md: 'row' }}
				spacing={1.5}
				alignItems={{ xs: 'stretch', md: 'center' }}
			>
				<Stack
					direction="row"
					spacing={1}
					sx={{ flexWrap: 'wrap', gap: 1 }}
				>
					<Skeleton
						variant="rounded"
						width={140}
						height={32}
						sx={{ borderRadius: '6px' }}
					/>
					<Skeleton
						variant="rounded"
						width={140}
						height={32}
						sx={{ borderRadius: '6px' }}
					/>
					<Skeleton
						variant="rounded"
						width={150}
						height={32}
						sx={{ borderRadius: '6px' }}
					/>
				</Stack>
				<Box sx={{ flex: 1 }} />
				<Stack
					direction="row"
					spacing={1}
				>
					<Skeleton
						variant="rounded"
						width={100}
						height={28}
						sx={{ borderRadius: '14px' }}
					/>
					<Skeleton
						variant="rounded"
						width={90}
						height={28}
						sx={{ borderRadius: '14px' }}
					/>
					<Skeleton
						variant="rounded"
						width={90}
						height={28}
						sx={{ borderRadius: '14px' }}
					/>
				</Stack>
			</Stack>
		</Box>
	);
}

/**
 * Skeleton wireframe for an expanded batch row, showing the aside summary
 * and the caravan datatable skeleton simultaneously.
 */
function HerdBatchExpandedRowSkeleton() {
	return (
		<Paper
			elevation={0}
			sx={{
				borderRadius: '0 10px 10px 0',
				overflow: 'hidden',
				bgcolor: 'background.paper',
				borderLeft: '4px solid',
				borderLeftColor: (theme) => theme.palette.primary.main,
				boxShadow: (theme) =>
					theme.palette.mode === 'dark'
						? '0 1px 3px rgba(0,0,0,0.35)'
						: '0 1px 3px rgba(0,0,0,0.06)'
			}}
		>
			{/* Header */}
			<Stack
				direction="row"
				alignItems="center"
				spacing={1}
				sx={{ p: 1.5, borderBottom: 1, borderColor: 'divider' }}
			>
				<Skeleton
					variant="rounded"
					width={40}
					height={40}
					sx={{ borderRadius: '8px', flexShrink: 0 }}
				/>
				<Box sx={{ flex: 1, minWidth: 0 }}>
					<Skeleton
						variant="text"
						width={180}
						height={24}
						sx={{ borderRadius: '4px' }}
					/>
					<Stack
						direction="row"
						spacing={1}
						alignItems="center"
						sx={{ mt: 0.5 }}
					>
						<Skeleton
							variant="text"
							width={60}
							height={16}
						/>
						<Skeleton
							variant="rounded"
							width={70}
							height={18}
							sx={{ borderRadius: '4px' }}
						/>
						<Skeleton
							variant="text"
							width={75}
							height={16}
						/>
					</Stack>
				</Box>
				<Stack
					direction="row"
					spacing={1}
					sx={{ display: { xs: 'none', sm: 'flex' } }}
				>
					<Skeleton
						variant="rounded"
						width={85}
						height={32}
						sx={{ borderRadius: '6px' }}
					/>
					<Skeleton
						variant="rounded"
						width={85}
						height={32}
						sx={{ borderRadius: '6px' }}
					/>
				</Stack>
			</Stack>

			{/* Expanded Panel: Overview Aside + Caravan Table */}
			<Box
				sx={{
					display: 'grid',
					gridTemplateColumns: { xs: '1fr', md: '260px minmax(0, 1fr)' },
					overflow: 'hidden'
				}}
			>
				{/* Aside Overview */}
				<Stack
					spacing={2}
					sx={(theme) => ({
						p: 2.5,
						bgcolor: 'background.default',
						borderBottom: `1px solid ${theme.palette.divider}`,
						[theme.breakpoints.up('md')]: {
							borderBottom: 'none',
							borderRight: `1px solid ${theme.palette.divider}`
						}
					})}
				>
					<Stack spacing={1}>
						<Skeleton
							variant="text"
							width={80}
							height={16}
						/>
						<Skeleton
							variant="rounded"
							height={8}
							sx={{ borderRadius: '4px' }}
						/>
						<Stack
							direction="row"
							justifyContent="space-between"
						>
							<Skeleton
								variant="text"
								width={70}
								height={14}
							/>
							<Skeleton
								variant="text"
								width={60}
								height={14}
							/>
						</Stack>
					</Stack>

					<Box
						sx={{
							pt: 1.75,
							display: 'grid',
							gridTemplateColumns: '1fr auto',
							rowGap: 1.5,
							columnGap: 2,
							borderTop: 1,
							borderColor: 'divider'
						}}
					>
						<Skeleton
							variant="text"
							width={60}
							height={16}
						/>
						<Skeleton
							variant="text"
							width={50}
							height={16}
						/>
						<Skeleton
							variant="text"
							width={90}
							height={16}
						/>
						<Skeleton
							variant="text"
							width={65}
							height={16}
						/>
						<Skeleton
							variant="text"
							width={85}
							height={16}
						/>
						<Skeleton
							variant="text"
							width={75}
							height={16}
						/>
						<Skeleton
							variant="text"
							width={80}
							height={16}
						/>
						<Skeleton
							variant="text"
							width={70}
							height={16}
						/>
					</Box>
				</Stack>

				{/* Table Skeleton */}
				<Box sx={{ minWidth: 0 }}>
					<HerdCaravanTableSkeleton rowCount={5} />
					<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pl: 2, pr: 1, py: 1 }}>
						<Skeleton
							variant="text"
							width={160}
							height={18}
						/>
						<Skeleton
							variant="rounded"
							width={130}
							height={26}
							sx={{ borderRadius: '4px' }}
						/>
					</Box>
				</Box>
			</Box>
		</Paper>
	);
}

/**
 * Skeleton wireframe for collapsed batch rows.
 */
function HerdBatchCollapsedRowSkeleton({ nameWidth = 150 }: { nameWidth?: number }) {
	return (
		<Paper
			elevation={0}
			sx={{
				p: 1.5,
				borderRadius: '10px',
				bgcolor: 'background.paper',
				borderLeft: '4px solid transparent',
				boxShadow: (theme) =>
					theme.palette.mode === 'dark'
						? '0 1px 3px rgba(0,0,0,0.35)'
						: '0 1px 3px rgba(0,0,0,0.06)'
			}}
		>
			<Stack
				direction="row"
				alignItems="center"
				spacing={1}
			>
				<Skeleton
					variant="rounded"
					width={40}
					height={40}
					sx={{ borderRadius: '8px', flexShrink: 0 }}
				/>
				<Box sx={{ flex: 1, minWidth: 0 }}>
					<Skeleton
						variant="text"
						width={nameWidth}
						height={24}
						sx={{ borderRadius: '4px' }}
					/>
					<Stack
						direction="row"
						spacing={1}
						alignItems="center"
						sx={{ mt: 0.5 }}
					>
						<Skeleton
							variant="text"
							width={50}
							height={16}
						/>
						<Skeleton
							variant="rounded"
							width={65}
							height={18}
							sx={{ borderRadius: '4px' }}
						/>
						<Skeleton
							variant="text"
							width={70}
							height={16}
						/>
					</Stack>
				</Box>
				<Stack
					direction="row"
					spacing={1}
					sx={{ display: { xs: 'none', sm: 'flex' } }}
				>
					<Skeleton
						variant="rounded"
						width={85}
						height={32}
						sx={{ borderRadius: '6px' }}
					/>
					<Skeleton
						variant="rounded"
						width={85}
						height={32}
						sx={{ borderRadius: '6px' }}
					/>
				</Stack>
			</Stack>
		</Paper>
	);
}

/**
 * Master skeleton loader for the entire Herd view (Hacienda Propia).
 * Replaces full page blank state / CircularProgress with high fidelity wireframe.
 */
export function HerdBatchListSkeleton() {
	return (
		<Box sx={{ width: '100%' }}>
			{/* KPI Strip */}
			<Box sx={{ p: { xs: 2, md: 3 }, pb: { xs: 0, md: 0 } }}>
				<HerdKpiStripSkeleton />
			</Box>

			{/* Filters Bar */}
			<BatchFiltersBarSkeleton />

			{/* Batch Rows */}
			<Box sx={{ p: { xs: 2, md: 3 }, bgcolor: 'background.default' }}>
				<Stack spacing={1.5}>
					<Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
						<Skeleton
							variant="text"
							width={130}
							height={16}
						/>
					</Box>
					<HerdBatchExpandedRowSkeleton />
					<HerdBatchCollapsedRowSkeleton nameWidth={170} />
					<HerdBatchCollapsedRowSkeleton nameWidth={140} />
				</Stack>
			</Box>
		</Box>
	);
}

export default HerdBatchListSkeleton;
