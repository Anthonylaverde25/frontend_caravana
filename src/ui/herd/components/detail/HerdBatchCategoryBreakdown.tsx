import { Box, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import type { BatchCategoryCount } from '@/core/batches/domain/entities/BatchOverview';

interface HerdBatchCategoryBreakdownProps {
	categories: BatchCategoryCount[];
}

/** How the caravans of the batch split by category, largest first. */
export function HerdBatchCategoryBreakdown({ categories }: HerdBatchCategoryBreakdownProps) {
	const total = categories.reduce((sum, c) => sum + c.count, 0);

	return (
		<Paper
			elevation={0}
			sx={{ p: 2, borderRadius: '8px', border: 1, borderColor: 'divider', height: '100%' }}
		>
			<Typography
				variant="subtitle2"
				sx={{ fontWeight: 800, mb: 1.5 }}
			>
				Composición por categoría
			</Typography>
			{total === 0 ? (
				<Typography
					variant="body2"
					color="text.secondary"
				>
					Sin caravanas en el lote.
				</Typography>
			) : (
				<Stack spacing={1.25}>
					{categories.map((category) => (
						<Box key={category.category_id ?? 'none'}>
							<Stack
								direction="row"
								justifyContent="space-between"
							>
								<Typography
									variant="caption"
									sx={{ fontWeight: 700 }}
								>
									{category.name ?? 'Sin categoría'}
								</Typography>
								<Typography
									variant="caption"
									color="text.secondary"
								>
									{`${category.count} · ${Math.round((category.count / total) * 100)}%`}
								</Typography>
							</Stack>
							<LinearProgress
								variant="determinate"
								value={(category.count / total) * 100}
								sx={{ height: 6, borderRadius: 3, mt: 0.5 }}
							/>
						</Box>
					))}
				</Stack>
			)}
		</Paper>
	);
}

export default HerdBatchCategoryBreakdown;
