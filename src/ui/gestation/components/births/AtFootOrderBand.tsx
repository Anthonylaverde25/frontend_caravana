import React from 'react';
import { useNavigate } from 'react-router';
import { Box, Button, Checkbox, Chip, IconButton, Stack, Tooltip, Typography, alpha, useTheme } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import TransferOrderStatusChip from '@/ui/transfer-orders/components/TransferOrderStatusChip';
import { destinationsOf, sheetUrl } from '@/ui/weaning-orders/components/weaningOrderFormat';
import { type AtFootOrderSection, isWeaningCode } from './birthsTypes';

interface AtFootOrderBandProps {
	section: AtFootOrderSection;
	selectedCount: number;
	onToggleAll: () => void;
	onOpenOrder: (orderId: number) => void;
	onRegisterWeaned: () => void;
	onExecute: () => void;
}

const daysSince = (iso: string): number =>
	Math.floor((Date.now() - new Date(`${iso.slice(0, 10)}T00:00:00`).getTime()) / 86400000);

/**
 * The band of an open order inside a batch: what it is, how late it runs, and the two ways to wean
 * with it from here — some of its calves ("Registrar destetadas") or all of them ("Ejecutar orden").
 * A transfer order only names itself: its calves move with it, elsewhere.
 */
export const AtFootOrderBand: React.FC<AtFootOrderBandProps> = ({
	section,
	selectedCount,
	onToggleAll,
	onOpenOrder,
	onRegisterWeaned,
	onExecute
}) => {
	const theme = useTheme();
	const navigate = useNavigate();
	const { order, records } = section;
	const blue = theme.palette.mode === 'dark' ? '#60a5fa' : '#0d47a1';
	const late = order ? daysSince(order.weaning_date) : 0;
	const total = order?.pending_head_count ?? records.length;

	return (
		<Stack
			direction="row"
			alignItems="center"
			flexWrap="wrap"
			useFlexGap
			spacing={1.25}
			sx={{
				px: 1.5,
				py: 1,
				borderTop: 1,
				borderBottom: 1,
				borderColor: 'divider',
				borderLeft: '4px solid',
				borderLeftColor: blue,
				bgcolor: alpha(blue, theme.palette.mode === 'dark' ? 0.12 : 0.04)
			}}
		>
			{order && (
				<Checkbox
					size="small"
					checked={selectedCount > 0 && selectedCount === records.length}
					indeterminate={selectedCount > 0 && selectedCount < records.length}
					onChange={onToggleAll}
					inputProps={{ 'aria-label': `Elegir las crías de ${section.code} en este lote` }}
					sx={{ p: 0.5 }}
				/>
			)}
			<Typography
				component={order ? 'button' : 'span'}
				onClick={order ? () => onOpenOrder(order.id) : undefined}
				sx={{
					fontFamily: 'monospace',
					fontWeight: 800,
					fontSize: '0.85rem',
					color: blue,
					border: 0,
					bgcolor: 'transparent',
					p: 0,
					cursor: order ? 'pointer' : 'default',
					'&:hover': order ? { textDecoration: 'underline' } : undefined
				}}
			>
				{section.code}
			</Typography>

			{order ? (
				<>
					<TransferOrderStatusChip status={order.status} />
					{late > 0 && (
						<Chip
							size="small"
							color="warning"
							variant="outlined"
							icon={<FuseSvgIcon size={14}>heroicons-outline:exclamation-triangle</FuseSvgIcon>}
							label={`Planificada ${order.weaning_date.slice(0, 10).split('-').reverse().slice(0, 2).join('/')} · hace ${late} d`}
							sx={{ fontWeight: 700, height: 22 }}
						/>
					)}
					<Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
						{records.length === total ? `${total} crías` : `${records.length} de sus ${total} crías pendientes en este lote`} · destino{' '}
						<Box component="strong" sx={{ color: 'text.primary' }}>
							{destinationsOf(order)}
						</Box>
						{order.weaning_type_label ? ` · ${order.weaning_type_label}` : ''}
					</Typography>
				</>
			) : (
				<>
					<Chip
						size="small"
						variant="outlined"
						label={isWeaningCode(section.code) ? 'Orden de destete' : 'Orden de transferencia'}
						sx={{ fontWeight: 700, height: 22 }}
					/>
					<Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
						{records.length} cría(s) {isWeaningCode(section.code) ? 'en la orden' : 'se mueven con esa orden'}
					</Typography>
				</>
			)}

			<Box sx={{ flex: 1 }} />

			{order && (
				<Stack direction="row" spacing={1} alignItems="center">
					<Tooltip title="Planilla DEST-01">
						<IconButton
							size="small"
							aria-label={`Planilla de ${order.code}`}
							onClick={() => navigate(sheetUrl(order.id))}
							sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '6px', p: 0.5, bgcolor: 'background.paper' }}
						>
							<FuseSvgIcon size={16}>heroicons-outline:document-text</FuseSvgIcon>
						</IconButton>
					</Tooltip>
					<Button
						size="small"
						variant="outlined"
						onClick={onRegisterWeaned}
						sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '6px', height: 30, bgcolor: 'background.paper' }}
					>
						Registrar destetadas{selectedCount > 0 ? ` (${selectedCount})` : ''}
					</Button>
					<Button
						size="small"
						variant="contained"
						disableElevation
						onClick={onExecute}
						sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '6px', height: 30 }}
					>
						Ejecutar orden
					</Button>
				</Stack>
			)}
		</Stack>
	);
};

export default AtFootOrderBand;
