import { Button, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip } from '@mui/material';
import SheetGrid from '@/components/sheet-grid/SheetGrid';
import SheetGridTagCell from '@/components/sheet-grid/SheetGridTagCell';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';
import type { UntaggedCalf } from '@/core/caravans/domain/entities/UntaggedCalf';
import { formatDate, formatKg } from '../../utils/herdFormat';
import type { TagCalvesErrors, TagCalvesValues } from './tagCalves';

interface TagCalvesTableProps {
	calves: UntaggedCalf[];
	values: TagCalvesValues;
	errors: TagCalvesErrors;
	onChange: (calfId: number, tag: string) => void;
	/** The calf died before being tagged: registers its death instead. */
	onDied: (calf: UntaggedCalf) => void;
}

const COLUMNS = ['Madre', 'Sexo', 'Nacimiento', 'Peso al nacer', 'Caravana', ''];

/** One row per calf waiting for its tag: who its mother is, and the tag put on it. */
export function TagCalvesTable({ calves, values, errors, onChange, onDied }: TagCalvesTableProps) {
	const { headSx, indexSx, textCellSx, cellSx, inputSx, zebraBg } = useGridCellStyles();

	return (
		<SheetGrid
			minWidth={640}
			maxHeight={{ xs: 360, md: 440 }}
		>
			<TableHead>
				<TableRow>
					<TableCell sx={indexSx}>#</TableCell>
					{COLUMNS.map((label) => (
						<TableCell
							key={label}
							sx={headSx}
						>
							{label}
						</TableCell>
					))}
				</TableRow>
			</TableHead>
			<TableBody>
				{calves.map((calf, index) => {
					const messages = errors[calf.id] ?? [];

					return (
						<TableRow
							key={calf.id}
							sx={{ '&:nth-of-type(even)': { bgcolor: zebraBg } }}
						>
							<TableCell sx={indexSx}>{index + 1}</TableCell>
							<SheetGridTagCell
								tag={calf.mother_identification}
								caption={calf.label}
							/>
							<TableCell sx={textCellSx}>{calf.sex === 'M' ? 'Macho' : 'Hembra'}</TableCell>
							<TableCell sx={textCellSx}>{formatDate(calf.birth_date)}</TableCell>
							<TableCell sx={textCellSx}>{formatKg(calf.birth_weight)}</TableCell>
							<TableCell sx={{ ...cellSx, minWidth: 160 }}>
								<Tooltip
									title={messages.join(' ')}
									disableHoverListener={messages.length === 0}
								>
									<TextField
										fullWidth
										variant="outlined"
										placeholder="Caravana"
										value={values[calf.id] ?? ''}
										error={messages.length > 0}
										onChange={(e) => onChange(calf.id, e.target.value)}
										sx={inputSx}
									/>
								</Tooltip>
							</TableCell>
							<TableCell sx={{ ...cellSx, width: 90, textAlign: 'center' }}>
								<Button
									size="small"
									color="inherit"
									onClick={() => onDied(calf)}
									sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
								>
									Murió
								</Button>
							</TableCell>
						</TableRow>
					);
				})}
			</TableBody>
		</SheetGrid>
	);
}

export default TagCalvesTable;
