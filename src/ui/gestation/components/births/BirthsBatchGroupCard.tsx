import React, { useState } from 'react';
import {
	Paper,
	Stack,
	Box,
	Typography,
	Chip,
	IconButton,
	Tooltip,
	TableContainer,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	Checkbox,
	Collapse,
	TablePagination,
	useTheme
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { BirthBatchGroup } from './birthsTypes';
import BirthTableRow from './BirthTableRow';

interface BirthsBatchGroupCardProps {
	group: BirthBatchGroup;
	selectedCalfIds: number[];
	defaultExpanded?: boolean;
	onToggleSelect: (calfId: number) => void;
	onToggleGroup: (calfIds: number[]) => void;
	onWean: (target: 'new' | 'register', calfIds: number[]) => void;
}

export const BirthsBatchGroupCard: React.FC<BirthsBatchGroupCardProps> = ({
	group,
	selectedCalfIds,
	defaultExpanded = true,
	onToggleSelect,
	onToggleGroup,
	onWean
}) => {
	const theme = useTheme();
	const isDark = theme.palette.mode === 'dark';
	const [isExpanded, setIsExpanded] = useState(defaultExpanded);
	const [page, setPage] = useState(0);
	const rowsPerPage = 10;

	const active = isDark ? '#60a5fa' : '#0a6ed1';
	const headerBg = isDark ? '#1e293b' : '#f8fafc';
	const headerBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0';

	const headerCellStyle = {
		py: 1.2,
		px: 1.5,
		fontSize: '0.7rem',
		fontWeight: 700,
		textTransform: 'uppercase' as const,
		letterSpacing: '0.04em',
		color: isDark ? '#94a3b8' : '#475569',
		borderBottom: '1px solid',
		borderRight: '1px solid',
		borderColor: headerBorder,
		whiteSpace: 'nowrap' as const,
		bgcolor: headerBg,
		'&:last-child': { borderRight: 0 }
	};

	const selectedCountInGroup = group.eligibleCalfIds.filter((id) => selectedCalfIds.includes(id)).length;
	const isAllGroupSelected =
		group.eligibleCalfIds.length > 0 && selectedCountInGroup === group.eligibleCalfIds.length;
	const isSomeGroupSelected = selectedCountInGroup > 0 && !isAllGroupSelected;

	const paginatedRecords = group.records.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

	return (
		<Paper
			elevation={0}
			sx={{
				border: 1,
				borderColor: isSomeGroupSelected || isAllGroupSelected ? alpha(active, 0.45) : 'divider',
				borderRadius: '8px',
				overflow: 'hidden',
				bgcolor: 'background.paper',
				transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
				boxShadow: isSomeGroupSelected || isAllGroupSelected ? `0 2px 8px ${alpha(active, 0.08)}` : 'none'
			}}
		>
			{/* Batch Header Bar */}
			<Stack
				direction={{ xs: 'column', md: 'row' }}
				alignItems={{ xs: 'flex-start', md: 'center' }}
				justifyContent="space-between"
				spacing={1.5}
				sx={{
					px: 2.5,
					py: 1.5,
					borderBottom: isExpanded ? '2px solid' : '1px solid',
					borderColor: isExpanded
						? isDark ? alpha(active, 0.55) : alpha(active, 0.35)
						: 'divider',
					bgcolor: isDark ? alpha(active, 0.16) : alpha('#0a6ed1', 0.07),
					transition: 'border-bottom 0.2s ease',
					borderLeft: '4px solid',
					borderLeftColor: selectedCountInGroup > 0 ? 'primary.main' : alpha(active, 0.35)
				}}
			>
				{/* Left Side: Clickable to expand/collapse */}
				<Stack
					direction="row"
					spacing={1.5}
					alignItems="center"
					onClick={() => setIsExpanded((prev) => !prev)}
					sx={{ cursor: 'pointer', userSelect: 'none', flexGrow: 1 }}
				>
					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							width: 34,
							height: 34,
							borderRadius: '8px',
							bgcolor: active,
							color: '#ffffff',
							flexShrink: 0,
							boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
						}}
					>
						<FuseSvgIcon size={18}>heroicons-outline:rectangle-stack</FuseSvgIcon>
					</Box>
					<Box>
						<Typography
							variant="subtitle1"
							sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}
						>
							{group.batchName}
						</Typography>
						<Typography
							variant="caption"
							sx={{ color: 'text.secondary', fontWeight: 500 }}
						>
							{group.totalBirths} {group.totalBirths === 1 ? 'parto registrado' : 'partos registrados'}{' '}
							&bull; {group.nursingCount} al pie (lactando) &bull; {group.weanedCount} destetados
						</Typography>
					</Box>
				</Stack>

				{/* Right Side: Chips & Controls */}
				<Stack
					direction="row"
					spacing={1}
					alignItems="center"
					flexWrap="wrap"
				>
					<Chip
						size="small"
						variant="outlined"
						label={`${group.totalBirths} ${group.totalBirths === 1 ? 'parto' : 'partos'}`}
						sx={{
							fontSize: '0.72rem',
							height: 24,
							fontWeight: 700,
							bgcolor: 'background.paper',
							borderColor: alpha(active, 0.4),
							color: active
						}}
					/>

					<Chip
						size="small"
						label={`${group.nursingCount} al pie`}
						sx={{
							fontSize: '0.72rem',
							height: 24,
							fontWeight: 700,
							bgcolor: isDark ? 'rgba(16, 185, 129, 0.18)' : '#eefbee',
							color: isDark ? '#4ade80' : '#107e3e'
						}}
					/>

					{selectedCountInGroup > 0 && (
						<Chip
							size="small"
							color="primary"
							label={`${selectedCountInGroup} seleccionadas`}
							sx={{ fontSize: '0.72rem', height: 24, fontWeight: 700 }}
						/>
					)}

					{/* Group-level Checkbox */}
					<Tooltip
						title={
							group.eligibleCalfIds.length === 0
								? 'No hay crías elegibles para destete en este lote'
								: 'Seleccionar todas las crías elegibles del lote'
						}
					>
						<span>
							<Checkbox
								size="small"
								checked={isAllGroupSelected}
								indeterminate={isSomeGroupSelected}
								disabled={group.eligibleCalfIds.length === 0}
								onChange={() => onToggleGroup(group.eligibleCalfIds)}
								sx={{ p: 0.5 }}
							/>
						</span>
					</Tooltip>

					{/* Expand/Collapse Toggle Button with canonical rotation animation */}
					<Tooltip title={isExpanded ? 'Colapsar Lote' : 'Expandir Lote'}>
						<IconButton
							size="small"
							onClick={() => setIsExpanded((prev) => !prev)}
							sx={{
								color: 'text.secondary',
								height: 28,
								width: 28,
								transition: 'transform 0.2s ease',
								transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
							}}
						>
							<FuseSvgIcon size={18}>heroicons-outline:chevron-down</FuseSvgIcon>
						</IconButton>
					</Tooltip>
				</Stack>
			</Stack>

			{/* Internal Batch Table */}
			<Collapse
				in={isExpanded}
				timeout="auto"
				unmountOnExit
			>
				<TableContainer>
					<Table
						stickyHeader
						size="small"
						sx={{ borderCollapse: 'collapse', minWidth: 650 }}
					>
						<TableHead>
							<TableRow>
								<TableCell sx={{ ...headerCellStyle, width: 44, textAlign: 'center', p: 0.5 }}>
									<Checkbox
										size="small"
										checked={isAllGroupSelected}
										indeterminate={isSomeGroupSelected}
										disabled={group.eligibleCalfIds.length === 0}
										onChange={() => onToggleGroup(group.eligibleCalfIds)}
										sx={{ p: 0.5 }}
									/>
								</TableCell>
								<TableCell sx={{ ...headerCellStyle, width: 44, textAlign: 'center' }}>#</TableCell>
								<TableCell sx={{ ...headerCellStyle, minWidth: 140 }}>Caravana Madre</TableCell>
								<TableCell sx={{ ...headerCellStyle, minWidth: 120 }}>Fecha del Parto</TableCell>
								<TableCell sx={{ ...headerCellStyle, minWidth: 140 }}>Caravana Cría</TableCell>
								<TableCell sx={{ ...headerCellStyle, minWidth: 80 }}>Sexo</TableCell>
								<TableCell sx={{ ...headerCellStyle, minWidth: 150 }}>Estado Lactancia</TableCell>
								<TableCell sx={{ ...headerCellStyle, minWidth: 160 }}>Observaciones</TableCell>
								<TableCell sx={{ ...headerCellStyle, minWidth: 130, borderRight: 0, textAlign: 'right' }}>
									Acciones
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{group.records.length === 0 ? (
								<TableRow>
									<TableCell colSpan={9} sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
										No hay partos registrados en este lote.
									</TableCell>
								</TableRow>
							) : (
								paginatedRecords.map((record, index) => (
									<BirthTableRow
										key={record.gestation_id}
										record={record}
										isSelected={selectedCalfIds.includes(record.calf_id)}
										indexNumber={page * rowsPerPage + index + 1}
										showBatchColumn={false}
										onToggleSelect={onToggleSelect}
										onWean={onWean}
									/>
								))
							)}
						</TableBody>
					</Table>
				</TableContainer>

				{group.records.length > rowsPerPage && (
					<TablePagination
						component="div"
						count={group.records.length}
						page={page}
						onPageChange={(_, newPage) => setPage(newPage)}
						rowsPerPage={rowsPerPage}
						rowsPerPageOptions={[]}
						labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
						sx={{ borderTop: 1, borderColor: 'divider' }}
					/>
				)}
			</Collapse>
		</Paper>
	);
};

export default BirthsBatchGroupCard;
