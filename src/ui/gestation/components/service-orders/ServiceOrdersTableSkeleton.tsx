import {
	Skeleton,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	useTheme
} from '@mui/material';

interface ServiceOrdersTableSkeletonProps {
	rowCount?: number;
}

export function ServiceOrdersTableSkeleton({ rowCount = 5 }: ServiceOrdersTableSkeletonProps) {
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
				sx={{ borderCollapse: 'collapse', minWidth: 900 }}
			>
				<TableHead>
					<TableRow>
						<TableCell sx={{ ...headerCellStyle, minWidth: 140 }}>Código</TableCell>
						<TableCell sx={{ ...headerCellStyle, minWidth: 180 }}>Lote</TableCell>
						<TableCell sx={{ ...headerCellStyle, minWidth: 110 }}>Toros</TableCell>
						<TableCell sx={{ ...headerCellStyle, minWidth: 120 }}>Vientres</TableCell>
						<TableCell sx={{ ...headerCellStyle, minWidth: 140 }}>Fecha Planificada</TableCell>
						<TableCell sx={{ ...headerCellStyle, minWidth: 130 }}>Estado</TableCell>
						<TableCell
							align="right"
							sx={{ ...headerCellStyle, minWidth: 130, borderRight: 0, textAlign: 'right' }}
						>
							Acciones
						</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{Array.from({ length: rowCount }).map((_, index) => {
						const rowBg = index % 2 === 1 ? zebraBg : 'inherit';

						return (
							<TableRow
								key={index}
								sx={{ bgcolor: rowBg }}
							>
								<TableCell sx={bodyCellStyle}>
									<Skeleton
										variant="text"
										width={85}
										height={22}
									/>
								</TableCell>
								<TableCell sx={bodyCellStyle}>
									<Skeleton
										variant="text"
										width={130}
										height={22}
									/>
								</TableCell>
								<TableCell sx={bodyCellStyle}>
									<Skeleton
										variant="rounded"
										width={60}
										height={20}
										sx={{ borderRadius: '4px' }}
									/>
								</TableCell>
								<TableCell sx={bodyCellStyle}>
									<Skeleton
										variant="rounded"
										width={75}
										height={20}
										sx={{ borderRadius: '4px' }}
									/>
								</TableCell>
								<TableCell sx={bodyCellStyle}>
									<Skeleton
										variant="text"
										width={80}
										height={22}
									/>
								</TableCell>
								<TableCell sx={bodyCellStyle}>
									<Skeleton
										variant="rounded"
										width={85}
										height={20}
										sx={{ borderRadius: '4px' }}
									/>
								</TableCell>
								<TableCell
									align="right"
									sx={{ ...bodyCellStyle, borderRight: 0 }}
								>
									<Skeleton
										variant="rounded"
										width={100}
										height={24}
										sx={{ ml: 'auto', borderRadius: '4px' }}
									/>
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</TableContainer>
	);
}

export default ServiceOrdersTableSkeleton;
