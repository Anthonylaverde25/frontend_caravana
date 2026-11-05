import React from 'react';
import { Box, Stack, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import type { Batch } from '@/core/batches/domain/entities/Batch';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';
import SheetGrid from '@/components/sheet-grid/SheetGrid';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';
import { Consequence, Fact } from '@/ui/weaning-orders/components/confirm/WeaningOrderConfirmSummary';
import { LotFemales } from '../lotFemales';
import { formatShortDay, isFutureDay } from '../orderSheetDates';
import { lotFemaleCount } from '../orderSheetPayload';
import { OrderSheetDetails } from '../useOrderSheetDetails';
import { BullStayRow, OrderSheetMode, SelectedBatchState, ServiceMethodType } from '../types';
import ServiceOrderInbreedingNotice from './ServiceOrderInbreedingNotice';

export interface ServiceOrderConfirmSummaryProps {
	mode: OrderSheetMode;
	type: ServiceMethodType;
	lots: SelectedBatchState[];
	batches: Batch[];
	allCaravans: Caravan[];
	femalesByBatch: Map<number, LotFemales>;
	details: OrderSheetDetails;
}

/** Read-only: what each batch gets, and what will happen once it is confirmed. */
export const ServiceOrderConfirmSummary: React.FC<ServiceOrderConfirmSummaryProps> = ({
	mode,
	type,
	lots,
	batches,
	allCaravans,
	femalesByBatch,
	details
}) => {
	const { headSx, textCellSx, zebraBg } = useGridCellStyles();
	const nameOf = (id: number | '') => batches.find((batch) => batch.id === id)?.name ?? '—';
	const tagOf = (id: number) => allCaravans.find((caravan) => caravan.id === id)?.identification ?? `#${id}`;
	const registering = mode === 'register';
	const isAi = type === 'AI';
	const planned = !registering && isFutureDay(details.startDate);
	const totalFemales = lots.reduce((sum, lot) => sum + lotFemaleCount(lot, femalesByBatch.get(lot.batchId)), 0);

	const stayLine = (row: BullStayRow) => {
		const stays = row.location?.moved_after || row.location?.current_batch_id === row.destinationBatchId;
		const today = stays ? 'su lote actual no cambia' : `pasa a figurar en ${nameOf(row.destinationBatchId)}`;
		return `${row.tag}: de ${nameOf(row.originBatchId)} (${formatShortDay(row.joinedAt)}) a ${nameOf(row.destinationBatchId)} (${formatShortDay(row.retiredAt)}), ${today}`;
	};

	const servedBy = (lot: SelectedBatchState) => {
		if (isAi) {
			const withSemen = lot.selectedCaravanIds.filter((id) => details.plannedSemen[id]).length;
			return registering
				? 'Las inseminaciones se cargan después'
				: withSemen > 0
					? `${withSemen} con semen previsto`
					: 'Semen a decidir en la manga';
		}

		if (registering) return (details.staysByBatch[lot.batchId] ?? []).map(stayLine).join(' · ');

		return (details.bullsByBatch[lot.batchId] ?? []).map(tagOf).join(', ');
	};

	return (
		<Stack spacing={2.5}>
			<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
				<Fact
					label="Modalidad"
					value={isAi ? 'Inseminación' : 'Tradicional'}
				/>
				<Fact
					label="Órdenes"
					value={`${lots.length} · ${totalFemales} vientre(s)`}
				/>
				<Fact
					label={registering || isAi ? 'Fecha' : 'Período'}
					value={
						registering || !isAi
							? `${formatShortDay(details.startDate)} al ${details.endDate ? formatShortDay(details.endDate) : '—'}`
							: formatShortDay(details.startDate)
					}
				/>
			</Box>

			<SheetGrid minWidth={500}>
				<TableHead>
					<TableRow>
						<TableCell sx={{ ...headSx, width: 170 }}>Lote</TableCell>
						<TableCell sx={{ ...headSx, width: 80 }}>Vientres</TableCell>
						<TableCell sx={headSx}>
							{isAi ? 'Semen' : registering ? 'Recorrido de los toros' : 'Toros'}
						</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{lots.map((lot, index) => (
						<TableRow
							key={lot.batchId}
							sx={{ bgcolor: index % 2 === 1 ? zebraBg : 'transparent' }}
						>
							<TableCell sx={{ ...textCellSx, fontWeight: 700 }}>{lot.batchName}</TableCell>
							<TableCell sx={textCellSx}>
								{lotFemaleCount(lot, femalesByBatch.get(lot.batchId))}
							</TableCell>
							<TableCell sx={{ ...textCellSx, height: 'auto', py: 1 }}>{servedBy(lot)}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</SheetGrid>

			{/* What already happened cannot be avoided, and semen has no bull in the pedigree here. */}
			{!registering && !isAi && (
				<ServiceOrderInbreedingNotice
					lots={lots}
					bullsByBatch={details.bullsByBatch}
					femalesByBatch={femalesByBatch}
					caravans={allCaravans}
				/>
			)}

			<Box sx={{ p: 1.5, borderRadius: '6px', bgcolor: 'action.hover' }}>
				<Typography
					variant="caption"
					color="text.secondary"
					sx={{ fontWeight: 700, display: 'block', mb: 1 }}
				>
					Qué va a pasar
				</Typography>
				<Stack spacing={0.75}>
					{registering && (
						<Consequence icon="heroicons-outline:check-badge">
							{lots.length === 1
								? 'Se registra 1 orden ya terminada'
								: `Se registran ${lots.length} órdenes ya terminadas`}
							, del {formatShortDay(details.startDate)} al {formatShortDay(details.endDate)}. El tacto se
							carga después en la bandeja.
						</Consequence>
					)}
					{planned && (
						<Consequence icon="heroicons-outline:calendar">
							{lots.length === 1
								? 'Queda 1 orden planificada'
								: `Quedan ${lots.length} órdenes planificadas`}{' '}
							para el {formatShortDay(details.startDate)}. No se mueve ningún animal.
						</Consequence>
					)}
					{!registering && !planned && (
						<Consequence icon="heroicons-outline:play">
							{lots.length === 1 ? 'Empieza 1 servicio' : `Empiezan ${lots.length} servicios`} el{' '}
							{formatShortDay(details.startDate)}.
						</Consequence>
					)}
					{!registering && !planned && !isAi && (
						<Consequence icon="heroicons-outline:arrows-right-left">
							Los toros pasan a cada lote.
						</Consequence>
					)}
					{!registering && !planned && isAi && lots.length === 1 && (
						<Consequence icon="heroicons-outline:document-text">
							Sigue la carga de las inseminaciones de la orden.
						</Consequence>
					)}
				</Stack>
			</Box>

			{details.observations.trim() !== '' && (
				<Typography
					variant="body2"
					color="text.secondary"
				>
					{details.observations.trim()}
				</Typography>
			)}
		</Stack>
	);
};

export default ServiceOrderConfirmSummary;
