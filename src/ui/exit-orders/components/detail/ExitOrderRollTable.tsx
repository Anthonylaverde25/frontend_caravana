import React, { useState } from 'react';
import {
	Box,
	Chip,
	IconButton,
	ListItemIcon,
	Menu,
	MenuItem,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	Typography
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import SheetGrid from '@/components/sheet-grid/SheetGrid';
import SheetGridStatusCell from '@/components/sheet-grid/SheetGridStatusCell';
import SheetGridTagCell from '@/components/sheet-grid/SheetGridTagCell';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';
import type { ExitLineStatus, ExitOrder, ExitOrderLine } from '@/features/exit-orders/types';
import { formatKg, formatMoney } from '../exitOrderFormat';

interface ExitOrderRollTableProps {
	order: ExitOrder;
	/** Offered on a pending line of an open order (01 §5.1). */
	onRegisterDeath?: (line: ExitOrderLine) => void;
}

const LINE_COLOR: Record<ExitLineStatus, 'default' | 'success' | 'warning'> = {
	PENDING: 'default',
	EXITED: 'success',
	SKIPPED: 'warning'
};

/** The roll as it left: batch and activity of that day, kg, price and amount, and each line's state. */
export const ExitOrderRollTable: React.FC<ExitOrderRollTableProps> = ({ order, onRegisterDeath }) => {
	const { headSx, indexSx, textCellSx, zebraBg } = useGridCellStyles();
	const [menu, setMenu] = useState<{ anchor: HTMLElement; line: ExitOrderLine } | null>(null);
	const number = { ...textCellSx, textAlign: 'right', whiteSpace: 'nowrap' } as const;

	return (
		<Box>
			<Typography
				variant="overline"
				sx={{ fontWeight: 800, color: 'text.secondary' }}
			>
				Nómina ({order.animals.length})
			</Typography>
			<SheetGrid
				minWidth={640}
				maxHeight={360}
			>
				<TableHead>
					<TableRow>
						<TableCell sx={{ ...headSx, width: 44, textAlign: 'center' }}>#</TableCell>
						<TableCell sx={{ ...headSx, minWidth: 130 }}>Caravana</TableCell>
						<TableCell sx={{ ...headSx, minWidth: 150 }}>Lote · Actividad</TableCell>
						<TableCell sx={{ ...headSx, width: 80, textAlign: 'right' }}>Peso</TableCell>
						<TableCell sx={{ ...headSx, width: 80, textAlign: 'right' }}>$/kg</TableCell>
						<TableCell sx={{ ...headSx, width: 110, textAlign: 'right' }}>Importe</TableCell>
						<TableCell sx={{ ...headSx, width: 90 }}>Estado</TableCell>
						<TableCell sx={{ ...headSx, width: 48, borderRight: 0 }} />
					</TableRow>
				</TableHead>
				<TableBody>
					{order.animals.map((line, index) => (
						<TableRow
							key={line.id}
							sx={{ bgcolor: index % 2 === 1 ? zebraBg : undefined }}
						>
							<TableCell sx={indexSx}>{index + 1}</TableCell>
							<SheetGridTagCell
								tag={line.label}
								caption={
									[line.category?.name, line.was_pregnant ? 'preñada' : null]
										.filter(Boolean)
										.join(' · ') || undefined
								}
							/>
							<TableCell sx={{ ...textCellSx, fontSize: '0.78rem' }}>
								{line.from_batch?.name ?? '—'}
								<Typography
									component="span"
									variant="caption"
									color="text.secondary"
								>
									{line.activity?.name ? ` · ${line.activity.name}` : ''}
								</Typography>
							</TableCell>
							<TableCell sx={number}>
								{line.weight_estimated ? `≈ ${formatKg(line.weight_kg)}` : formatKg(line.weight_kg)}
							</TableCell>
							<TableCell sx={number}>{line.price_per_kg ?? '—'}</TableCell>
							<TableCell sx={number}>{formatMoney(line.amount)}</TableCell>
							<TableCell sx={textCellSx}>
								<Chip
									size="small"
									label={line.status_label}
									color={LINE_COLOR[line.status]}
									variant="outlined"
									sx={{ height: 20, fontSize: '0.66rem', fontWeight: 700 }}
								/>
							</TableCell>
							<SheetGridStatusCell
								info={line.status === 'SKIPPED' ? (line.skipped_reason ?? 'No salió') : undefined}
							>
								{line.status === 'PENDING' && onRegisterDeath && (
									<IconButton
										size="small"
										aria-label={`Acciones de ${line.label}`}
										onClick={(e) => setMenu({ anchor: e.currentTarget, line })}
									>
										<FuseSvgIcon size={16}>heroicons-outline:ellipsis-vertical</FuseSvgIcon>
									</IconButton>
								)}
							</SheetGridStatusCell>
						</TableRow>
					))}
				</TableBody>
			</SheetGrid>

			<Menu
				anchorEl={menu?.anchor}
				open={menu != null}
				onClose={() => setMenu(null)}
			>
				<MenuItem
					onClick={() => {
						if (menu) onRegisterDeath?.(menu.line);

						setMenu(null);
					}}
				>
					<ListItemIcon>
						<FuseSvgIcon size={18}>heroicons-outline:x-circle</FuseSvgIcon>
					</ListItemIcon>
					Registrar muerte
				</MenuItem>
			</Menu>
		</Box>
	);
};

export default ExitOrderRollTable;
