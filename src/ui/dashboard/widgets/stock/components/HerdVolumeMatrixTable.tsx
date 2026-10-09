import {
	Box,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableFooter,
	TableHead,
	TableRow,
	Typography,
	LinearProgress,
	Chip,
	Paper
} from '@mui/material';
import { HerdSexBreakdown, HerdCategoryBreakdown } from '../types/herdGraph.types';
import { formatNumber, formatPercent } from '../../../theme/formatters';

export interface SexVolumeMatrixTableProps {
	data: HerdSexBreakdown;
	totalHerdHeads: number;
	accentColor: string;
	lightBgColor?: string;
	borderTone?: string;
	hideOuterHeader?: boolean;
}

export function SexVolumeMatrixTable({
	data,
	totalHerdHeads,
	accentColor,
	lightBgColor = 'rgba(0, 0, 0, 0.03)',
	borderTone = 'divider',
	hideOuterHeader = false
}: SexVolumeMatrixTableProps) {
	return (
		<Paper
			elevation={0}
			sx={{
				borderRadius: '8px',
				border: 1,
				borderColor: 'divider',
				overflow: 'hidden',
				display: 'flex',
				flexDirection: 'column',
				height: '100%',
				bgcolor: 'background.paper'
			}}
		>
			{/* Optional Sex Header Banner */}
			{!hideOuterHeader && (
				<Box
					sx={{
						px: 2.5,
						py: 1.5,
						bgcolor: lightBgColor,
						borderBottom: 1,
						borderColor: borderTone,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						gap: 1.5
					}}
				>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
						<Box
							sx={{
								width: 10,
								height: 10,
								borderRadius: '50%',
								bgcolor: accentColor
							}}
						/>
						<Typography
							sx={{
								fontSize: '0.9375rem',
								fontWeight: 700,
								color: 'text.primary',
								letterSpacing: '0.01em'
							}}
						>
							{data.label}
						</Typography>
					</Box>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<Typography
							sx={{
								fontSize: '1rem',
								fontWeight: 800,
								color: accentColor,
								fontVariantNumeric: 'tabular-nums'
							}}
						>
							{formatNumber(data.heads)} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>cab.</span>
						</Typography>
						<Chip
							size="small"
							label={`${formatPercent(data.pctOfTotal, 1)} del rodeo`}
							sx={{
								bgcolor: 'background.paper',
								color: 'text.primary',
								fontWeight: 700,
								fontSize: '0.75rem',
								border: 1,
								borderColor: 'divider'
							}}
						/>
					</Box>
				</Box>
			)}

			{/* Matrix Table */}
			<TableContainer sx={{ flexGrow: 1 }}>
				<Table size="small" sx={{ '& td, & th': { fontVariantNumeric: 'tabular-nums' } }}>
					<TableHead>
						<TableRow sx={{ bgcolor: 'action.hover' }}>
							<TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1.25, color: 'text.secondary' }}>
								CATEGORÍA
							</TableCell>
							<TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1.25, color: 'text.secondary', width: 85 }}>
								CABEZAS
							</TableCell>
							<TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1.25, color: 'text.secondary', minWidth: 120 }}>
								VOLUMEN EN SEXO
							</TableCell>
							<TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1.25, color: 'text.secondary', width: 75 }}>
								% RODEO
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{data.categories.map((cat: HerdCategoryBreakdown) => (
							<TableRow
								key={cat.id}
								hover
								sx={{
									'&:last-child td': { borderBottom: 0 },
									transition: 'background-color 0.15s ease'
								}}
							>
								{/* Categoría */}
								<TableCell sx={{ py: 1.25 }}>
									<Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>
										{cat.label}
									</Typography>
									{cat.description && (
										<Typography sx={{ fontSize: '0.71875rem', color: 'text.secondary', mt: 0.25 }}>
											{cat.description}
										</Typography>
									)}
								</TableCell>

								{/* Cabezas */}
								<TableCell align="right" sx={{ py: 1.25 }}>
									<Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: 'text.primary' }}>
										{formatNumber(cat.heads)}
									</Typography>
								</TableCell>

								{/* Barra de Volumen en Sexo */}
								<TableCell sx={{ py: 1.25 }}>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
										<LinearProgress
											variant="determinate"
											value={cat.pctOfSex}
											sx={{
												flexGrow: 1,
												height: 8,
												borderRadius: 4,
												bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#E5E7EB',
												'& .MuiLinearProgress-bar': {
													bgcolor: cat.color,
													borderRadius: 4
												}
											}}
										/>
										<Typography
											sx={{
												fontSize: '0.8125rem',
												fontWeight: 700,
												color: 'text.primary',
												minWidth: 42,
												textAlign: 'right'
											}}
										>
											{formatPercent(cat.pctOfSex, 1)}
										</Typography>
									</Box>
								</TableCell>

								{/* % del Rodeo */}
								<TableCell align="right" sx={{ py: 1.25 }}>
									<Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.secondary' }}>
										{formatPercent(cat.pctOfTotal, 1)}
									</Typography>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
					<TableFooter>
						<TableRow sx={{ bgcolor: 'action.hover' }}>
							<TableCell sx={{ py: 1.25, fontWeight: 700, fontSize: '0.8125rem', color: 'text.primary' }}>
								TOTAL {data.sex === 'H' ? 'HEMBRAS' : 'MACHOS'}
							</TableCell>
							<TableCell align="right" sx={{ py: 1.25, fontWeight: 800, fontSize: '0.9375rem', color: accentColor }}>
								{formatNumber(data.heads)}
							</TableCell>
							<TableCell sx={{ py: 1.25, fontWeight: 700, fontSize: '0.8125rem', color: 'text.secondary' }}>
								100% de {data.sex === 'H' ? 'hembras' : 'machos'}
							</TableCell>
							<TableCell align="right" sx={{ py: 1.25, fontWeight: 700, fontSize: '0.8125rem', color: accentColor }}>
								{formatPercent(data.pctOfTotal, 1)}
							</TableCell>
						</TableRow>
					</TableFooter>
				</Table>
			</TableContainer>
		</Paper>
	);
}
