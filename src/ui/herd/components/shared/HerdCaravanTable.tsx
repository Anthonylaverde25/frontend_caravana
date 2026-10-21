import {
	Checkbox,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	useTheme
} from '@mui/material';
import type { CaravanSummary } from '@/core/caravans/domain/entities/CaravanSummary';
import HerdCaravanTableRow from './HerdCaravanTableRow';

interface HerdCaravanTableProps {
	rows: CaravanSummary[];
	highlightId?: number | null;
	/** Shows the batch column: the global search lists caravans of any batch. */
	showBatch?: boolean;
	onView: (caravan: CaravanSummary) => void;
	onEdit?: (caravan: CaravanSummary) => void;
	onWeigh?: (caravan: CaravanSummary) => void;
	onBreeding?: (caravan: CaravanSummary) => void;
	onDeath?: (caravan: CaravanSummary) => void;
	/** Row selection for bulk actions; the table is read-only without it. */
	selectedIds?: number[];
	onSelectionChange?: (ids: number[]) => void;
}

/**
 * Caravan rows of a batch: tag, sex, category, reproductive state, weight and arrival to the batch.
 * Adheres strictly to the canonical table design pattern of CaravanDataTable (/caravans).
 */
export function HerdCaravanTable({
	rows,
	highlightId,
	showBatch = false,
	onView,
	onEdit,
	onWeigh,
	onBreeding,
	onDeath,
	selectedIds,
	onSelectionChange
}: HerdCaravanTableProps) {
	const selectable = selectedIds !== undefined && onSelectionChange !== undefined;
	const selected = new Set(selectedIds ?? []);
	const allSelected = rows.length > 0 && rows.every((row) => selected.has(row.id));
	const someSelected = rows.some((row) => selected.has(row.id)) && !allSelected;
	const toggleRow = (caravan: CaravanSummary) =>
		onSelectionChange?.(
			selected.has(caravan.id) ? [...selected].filter((id) => id !== caravan.id) : [...selected, caravan.id]
		);
	const toggleAll = () => onSelectionChange?.(allSelected ? [] : rows.map((row) => row.id));

	const theme = useTheme();
	const isDark = theme.palette.mode === 'dark';
	const headerBg = isDark ? '#1e293b' : '#f8fafc';
	const zebraBg = isDark ? 'rgba(255, 255, 255, 0.02)' : '#fafafa';
	const headerBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0';
	const bodyBorder = isDark ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9';

	const headerCellStyle = {
		py: 1.2,
		px: 1.5,
		fontSize: '0.7rem',
		fontWeight: 700,
		textTransform: 'uppercase' as const,
		color: isDark ? '#94a3b8' : '#475569',
		borderBottom: '1px solid',
		borderRight: '1px solid',
		borderColor: headerBorder,
		whiteSpace: 'nowrap' as const,
		letterSpacing: '0.04em',
		bgcolor: headerBg
	};

	const bodyCellStyle = {
		px: 1.5,
		py: 1.1,
		borderRight: '1px solid',
		borderBottom: '1px solid',
		borderColor: bodyBorder
	};

	return (
		<TableContainer>
			<Table
				size="small"
				sx={{ borderCollapse: 'collapse' }}
			>
				<TableHead>
					<TableRow>
						{selectable && (
							<TableCell padding="checkbox" sx={headerCellStyle}>
								<Checkbox size="small" checked={allSelected} indeterminate={someSelected} onChange={toggleAll} />
							</TableCell>
						)}
						<TableCell sx={{ ...headerCellStyle, minWidth: 140 }}>Caravana</TableCell>
						<TableCell sx={{ ...headerCellStyle, minWidth: 100 }}>Sexo</TableCell>
						<TableCell sx={{ ...headerCellStyle, minWidth: 130 }}>Categoría</TableCell>
						<TableCell sx={{ ...headerCellStyle, minWidth: 120 }}>Estado</TableCell>
						<TableCell sx={{ ...headerCellStyle, minWidth: 120 }}>Reproducción</TableCell>
						<TableCell
							sx={{ ...headerCellStyle, minWidth: 110, textAlign: 'right' }}
							align="right"
						>
							Peso actual
						</TableCell>
						{showBatch && <TableCell sx={{ ...headerCellStyle, minWidth: 140 }}>Lote</TableCell>}
						<TableCell sx={{ ...headerCellStyle, minWidth: 130 }}>Ingreso al lote</TableCell>
						<TableCell
							sx={{ ...headerCellStyle, minWidth: 110, borderRight: 0, textAlign: 'right' }}
							align="right"
						>
							Acciones
						</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{rows.map((caravan, index) => {
						const highlighted = caravan.id === highlightId;
						const rowBg = highlighted
							? isDark
								? 'rgba(99, 102, 241, 0.22)'
								: '#e0e7ff'
							: index % 2 === 1
								? zebraBg
								: 'inherit';

						return (
							<HerdCaravanTableRow
								key={caravan.id}
								caravan={caravan}
								rowBg={rowBg}
								cellSx={bodyCellStyle}
								showBatch={showBatch}
								selectable={selectable}
								selected={selected.has(caravan.id)}
								onToggleSelect={toggleRow}
								onView={onView}
								onEdit={onEdit}
								onWeigh={onWeigh}
								onBreeding={onBreeding}
								onDeath={onDeath}
							/>
						);
					})}
				</TableBody>
			</Table>
		</TableContainer>
	);
}

export default HerdCaravanTable;
