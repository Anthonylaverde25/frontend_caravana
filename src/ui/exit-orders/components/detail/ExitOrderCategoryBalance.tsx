import React from 'react';
import { Box, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import SheetGrid from '@/components/sheet-grid/SheetGrid';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';
import type { ExitOrder } from '@/features/exit-orders/types';
import { formatKg, formatMoney } from '../exitOrderFormat';

interface Row {
	category: string;
	heads: number;
	exited: number;
	weightKg: number;
	estimated: boolean;
	amount: number;
	prices: Set<number | null>;
}

const balanceOf = (order: ExitOrder): Row[] => {
	const groups = new Map<string, Row>();

	order.animals
		.filter((line) => line.status !== 'SKIPPED')
		.forEach((line) => {
			const key = line.category?.name ?? 'Sin categoría';
			const row = groups.get(key) ?? {
				category: key,
				heads: 0,
				exited: 0,
				weightKg: 0,
				estimated: false,
				amount: 0,
				prices: new Set()
			};
			row.heads += 1;
			row.exited += line.status === 'EXITED' ? 1 : 0;
			// A pending animal counts with its last weighing and the $/kg agreed: a plan, marked "≈".
			const pending = line.status === 'PENDING';
			const kg = pending ? line.last_weight_kg : line.weight_kg;
			row.weightKg += kg ?? 0;
			row.estimated ||= line.weight_estimated || (pending && kg != null);
			row.amount += pending
				? kg != null && line.price_per_kg != null
					? kg * line.price_per_kg
					: 0
				: (line.amount ?? 0);
			row.prices.add(line.price_per_kg);
			groups.set(key, row);
		});

	return [...groups.values()];
};

/**
 * What the order moves by category: head, kg and value. A pending animal counts with its last
 * weighing and the $/kg agreed at issue (estimated, "≈"); one that left, with what it left with.
 */
export const ExitOrderCategoryBalance: React.FC<{ order: ExitOrder }> = ({ order }) => {
	const { headSx, textCellSx } = useGridCellStyles();
	const rows = balanceOf(order);
	const number = { ...textCellSx, textAlign: 'right', whiteSpace: 'nowrap' } as const;

	if (rows.length === 0) return null;

	return (
		<Box>
			<Typography
				variant="overline"
				sx={{ fontWeight: 800, color: 'text.secondary' }}
			>
				Balance por categoría
			</Typography>
			<SheetGrid minWidth={560}>
				<TableHead>
					<TableRow>
						<TableCell sx={headSx}>Categoría</TableCell>
						<TableCell sx={{ ...headSx, width: 110, textAlign: 'right' }}>Cabezas</TableCell>
						<TableCell sx={{ ...headSx, width: 120, textAlign: 'right' }}>Kg</TableCell>
						<TableCell sx={{ ...headSx, width: 100, textAlign: 'right' }}>$/kg</TableCell>
						<TableCell sx={{ ...headSx, width: 140, textAlign: 'right', borderRight: 0 }}>
							Importe
						</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{rows.map((row) => {
						const price = row.prices.size === 1 ? [...row.prices][0] : null;

						return (
							<TableRow key={row.category}>
								<TableCell sx={{ ...textCellSx, fontWeight: 700 }}>{row.category}</TableCell>
								<TableCell sx={number}>
									{row.exited === 0 || row.exited === row.heads
										? row.heads
										: `${row.exited} de ${row.heads} salieron`}
								</TableCell>
								<TableCell sx={number}>
									{row.weightKg > 0 ? `${row.estimated ? '≈ ' : ''}${formatKg(row.weightKg)}` : '—'}
								</TableCell>
								<TableCell sx={number}>
									{price != null ? formatMoney(price) : row.prices.size > 1 ? 'varios' : '—'}
								</TableCell>
								<TableCell sx={{ ...number, fontWeight: 700, borderRight: 0 }}>
									{row.amount > 0 ? `${row.estimated ? '≈ ' : ''}${formatMoney(row.amount)}` : '—'}
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</SheetGrid>
		</Box>
	);
};

export default ExitOrderCategoryBalance;
