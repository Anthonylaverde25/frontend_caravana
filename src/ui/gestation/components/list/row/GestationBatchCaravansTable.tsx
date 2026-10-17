import { useNavigate } from 'react-router';
import {
	Box,
	Button,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
	useTheme
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { Caravan } from '@/core/caravans/domain/entities/Caravan';
import type { CaravanSummary } from '@/core/caravans/domain/entities/CaravanSummary';
import { registerBirthsPath } from '@/ui/birth-orders/components/register/registerBirths';
import { herdBatchPath, UNASSIGNED_BATCH } from '@/ui/herd/utils/herdFormat';
import GestationBatchCaravanRow from './GestationBatchCaravanRow';

interface GestationBatchCaravansTableProps {
	batchId: number | typeof UNASSIGNED_BATCH;
	caravans: Caravan[];
	highlightId?: number | null;
	onViewCaravan: (caravan: CaravanSummary) => void;
	onEditCaravan: (caravan: CaravanSummary) => void;
	onWeighCaravan: (caravan: CaravanSummary) => void;
}

/**
 * Table of gestating females inside an expanded batch row, styled after HerdCaravanTable
 * and HerdBatchRecentCaravans.
 */
export function GestationBatchCaravansTable({
	batchId,
	caravans,
	highlightId,
	onViewCaravan,
	onEditCaravan,
	onWeighCaravan
}: GestationBatchCaravansTableProps) {
	const navigate = useNavigate();
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

	const numericBatchId = typeof batchId === 'number' ? batchId : null;

	return (
		<Box>
			<TableContainer>
				<Table
					size="small"
					sx={{ borderCollapse: 'collapse' }}
				>
					<TableHead>
						<TableRow>
							<TableCell sx={{ ...headerCellStyle, minWidth: 130 }}>Caravana</TableCell>
							<TableCell sx={{ ...headerCellStyle, minWidth: 120 }}>Categoría</TableCell>
							<TableCell
								sx={{ ...headerCellStyle, minWidth: 120, textAlign: 'center' }}
								align="center"
							>
								Estadio Preñez
							</TableCell>
							<TableCell
								sx={{ ...headerCellStyle, minWidth: 135, textAlign: 'center' }}
								align="center"
							>
								Parto Estimado (FPP)
							</TableCell>
							<TableCell
								sx={{ ...headerCellStyle, minWidth: 95, textAlign: 'right' }}
								align="right"
							>
								Restante
							</TableCell>
							<TableCell sx={{ ...headerCellStyle, minWidth: 210 }}>Alertas / Antecedentes</TableCell>
							<TableCell sx={{ ...headerCellStyle, minWidth: 130 }}>Riesgo</TableCell>
							<TableCell
								sx={{ ...headerCellStyle, minWidth: 105, borderRight: 0, textAlign: 'right' }}
								align="right"
							>
								Acciones
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{caravans.map((caravan, index) => {
							const highlighted = caravan.id === highlightId;
							const rowBg = highlighted
								? isDark
									? 'rgba(99, 102, 241, 0.22)'
									: '#e0e7ff'
								: index % 2 === 1
									? zebraBg
									: 'inherit';

							return (
								<GestationBatchCaravanRow
									key={caravan.id}
									caravan={caravan}
									rowBg={rowBg}
									cellSx={bodyCellStyle}
									onView={onViewCaravan}
									onEdit={onEditCaravan}
									onWeigh={onWeighCaravan}
								/>
							);
						})}
					</TableBody>
				</Table>
			</TableContainer>

			<Box
				sx={{
					display: 'flex',
					flexWrap: 'wrap',
					gap: 1,
					justifyContent: 'space-between',
					alignItems: 'center',
					pl: 2,
					pr: 1.5,
					py: 0.75
				}}
			>
				<Typography
					variant="caption"
					sx={{ color: 'text.secondary' }}
				>
					{`${caravans.length.toLocaleString('es-AR')} ${caravans.length === 1 ? 'vientre gestante' : 'vientres gestantes'} en este lote`}
				</Typography>
				<Stack
					direction="row"
					spacing={1}
					alignItems="center"
					flexWrap="wrap"
					useFlexGap
				>
					{numericBatchId !== null && (
						<Button
							size="small"
							variant="outlined"
							startIcon={<FuseSvgIcon size={15}>heroicons-outline:clipboard-document-list</FuseSvgIcon>}
							onClick={() => navigate(`/birth-orders/new?batchId=${numericBatchId}`)}
							sx={{ fontWeight: 600, textTransform: 'none', borderRadius: '6px', py: 0.25 }}
						>
							Nueva Orden de Parición
						</Button>
					)}
					{numericBatchId !== null && (
						<Button
							size="small"
							variant="contained"
							color="primary"
							startIcon={<FuseSvgIcon size={15}>heroicons-outline:plus-circle</FuseSvgIcon>}
							onClick={() => navigate(registerBirthsPath(numericBatchId))}
							sx={{
								fontWeight: 700,
								textTransform: 'none',
								borderRadius: '6px',
								py: 0.25,
								boxShadow: 'none'
							}}
						>
							Registrar Partos
						</Button>
					)}
					<Button
						size="small"
						onClick={() => navigate(herdBatchPath(batchId))}
						endIcon={<FuseSvgIcon size={16}>heroicons-outline:arrow-right</FuseSvgIcon>}
						sx={{ fontWeight: 700, textTransform: 'none' }}
					>
						Abrir lote
					</Button>
				</Stack>
			</Box>
		</Box>
	);
}

export default GestationBatchCaravansTable;
