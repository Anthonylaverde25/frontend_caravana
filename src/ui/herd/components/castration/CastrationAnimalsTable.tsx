import {
	Checkbox,
	MenuItem,
	Select,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	Tooltip,
	Typography
} from '@mui/material';
import SheetGrid from '@/components/sheet-grid/SheetGrid';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';
import type { CastrationRow } from './castration';

interface CastrationAnimalsTableProps {
	rows: CastrationRow[];
	errors: Record<number, string[]>;
	onToggleRow: (caravanId: number) => void;
	onToggleAll: (checked: boolean) => void;
	onChangeTargetCategory: (caravanId: number, categoryId: number | null) => void;
}

export function CastrationAnimalsTable({
	rows,
	errors,
	onToggleRow,
	onToggleAll,
	onChangeTargetCategory
}: CastrationAnimalsTableProps) {
	const { headSx, indexSx, textCellSx, cellSx, zebraBg } = useGridCellStyles();

	const selectableRows = rows.filter((r) => !r.disabled);
	const allChecked = selectableRows.length > 0 && selectableRows.every((r) => r.checked);
	const someChecked = selectableRows.some((r) => r.checked);

	return (
		<SheetGrid
			minWidth={640}
			maxHeight={{ xs: 340, md: 400 }}
		>
			<TableHead>
				<TableRow>
					<TableCell sx={{ ...indexSx, p: 0 }}>
						<Checkbox
							size="small"
							indeterminate={someChecked && !allChecked}
							checked={allChecked}
							disabled={selectableRows.length === 0}
							onChange={(e) => onToggleAll(e.target.checked)}
							sx={{ p: 0.5 }}
						/>
					</TableCell>
					<TableCell sx={headSx}>Caravana</TableCell>
					<TableCell sx={headSx}>Categoría</TableCell>
					<TableCell sx={{ ...headSx, width: 80 }}>Edad</TableCell>
					<TableCell sx={{ ...headSx, minWidth: 160 }}>Pasa a</TableCell>
					<TableCell sx={{ ...headSx, minWidth: 140 }}>Aviso</TableCell>
				</TableRow>
			</TableHead>
			<TableBody>
				{rows.map((row) => {
					const messages = errors[row.caravanId] ?? [];
					const hasError = messages.length > 0;
					const isTorito = row.targetCategoryOptions.length > 0;

					return (
						<TableRow
							key={row.caravanId}
							sx={{
								bgcolor: row.disabled ? 'action.hover' : undefined,
								'&:nth-of-type(even)': {
									bgcolor: row.disabled ? 'action.hover' : zebraBg
								}
							}}
						>
							<TableCell sx={{ ...indexSx, p: 0 }}>
								<Checkbox
									size="small"
									checked={row.checked}
									disabled={row.disabled}
									onChange={() => onToggleRow(row.caravanId)}
									sx={{ p: 0.5 }}
								/>
							</TableCell>

							<TableCell sx={{ ...textCellSx, fontWeight: 600 }}>{row.identification}</TableCell>

							<TableCell sx={textCellSx}>{row.categoryName}</TableCell>

							<TableCell sx={textCellSx}>{row.ageMonths != null ? `${row.ageMonths} m` : '—'}</TableCell>

							<TableCell sx={{ ...cellSx, px: 1 }}>
								{isTorito ? (
									<Select
										size="small"
										fullWidth
										disabled={row.disabled}
										value={row.targetCategoryId ?? ''}
										error={hasError}
										onChange={(e) => {
											const val = !e.target.value ? null : Number(e.target.value);
											onChangeTargetCategory(row.caravanId, val);
										}}
										sx={{
											fontSize: '0.85rem',
											height: 32,
											'& .MuiSelect-select': { py: 0.5 }
										}}
									>
										<MenuItem value="">
											<em>[ elegir ]</em>
										</MenuItem>
										{row.targetCategoryOptions.map((opt) => (
											<MenuItem
												key={opt.id}
												value={opt.id}
											>
												{opt.name}
											</MenuItem>
										))}
									</Select>
								) : (
									<Typography
										variant="body2"
										sx={{ color: 'text.secondary', fontSize: '0.85rem' }}
									>
										— sigue Ternero
									</Typography>
								)}
							</TableCell>

							<TableCell sx={{ ...cellSx, px: 1 }}>
								{hasError ? (
									<Tooltip title={messages.join(' ')}>
										<Typography
											variant="caption"
											sx={{ color: 'error.main', fontWeight: 600, display: 'block' }}
										>
											{messages[0]}
										</Typography>
									</Tooltip>
								) : row.blockedReason ? (
									<Typography
										variant="caption"
										sx={{ color: 'text.disabled', fontStyle: 'italic' }}
									>
										{row.blockedReason}
									</Typography>
								) : null}
							</TableCell>
						</TableRow>
					);
				})}
			</TableBody>
		</SheetGrid>
	);
}

export default CastrationAnimalsTable;
