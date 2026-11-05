import React from 'react';
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
	Box,
	IconButton,
	Tooltip,
	Chip
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useNavigate } from 'react-router';
import { OperationalCategoryKey, OperationalOrderItem } from '../../../types/operationalKpis.types';
import { formatNumber } from '../../../theme/formatters';

export interface DisplayOrderItem extends OperationalOrderItem {
	categoryKey: OperationalCategoryKey;
	categoryTitle: string;
	templateCode: string;
	color: string;
}

interface OperationalOrdersTableProps {
	items: DisplayOrderItem[];
}

export function OperationalOrdersTable({ items }: OperationalOrdersTableProps) {
	const navigate = useNavigate();

	const getRouteForCategory = (key: OperationalCategoryKey, id: number) => {
		switch (key) {
			case 'entry_orders':
				return `/entry-orders`;
			case 'transfer_orders':
				return `/transfer-orders`;
			case 'weaning_orders':
				return `/weaning-orders`;
			case 'birth_orders':
				return `/birth-orders`;
		}
	};

	if (items.length === 0) {
		return (
			<Box sx={{ py: 6, textAlign: 'center' }}>
				<FuseSvgIcon size={32} sx={{ color: 'text.disabled', mb: 1 }}>
					heroicons-outline:check-circle
				</FuseSvgIcon>
				<Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.secondary' }}>
					No hay órdenes pendientes en esta categoría
				</Typography>
				<Typography sx={{ fontSize: '0.75rem', color: 'text.disabled' }}>
					Todas las tareas programadas se encuentran ejecutadas o cerradas.
				</Typography>
			</Box>
		);
	}

	return (
		<TableContainer sx={{ maxHeight: 380 }}>
			<Table size="small" stickyHeader>
				<TableHead>
					<TableRow sx={{ '& th': { fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary', bgcolor: 'background.paper' } }}>
						<TableCell>Código</TableCell>
						<TableCell>Tipo</TableCell>
						<TableCell>Destino / Proveedor</TableCell>
						<TableCell align="right">Cabezas</TableCell>
						<TableCell>Fecha</TableCell>
						<TableCell>Estado</TableCell>
						<TableCell align="center">Acción</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{items.map((item) => {
						const detail =
							item.provider_name ??
							item.batch_name ??
							item.target_batch_name ??
							(item.weaning_type ? `Destete ${item.weaning_type}` : 'Establecimiento');

						const route = getRouteForCategory(item.categoryKey, item.id);

						return (
							<TableRow
								key={`${item.categoryKey}_${item.id}`}
								hover
								sx={{ '& td': { fontSize: '0.8125rem' } }}
							>
								<TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>
									{item.code}
								</TableCell>
								<TableCell>
									<Chip
										size="small"
										label={item.templateCode}
										sx={{
											height: 20,
											fontSize: '0.6875rem',
											fontWeight: 700,
											bgcolor: `${item.color}15`,
											color: item.color,
											border: `1px solid ${item.color}40`
										}}
									/>
								</TableCell>
								<TableCell sx={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
									{detail}
								</TableCell>
								<TableCell align="right" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
									{formatNumber(item.planned_heads)}
								</TableCell>
								<TableCell sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
									{item.date || '—'}
								</TableCell>
								<TableCell>
									<Chip
										size="small"
										label={item.status_label || item.status}
										variant="outlined"
										sx={{ height: 20, fontSize: '0.6875rem', fontWeight: 600 }}
									/>
								</TableCell>
								<TableCell align="center">
									<Tooltip title="Abrir y gestionar orden" arrow>
										<IconButton
											size="small"
											onClick={() => navigate(route)}
											sx={{ color: 'primary.main' }}
										>
											<FuseSvgIcon size={18}>heroicons-outline:arrow-top-right-on-square</FuseSvgIcon>
										</IconButton>
									</Tooltip>
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</TableContainer>
	);
}
