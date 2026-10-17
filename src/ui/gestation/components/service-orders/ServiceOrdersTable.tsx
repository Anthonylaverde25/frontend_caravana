import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
	useTheme
} from '@mui/material';
import type { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import ServiceOrdersTableRow from './ServiceOrdersTableRow';

interface ServiceOrdersTableProps {
	orders: ServiceOrder[];
	batchMap: Map<number, string>;
	onView: (order: ServiceOrder) => void;
	onPrint: (order: ServiceOrder) => void;
	onShareWhatsApp: (order: ServiceOrder) => void;
	onApprove: (id: number) => void;
	onReject: (id: number) => void;
	onOpenInTray: (order: ServiceOrder) => void;
	isTransitioning: boolean;
}

export function ServiceOrdersTable({
	orders,
	batchMap,
	onView,
	onPrint,
	onShareWhatsApp,
	onApprove,
	onReject,
	onOpenInTray,
	isTransitioning
}: ServiceOrdersTableProps) {
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

	const getBatchName = (order: ServiceOrder) =>
		order.batch_name || batchMap.get(order.batch_id) || `Lote #${order.batch_id}`;

	if (orders.length === 0) {
		return (
			<Typography
				color="text.secondary"
				sx={{ p: 4, textAlign: 'center', fontSize: '0.85rem' }}
			>
				No se encontraron órdenes de servicio con los filtros seleccionados.
			</Typography>
		);
	}

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
					{orders.map((order, index) => {
						const rowBg = index % 2 === 1 ? zebraBg : 'inherit';

						return (
							<ServiceOrdersTableRow
								key={order.id}
								order={order}
								batchName={getBatchName(order)}
								rowBg={rowBg}
								cellSx={bodyCellStyle}
								onView={onView}
								onPrint={onPrint}
								onShareWhatsApp={onShareWhatsApp}
								onApprove={onApprove}
								onReject={onReject}
								onOpenInTray={onOpenInTray}
								isTransitioning={isTransitioning}
							/>
						);
					})}
				</TableBody>
			</Table>
		</TableContainer>
	);
}

export default ServiceOrdersTable;
