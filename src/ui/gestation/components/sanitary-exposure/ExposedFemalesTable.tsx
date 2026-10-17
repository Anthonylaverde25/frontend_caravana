import { Checkbox, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import type { ExposedFemale } from '@/core/veterinary/domain/SanitaryExposure';

interface ExposedFemalesTableProps {
	females: ExposedFemale[];
	selectedIds: number[];
	onSelectionChange: (ids: number[]) => void;
	selectable: boolean;
}

const headSx = { fontWeight: 700, fontSize: '0.72rem' };
const cellSx = { fontSize: '0.78rem' };

function formatDay(value: string | null): string {
	if (!value) return 'continúa';
	const [y, m, d] = value.slice(0, 10).split('-');
	return `${d}/${m}/${y}`;
}

/** Females of an exposure alert: where they are now, the shared period and their review. */
function ExposedFemalesTable({ females, selectedIds, onSelectionChange, selectable }: ExposedFemalesTableProps) {
	const pendingIds = Array.from(new Set(females.filter((f) => !f.reviewed_at).map((f) => f.female_id)));
	const allSelected = pendingIds.length > 0 && pendingIds.every((id) => selectedIds.includes(id));
	const toggle = (id: number) =>
		onSelectionChange(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);

	return (
		<TableContainer sx={{ maxHeight: 340, border: 1, borderColor: 'divider', borderRadius: '8px' }}>
			<Table size="small" stickyHeader>
				<TableHead>
					<TableRow>
						{selectable && (
							<TableCell padding="checkbox">
								<Checkbox
									size="small"
									checked={allSelected}
									indeterminate={!allSelected && selectedIds.length > 0}
									onChange={() => onSelectionChange(allSelected ? [] : pendingIds)}
								/>
							</TableCell>
						)}
						<TableCell sx={headSx}>CARAVANA</TableCell>
						<TableCell sx={headSx}>LOTE ACTUAL</TableCell>
						<TableCell sx={headSx}>ORDEN</TableCell>
						<TableCell sx={headSx}>CON EL TORO</TableCell>
						<TableCell sx={headSx}>ESTADO</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{females.map((female) => {
						const reviewed = female.reviewed_at !== null;
						return (
							<TableRow key={`${female.female_id}-${female.service_order.id}`} hover>
								{selectable && (
									<TableCell padding="checkbox">
										<Checkbox
											size="small"
											disabled={reviewed}
											checked={reviewed || selectedIds.includes(female.female_id)}
											onChange={() => toggle(female.female_id)}
										/>
									</TableCell>
								)}
								<TableCell sx={{ ...cellSx, fontWeight: 700, fontFamily: 'monospace' }}>{female.identification}</TableCell>
								<TableCell sx={cellSx}>{female.current_batch?.name ?? 'Sin lote'}</TableCell>
								<TableCell sx={cellSx}>{female.service_order.code}</TableCell>
								<TableCell sx={cellSx}>
									{formatDay(female.overlap_from)} → {formatDay(female.overlap_until)}
								</TableCell>
								<TableCell sx={cellSx}>
									{female.is_pregnant && (
										<Chip size="small" label="Preñada" color="success" variant="outlined" sx={{ height: 18, fontSize: '0.6rem', mr: 0.5 }} />
									)}
									{reviewed ? (
										<Typography variant="caption" color="text.secondary">
											Revisada{female.review_note ? ` · ${female.review_note}` : ''}
										</Typography>
									) : (
										<Chip size="small" label="Pendiente" color="error" variant="outlined" sx={{ height: 18, fontSize: '0.6rem' }} />
									)}
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</TableContainer>
	);
}

export default ExposedFemalesTable;
