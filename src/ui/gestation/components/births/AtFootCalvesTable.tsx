import React, { useState } from 'react';
import { Box, Button, Checkbox, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import type { BirthHistoryRecord } from '@/features/gestation/hooks/useBirthHistory';
import SheetGrid from '@/components/sheet-grid/SheetGrid';
import SheetGridTagCell from '@/components/sheet-grid/SheetGridTagCell';
import SheetGridStatusCell from '@/components/sheet-grid/SheetGridStatusCell';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';
import { isWeaningCode } from './birthsTypes';

const COLLAPSED_ROWS = 10;

const formatDate = (iso: string): string => (iso ? iso.slice(0, 10).split('-').reverse().join('/') : '—');

const ageInDays = (birthDate: string): string => {
	if (!birthDate) return '—';

	const days = Math.floor((Date.now() - new Date(`${birthDate.slice(0, 10)}T00:00:00`).getTime()) / 86400000);

	return `${days} d`;
};

/** Why a calf cannot be picked here, if it cannot. */
const notice = (record: BirthHistoryRecord): string | undefined => {
	if (!record.calf_is_tagged) return 'Sin caravana: se caravanea antes de destetarla.';

	if (record.open_order_code && !isWeaningCode(record.open_order_code))
		return `En la orden de transferencia ${record.open_order_code}: se mueve con esa orden.`;

	return undefined;
};

interface AtFootCalvesTableProps {
	records: BirthHistoryRecord[];
	selected: Set<number>;
	onToggle: (calfId: number) => void;
	/** Total of the section before the search, for "5 de 46". */
	label: string;
}

/** The calves of one section of a batch, in the sheet grid; long sections start folded at 10 rows. */
export const AtFootCalvesTable: React.FC<AtFootCalvesTableProps> = ({ records, selected, onToggle, label }) => {
	const { headSx, indexSx, textCellSx, zebraBg, selectedBg } = useGridCellStyles();
	const [expanded, setExpanded] = useState(false);
	const shown = expanded ? records : records.slice(0, COLLAPSED_ROWS);

	return (
		<Box>
			<SheetGrid minWidth={820} borderless>
				<TableHead>
					<TableRow>
						<TableCell sx={indexSx} />
						<TableCell sx={headSx}>Caravana cría</TableCell>
						<TableCell sx={headSx}>Caravana madre</TableCell>
						<TableCell sx={{ ...headSx, width: 90 }}>Sexo</TableCell>
						<TableCell sx={{ ...headSx, width: 120 }}>Nacimiento</TableCell>
						<TableCell sx={{ ...headSx, width: 90 }}>Edad</TableCell>
						<TableCell sx={{ ...headSx, width: 150 }}>Último peso</TableCell>
						<TableCell sx={{ ...headSx, width: 48 }} />
					</TableRow>
				</TableHead>
				<TableBody>
					{shown.map((record, index) => {
						const blocked = notice(record);
						const isSelected = selected.has(record.calf_id);

						return (
							<TableRow
								key={record.calf_id}
								hover
								onClick={() => !blocked && onToggle(record.calf_id)}
								sx={{
									cursor: blocked ? 'default' : 'pointer',
									bgcolor: isSelected ? selectedBg : index % 2 === 1 ? zebraBg : 'inherit'
								}}
							>
								<TableCell sx={indexSx}>
									<Checkbox
										size="small"
										checked={isSelected}
										disabled={Boolean(blocked)}
										onClick={(e) => e.stopPropagation()}
										onChange={() => onToggle(record.calf_id)}
										inputProps={{ 'aria-label': `Elegir ${record.calf_label}` }}
										sx={{ p: 0.5 }}
									/>
								</TableCell>
								<SheetGridTagCell tag={record.calf_label} />
								<TableCell sx={{ ...textCellSx, fontFamily: 'monospace' }}>{record.mother_identification}</TableCell>
								<TableCell sx={textCellSx}>{record.calf_sex === 'M' ? 'Macho' : record.calf_sex === 'H' ? 'Hembra' : '—'}</TableCell>
								<TableCell sx={{ ...textCellSx, color: 'text.secondary' }}>{formatDate(record.birth_date)}</TableCell>
								<TableCell sx={textCellSx}>{ageInDays(record.birth_date)}</TableCell>
								<TableCell sx={textCellSx}>
									{record.calf_weight != null ? (
										<>
											{record.calf_weight} kg
											<Typography component="span" variant="caption" color="text.secondary">
												{' '}
												· {formatDate(record.calf_weighing_date ?? '')}
											</Typography>
										</>
									) : (
										<Typography component="span" variant="body2" color="text.secondary">
											Sólo al nacer
										</Typography>
									)}
								</TableCell>
								<SheetGridStatusCell info={blocked} />
							</TableRow>
						);
					})}
				</TableBody>
			</SheetGrid>
			{records.length > COLLAPSED_ROWS && (
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 0.75 }}>
					<Typography variant="caption" color="text.secondary">
						{shown.length} de {records.length} {label}
					</Typography>
					<Button
						size="small"
						onClick={() => setExpanded((value) => !value)}
						sx={{ textTransform: 'none', fontWeight: 700 }}
					>
						{expanded ? 'Mostrar menos' : `Ver las ${records.length} →`}
					</Button>
				</Box>
			)}
		</Box>
	);
};

export default AtFootCalvesTable;
