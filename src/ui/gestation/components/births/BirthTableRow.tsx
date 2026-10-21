import React from 'react';
import { TableRow, TableCell, Checkbox, Typography, Chip, Tooltip, Button, useTheme } from '@mui/material';
import { BirthHistoryRecord } from '@/features/gestation/hooks/useBirthHistory';

interface BirthTableRowProps {
	record: BirthHistoryRecord;
	isSelected: boolean;
	indexNumber?: number;
	showBatchColumn?: boolean;
	onToggleSelect: (calfId: number) => void;
	onWean: (target: 'new' | 'register', calfIds: number[]) => void;
}

export const BirthTableRow: React.FC<BirthTableRowProps> = ({
	record,
	isSelected,
	indexNumber,
	showBatchColumn = false,
	onToggleSelect,
	onWean
}) => {
	const theme = useTheme();
	const isDark = theme.palette.mode === 'dark';

	const cellStyle = {
		px: 1.5,
		py: 1.1,
		borderRight: '1px solid',
		borderBottom: '1px solid',
		borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9',
		fontSize: '0.8rem',
		borderRadius: 0,
		'&:last-child': { borderRight: 0 }
	};

	const isEligible = record.is_nursing && !record.open_order_code;
	const zebraBg = isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.015)';

	return (
		<TableRow
			hover
			sx={{
				bgcolor: isSelected
					? isDark
						? 'rgba(99, 102, 241, 0.22)'
						: '#e0e7ff'
					: 'inherit',
				'&:nth-of-type(even)': {
					bgcolor: isSelected
						? isDark
							? 'rgba(99, 102, 241, 0.28)'
							: '#d5ddfc'
						: zebraBg
				},
				transition: 'background-color 0.15s ease'
			}}
		>
			{/* Selection Checkbox */}
			<TableCell
				sx={{
					...cellStyle,
					width: 44,
					textAlign: 'center',
					p: 0.5,
					cursor: isEligible ? 'pointer' : 'default'
				}}
				onClick={() => isEligible && onToggleSelect(record.calf_id)}
			>
				<Checkbox
					size="small"
					checked={isSelected}
					disabled={!isEligible}
					onChange={() => onToggleSelect(record.calf_id)}
					sx={{ p: 0.5 }}
				/>
			</TableCell>

			{/* Index Column (#) */}
			{indexNumber !== undefined && (
				<TableCell
					sx={{
						...cellStyle,
						width: 44,
						textAlign: 'center',
						color: 'text.secondary',
						fontSize: '0.75rem',
						fontWeight: 600
					}}
				>
					{indexNumber}
				</TableCell>
			)}

			{/* Mother Tag */}
			<TableCell sx={cellStyle}>
				<Typography
					sx={{
						fontFamily: 'monospace',
						fontWeight: 800,
						color: 'primary.main',
						fontSize: '0.85rem',
						lineHeight: 1.1
					}}
				>
					#{record.mother_identification}
				</Typography>
			</TableCell>

			{/* Birth Date */}
			<TableCell sx={{ ...cellStyle, whiteSpace: 'nowrap', fontSize: '0.78rem' }}>
				{record.birth_date}
			</TableCell>

			{/* Calf Tag */}
			<TableCell sx={cellStyle}>
				<Typography
					sx={{
						fontFamily: 'monospace',
						fontWeight: 800,
						color: 'text.primary',
						fontSize: '0.85rem',
						lineHeight: 1.1
					}}
				>
					{record.calf_identification ? `#${record.calf_identification}` : (record.calf_label || '-')}
				</Typography>
				{record.calf_death_date && (
					<Typography
						component="span"
						variant="caption"
						sx={{ display: 'block', color: 'error.main', fontSize: '0.68rem', fontWeight: 600 }}
					>
						{`Murió el ${record.calf_death_date.split('-').reverse().join('/')}`}
					</Typography>
				)}
			</TableCell>

			{/* Sex */}
			<TableCell sx={cellStyle}>
				<Chip
					size="small"
					label={record.calf_sex === 'M' ? 'Macho' : record.calf_sex === 'H' ? 'Hembra' : '-'}
					color={record.calf_sex === 'M' ? 'info' : record.calf_sex === 'H' ? 'secondary' : 'default'}
					variant="outlined"
					sx={{ fontWeight: 700, fontSize: '0.68rem', height: 22 }}
				/>
			</TableCell>

			{/* Conditional Batch Column (for flat table) */}
			{showBatchColumn && (
				<TableCell sx={{ ...cellStyle, color: 'text.secondary', fontWeight: 600 }}>
					{record.calf_batch_name || record.mother_batch_name || 'Sin lote'}
				</TableCell>
			)}

			{/* Nursing Status */}
			<TableCell sx={cellStyle}>
				<Chip
					label={record.is_nursing ? 'Al Pie / Lactando' : 'Destetado'}
					size="small"
					sx={{
						fontWeight: 700,
						fontSize: '0.72rem',
						borderRadius: '4px',
						height: 22,
						bgcolor: record.is_nursing
							? isDark
								? 'rgba(16, 185, 129, 0.15)'
								: '#eefbee'
							: isDark
								? 'rgba(255, 255, 255, 0.05)'
								: '#f3f4f6',
						color: record.is_nursing
							? isDark
								? '#4ade80'
								: '#107e3e'
							: isDark
								? 'text.secondary'
								: '#4b5563',
						border: record.is_nursing
							? isDark
								? '1px solid rgba(74, 222, 128, 0.3)'
								: '1px solid #107e3e'
							: isDark
								? '1px solid rgba(255, 255, 255, 0.1)'
								: '1px solid #d1d5db'
					}}
				/>
				{record.open_order_code && (
					<Tooltip title="Comprometida en una orden abierta: se desteta con esa orden.">
						<Chip
							label={`En orden ${record.open_order_code}`}
							size="small"
							variant="outlined"
							color="primary"
							sx={{ ml: 0.75, fontWeight: 700, fontSize: '0.7rem', height: 22, fontFamily: 'monospace' }}
						/>
					</Tooltip>
				)}
			</TableCell>

			{/* Notes */}
			<TableCell
				sx={{
					...cellStyle,
					color: 'text.secondary',
					fontSize: '0.78rem',
					fontStyle: record.notes ? 'normal' : 'italic',
					maxWidth: 220,
					whiteSpace: 'nowrap',
					overflow: 'hidden',
					textOverflow: 'ellipsis'
				}}
			>
				{record.notes || 'Sin observaciones'}
			</TableCell>

			{/* Actions */}
			<TableCell sx={{ ...cellStyle, textAlign: 'right' }}>
				{isEligible ? (
					<Tooltip title="Registrar el destete de esta cría individualmente">
						<Button
							size="small"
							variant="outlined"
							color="warning"
							onClick={() => onWean('register', [record.calf_id])}
							sx={{
								borderRadius: '6px',
								textTransform: 'none',
								fontWeight: 700,
								fontSize: '0.74rem',
								py: 0.4,
								px: 1.5,
								borderColor: 'warning.main',
								whiteSpace: 'nowrap'
							}}
						>
							Registrar destete
						</Button>
					</Tooltip>
				) : record.is_nursing ? (
					<Typography
						variant="caption"
						color="primary"
						sx={{ fontWeight: 700, pr: 1, fontFamily: 'monospace' }}
					>
						{record.open_order_code}
					</Typography>
				) : (
					<Typography
						variant="caption"
						color="text.disabled"
						sx={{ fontWeight: 600, pr: 1 }}
					>
						Finalizado
					</Typography>
				)}
			</TableCell>
		</TableRow>
	);
};

export default BirthTableRow;
