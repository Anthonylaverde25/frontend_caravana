import React from 'react';
import { TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';
import SheetGrid from '@/components/sheet-grid/SheetGrid';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';
import { formatKg, formatMoney } from '../exitOrderFormat';
import type { CategoryBalance } from './exitPricing';

interface ExitCategoryPricesProps {
	balance: CategoryBalance[];
	prices: Record<string, string>;
	onChange: (category: string, value: string) => void;
}

/**
 * "Por kg según categoría": the load by category, its head and kg, and the $/kg each one was sold
 * (or agreed) at. A steer and a cull cow are not paid the same.
 */
export const ExitCategoryPrices: React.FC<ExitCategoryPricesProps> = ({ balance, prices, onChange }) => {
	const { headSx, cellSx, inputSx, textCellSx } = useGridCellStyles();
	const number = { ...textCellSx, textAlign: 'right', whiteSpace: 'nowrap' } as const;

	return (
		<SheetGrid minWidth={560}>
			<TableHead>
				<TableRow>
					<TableCell sx={headSx}>Categoría</TableCell>
					<TableCell sx={{ ...headSx, width: 80, textAlign: 'right' }}>Cabezas</TableCell>
					<TableCell sx={{ ...headSx, width: 130, textAlign: 'right' }}>Kg</TableCell>
					<TableCell sx={{ ...headSx, width: 130 }}>$/kg</TableCell>
					<TableCell sx={{ ...headSx, width: 160, textAlign: 'right', borderRight: 0 }}>Importe</TableCell>
				</TableRow>
			</TableHead>
			<TableBody>
				{balance.map((group) => (
					<TableRow key={group.category}>
						<TableCell sx={{ ...textCellSx, fontWeight: 700 }}>{group.category}</TableCell>
						<TableCell sx={number}>{group.heads}</TableCell>
						<TableCell
							sx={{
								...number,
								fontStyle: group.estimated ? 'italic' : undefined,
								color: group.estimated ? 'text.secondary' : undefined
							}}
						>
							{group.weightKg > 0 ? `${group.estimated ? '≈ ' : ''}${formatKg(group.weightKg)}` : '—'}
						</TableCell>
						<TableCell sx={cellSx}>
							<TextField
								fullWidth
								variant="outlined"
								inputMode="decimal"
								placeholder="$/kg"
								value={prices[group.category] ?? ''}
								onChange={(e) => onChange(group.category, e.target.value)}
								inputProps={{ 'aria-label': `Precio por kg de ${group.category}` }}
								sx={{ ...inputSx, '& input': { textAlign: 'right', padding: '8px 10px' } }}
							/>
						</TableCell>
						<TableCell sx={{ ...number, fontWeight: 700, borderRight: 0 }}>
							{group.amount > 0 ? formatMoney(group.amount) : '—'}
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</SheetGrid>
	);
};

export default ExitCategoryPrices;
