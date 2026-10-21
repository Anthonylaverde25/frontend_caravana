import React from 'react';
import {
	Paper,
	TableContainer,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	Checkbox,
	useTheme
} from '@mui/material';
import { BirthHistoryRecord } from '@/features/gestation/hooks/useBirthHistory';
import BirthTableRow from './BirthTableRow';

interface BirthsFlatTableProps {
	records: BirthHistoryRecord[];
	eligibleCalves: BirthHistoryRecord[];
	selectedCalfIds: number[];
	onToggleSelect: (calfId: number) => void;
	onToggleSelectAll: () => void;
	onWean: (target: 'new' | 'register', calfIds: number[]) => void;
}

export const BirthsFlatTable: React.FC<BirthsFlatTableProps> = ({
	records,
	eligibleCalves,
	selectedCalfIds,
	onToggleSelect,
	onToggleSelectAll,
	onWean
}) => {
	const theme = useTheme();
	const isDark = theme.palette.mode === 'dark';

	const headerBg = isDark ? theme.palette.background.default : '#f8f9fa';
	const headerBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0';

	const tableHeaderStyle = {
		px: 2,
		py: 1.5,
		borderRight: '1px solid',
		borderBottom: '2px solid',
		borderColor: headerBorder,
		fontSize: '0.74rem',
		fontWeight: 800,
		color: theme.palette.text.primary,
		backgroundColor: headerBg,
		textTransform: 'uppercase' as const,
		letterSpacing: '0.04em',
		borderRadius: 0,
		'&:last-child': { borderRight: 0 }
	};

	const isAllEligibleSelected = eligibleCalves.length > 0 && selectedCalfIds.length === eligibleCalves.length;
	const isSomeEligibleSelected = selectedCalfIds.length > 0 && selectedCalfIds.length < eligibleCalves.length;

	return (
		<TableContainer
			component={Paper}
			elevation={0}
			sx={{
				borderRadius: '8px',
				border: 1,
				borderColor: 'divider',
				overflow: 'hidden',
				bgcolor: 'background.paper'
			}}
		>
			<Table
				sx={{ minWidth: 650 }}
				aria-label="birth history table"
			>
				<TableHead>
					<TableRow>
						<TableCell sx={{ ...tableHeaderStyle, width: '48px', px: 1, textAlign: 'center' }}>
							<Checkbox
								size="small"
								indeterminate={isSomeEligibleSelected}
								checked={isAllEligibleSelected}
								onChange={onToggleSelectAll}
								disabled={eligibleCalves.length === 0}
								sx={{ p: 0.5 }}
							/>
						</TableCell>
						<TableCell sx={tableHeaderStyle}>Caravana Madre</TableCell>
						<TableCell sx={tableHeaderStyle}>Fecha del Parto</TableCell>
						<TableCell sx={tableHeaderStyle}>Caravana Cría</TableCell>
						<TableCell sx={tableHeaderStyle}>Sexo</TableCell>
						<TableCell sx={tableHeaderStyle}>Lote Actual</TableCell>
						<TableCell sx={tableHeaderStyle}>Estado Lactancia</TableCell>
						<TableCell sx={tableHeaderStyle}>Observaciones</TableCell>
						<TableCell sx={{ ...tableHeaderStyle, textAlign: 'right' }}>Acciones</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{records.length === 0 ? (
						<TableRow>
							<TableCell
								colSpan={9}
								align="center"
								sx={{ py: 8, color: 'text.disabled', fontStyle: 'italic' }}
							>
								No se encontraron partos con los filtros actuales.
							</TableCell>
						</TableRow>
					) : (
						records.map((record) => (
							<BirthTableRow
								key={record.gestation_id}
								record={record}
								isSelected={selectedCalfIds.includes(record.calf_id)}
								showBatchColumn={true}
								onToggleSelect={onToggleSelect}
								onWean={onWean}
							/>
						))
					)}
				</TableBody>
			</Table>
		</TableContainer>
	);
};

export default BirthsFlatTable;
