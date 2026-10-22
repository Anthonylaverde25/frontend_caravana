import React, { useState } from 'react';
import { Box, Button, Checkbox, Chip, IconButton, Paper, Stack, Typography, alpha, useTheme } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { BirthHistoryRecord } from '@/features/gestation/hooks/useBirthHistory';
import { AtFootBatchGroup, isWeaningCode } from './birthsTypes';
import AtFootCalvesTable from './AtFootCalvesTable';
import AtFootOrderBand from './AtFootOrderBand';

interface BirthsBatchGroupCardProps {
	group: AtFootBatchGroup;
	defaultExpanded?: boolean;
	selected: Set<number>;
	onToggle: (calfId: number) => void;
	onSetMany: (calfIds: number[], on: boolean) => void;
	onOpenOrder: (orderId: number) => void;
	onRegisterWeaned: (orderId: number, calfIds: number[]) => void;
	onExecute: (orderId: number) => void;
	onTagCalves: (batch: { id: number; name: string }) => void;
}

const averageWeight = (records: BirthHistoryRecord[]): string => {
	const weights = records.map((r) => r.calf_weight).filter((w): w is number => w != null);

	return weights.length > 0 ? `${Math.round(weights.reduce((sum, w) => sum + w, 0) / weights.length)} kg` : '—';
};

/**
 * One batch of calves at foot: its header with the counts of all its calves, then the free ones and
 * one band per open order holding some of them, each with its own rows.
 */
export const BirthsBatchGroupCard: React.FC<BirthsBatchGroupCardProps> = ({
	group,
	defaultExpanded = true,
	selected,
	onToggle,
	onSetMany,
	onOpenOrder,
	onRegisterWeaned,
	onExecute,
	onTagCalves
}) => {
	const theme = useTheme();
	const isDark = theme.palette.mode === 'dark';
	const green = isDark ? '#4ade80' : '#2d6a4f';
	const [isExpanded, setIsExpanded] = useState(defaultExpanded);

	const males = group.all.filter((r) => r.calf_sex === 'M').length;
	const females = group.all.filter((r) => r.calf_sex === 'H').length;
	const freeCount = group.all.filter((r) => !r.open_order_code).length;
	const committed = group.all.filter((r) => r.open_order_code);
	const orderCount = new Set(committed.map((r) => r.open_order_code)).size;
	const untagged = group.all.filter((r) => !r.calf_is_tagged).length;

	const selectableFree = group.free.filter((r) => r.calf_is_tagged).map((r) => r.calf_id);
	const freeSelected = selectableFree.filter((id) => selected.has(id)).length;

	return (
		<Paper elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: '8px', overflow: 'hidden', bgcolor: 'background.paper' }}>
			<Stack
				direction="row"
				alignItems="center"
				spacing={1.5}
				flexWrap="wrap"
				useFlexGap
				sx={{
					px: 1.75,
					py: 1.5,
					bgcolor: alpha(green, isDark ? 0.12 : 0.06),
					borderBottom: isExpanded ? '2px solid' : 0,
					borderColor: alpha(green, 0.3)
				}}
			>
				<IconButton
					size="small"
					onClick={() => setIsExpanded((value) => !value)}
					aria-label={`${isExpanded ? 'Contraer' : 'Expandir'} ${group.batchName}`}
					aria-expanded={isExpanded}
					sx={{ borderRadius: '6px', bgcolor: isExpanded ? 'action.selected' : 'transparent' }}
				>
					<FuseSvgIcon size={18}>{isExpanded ? 'heroicons-outline:chevron-down' : 'heroicons-outline:chevron-right'}</FuseSvgIcon>
				</IconButton>
				<Box sx={{ flex: 1, minWidth: 220 }}>
					<Typography sx={{ fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.2 }}>{group.batchName}</Typography>
					<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
						{group.all.length} al pie &nbsp;|&nbsp; ♂ {males} · ♀ {females} &nbsp;|&nbsp; Peso prom. {averageWeight(group.all)}
					</Typography>
				</Box>
				{untagged > 0 && (
					<>
						<Chip size="small" color="warning" variant="outlined" label={`${untagged} sin caravana`} sx={{ fontWeight: 700 }} />
						{group.batchId != null && (
							<Button
								size="small"
								variant="outlined"
								onClick={() => onTagCalves({ id: group.batchId as number, name: group.batchName })}
								sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '6px', height: 30, bgcolor: 'background.paper' }}
							>
								Caravanear crías
							</Button>
						)}
					</>
				)}
				<Chip size="small" variant="outlined" label={`${freeCount} sin orden`} sx={{ fontWeight: 700, bgcolor: 'background.paper' }} />
				{committed.length > 0 && (
					<Chip
						size="small"
						color="info"
						variant="outlined"
						label={`${committed.length} en ${orderCount} ${orderCount === 1 ? 'orden' : 'órdenes'}`}
						sx={{ fontWeight: 700, bgcolor: 'background.paper' }}
					/>
				)}
			</Stack>

			{isExpanded && (
				<>
					{group.free.length > 0 && (
						<>
							<Stack
								direction="row"
								alignItems="center"
								spacing={1.25}
								sx={{ px: 1.5, py: 0.75, bgcolor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#eef2ef', borderBottom: 1, borderColor: 'divider' }}
							>
								<Checkbox
									size="small"
									checked={selectableFree.length > 0 && freeSelected === selectableFree.length}
									indeterminate={freeSelected > 0 && freeSelected < selectableFree.length}
									disabled={selectableFree.length === 0}
									onChange={() => onSetMany(selectableFree, freeSelected < selectableFree.length)}
									inputProps={{ 'aria-label': `Elegir las crías sin orden de ${group.batchName}` }}
									sx={{ p: 0.5 }}
								/>
								<Typography sx={{ fontWeight: 800, fontSize: '0.85rem' }}>Sin orden</Typography>
								<Typography variant="caption" color="text.secondary">
									{group.free.length} crías · se pueden ordenar o registrar como destetadas
								</Typography>
							</Stack>
							<AtFootCalvesTable records={group.free} selected={selected} onToggle={onToggle} label="sin orden" />
						</>
					)}

					{group.orders.map((section) => {
						const ids = section.records.filter((r) => r.calf_is_tagged).map((r) => r.calf_id);
						const selectedIds = ids.filter((id) => selected.has(id));
						const order = section.order;

						return (
							<React.Fragment key={section.code}>
								<AtFootOrderBand
									section={section}
									selectedCount={selectedIds.length}
									onToggleAll={() => onSetMany(ids, selectedIds.length < ids.length)}
									onOpenOrder={onOpenOrder}
									onRegisterWeaned={() => order && onRegisterWeaned(order.id, selectedIds.length > 0 ? selectedIds : ids)}
									onExecute={() => order && onExecute(order.id)}
								/>
								{isWeaningCode(section.code) && (
									<AtFootCalvesTable records={section.records} selected={selected} onToggle={onToggle} label="de la orden" />
								)}
							</React.Fragment>
						);
					})}
				</>
			)}
		</Paper>
	);
};

export default BirthsBatchGroupCard;
