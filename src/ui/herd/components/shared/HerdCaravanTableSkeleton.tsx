import {
	Box,
	Skeleton,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	useTheme
} from '@mui/material';

interface HerdCaravanTableSkeletonProps {
	rowCount?: number;
	selectable?: boolean;
	showBatch?: boolean;
}

/**
 * Skeleton placeholder for HerdCaravanTable.
 * Matches exact column widths, paddings, and header styles of the live table
 * to ensure zero layout shift during asynchronous data loading.
 */
export function HerdCaravanTableSkeleton({
	rowCount = 5,
	selectable = false,
	showBatch = false
}: HerdCaravanTableSkeletonProps) {
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

	// Deterministic slight variations for realistic skeleton rendering
	const rows = Array.from({ length: rowCount }, (_, i) => ({
		id: i,
		tagWidth: 70 + (i % 3) * 12,
		categoryWidth: 60 + (i % 4) * 10,
		statusWidth: 54 + (i % 2) * 14,
		reproductionWidth: 50 + (i % 3) * 8,
		weightWidth: 42 + (i % 2) * 10,
		batchWidth: 70 + (i % 2) * 15,
		arrivalWidth: 65 + (i % 3) * 8
	}));

	return (
		<TableContainer>
			<Table
				size="small"
				sx={{ borderCollapse: 'collapse' }}
			>
				<TableHead>
					<TableRow>
						{selectable && (
							<TableCell
								padding="checkbox"
								sx={headerCellStyle}
							>
								<Skeleton
									variant="rectangular"
									width={18}
									height={18}
									sx={{ borderRadius: '3px' }}
								/>
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
					{rows.map((row, index) => {
						const rowBg = index % 2 === 1 ? zebraBg : 'inherit';

						return (
							<TableRow
								key={row.id}
								sx={{ bgcolor: rowBg }}
							>
								{selectable && (
									<TableCell
										padding="checkbox"
										sx={bodyCellStyle}
									>
										<Skeleton
											variant="rectangular"
											width={18}
											height={18}
											sx={{ borderRadius: '3px' }}
										/>
									</TableCell>
								)}
								{/* Identification Tag */}
								<TableCell sx={bodyCellStyle}>
									<Skeleton
										variant="text"
										width={row.tagWidth}
										height={22}
										sx={{ borderRadius: '4px' }}
									/>
								</TableCell>
								{/* Sex Chip */}
								<TableCell sx={bodyCellStyle}>
									<Skeleton
										variant="rounded"
										width={36}
										height={20}
										sx={{ borderRadius: '10px' }}
									/>
								</TableCell>
								{/* Category */}
								<TableCell sx={bodyCellStyle}>
									<Skeleton
										variant="text"
										width={row.categoryWidth}
										height={20}
										sx={{ borderRadius: '4px' }}
									/>
								</TableCell>
								{/* Gestation Status Chip */}
								<TableCell sx={bodyCellStyle}>
									<Skeleton
										variant="rounded"
										width={row.statusWidth}
										height={20}
										sx={{ borderRadius: '10px' }}
									/>
								</TableCell>
								{/* Reproductive Eligibility */}
								<TableCell sx={bodyCellStyle}>
									<Skeleton
										variant="rounded"
										width={row.reproductionWidth}
										height={20}
										sx={{ borderRadius: '10px' }}
									/>
								</TableCell>
								{/* Current Weight */}
								<TableCell
									align="right"
									sx={{ ...bodyCellStyle, textAlign: 'right' }}
								>
									<Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
										<Skeleton
											variant="text"
											width={row.weightWidth}
											height={20}
											sx={{ borderRadius: '4px' }}
										/>
									</Box>
								</TableCell>
								{/* Batch Name (Optional) */}
								{showBatch && (
									<TableCell sx={bodyCellStyle}>
										<Skeleton
											variant="text"
											width={row.batchWidth}
											height={20}
											sx={{ borderRadius: '4px' }}
										/>
									</TableCell>
								)}
								{/* Arrival Date */}
								<TableCell sx={bodyCellStyle}>
									<Skeleton
										variant="text"
										width={row.arrivalWidth}
										height={20}
										sx={{ borderRadius: '4px' }}
									/>
								</TableCell>
								{/* Action Buttons */}
								<TableCell
									align="right"
									sx={{ ...bodyCellStyle, borderRight: 0, textAlign: 'right' }}
								>
									<Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.75 }}>
										<Skeleton
											variant="circular"
											width={24}
											height={24}
										/>
										<Skeleton
											variant="circular"
											width={24}
											height={24}
										/>
									</Box>
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</TableContainer>
	);
}

export default HerdCaravanTableSkeleton;
