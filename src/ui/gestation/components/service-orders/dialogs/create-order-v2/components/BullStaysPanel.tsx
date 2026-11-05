import React, { useMemo, useState } from 'react';
import { Alert, Autocomplete, Stack, TextField, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import type { Batch } from '@/core/batches/domain/entities/Batch';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';
import { isBreedingCandidate } from '@/core/caravans/domain/rules/isBreedingCandidate';
import { isSelectable, resolveSireAdmission } from '@/core/caravans/domain/rules/resolveSireAdmission';
import { usePreServiceBulls } from '@/features/gestation/hooks/usePreServiceBulls';
import { fetchBullLocation } from '@/features/gestation/hooks/useServiceOrderIssuance';
import { filledInputProps } from '@/ui/weaning-orders/components/form/formStyles';
import { isMale } from '../lotFemales';
import { OrderSheetDetails } from '../useOrderSheetDetails';
import { BullStayRow, SelectedBatchState } from '../types';
import BullStaysGrid from './BullStaysGrid';
import LotTabs from './LotTabs';

interface BullStaysPanelProps {
	lots: SelectedBatchState[];
	batches: Batch[];
	allCaravans: Caravan[];
	details: OrderSheetDetails;
}

/** The trip of each bull through the service: what the system never learned, on its real days. */
export const BullStaysPanel: React.FC<BullStaysPanelProps> = ({ lots, batches, allCaravans, details }) => {
	const { enqueueSnackbar } = useSnackbar();
	const { data: bullHealth = [] } = usePreServiceBulls();
	const [activeId, setActiveId] = useState(lots[0]?.batchId ?? 0);
	const active = lots.find((lot) => lot.batchId === activeId) ?? lots[0];
	const rows = active ? (details.staysByBatch[active.batchId] ?? []) : [];

	const males = useMemo(() => allCaravans.filter((c) => isMale(c) && isBreedingCandidate(c)), [allCaravans]);
	const options = males.filter((male) => !rows.some((row) => row.maleId === male.id));

	if (!active) {
		return (
			<Alert
				severity="info"
				sx={{ fontSize: '0.8rem', py: 0.5 }}
			>
				Marcá un lote de cría para indicar qué toros estuvieron.
			</Alert>
		);
	}

	const addBull = async (bull: Caravan) => {
		try {
			const location = await fetchBullLocation(bull.id!, details.startDate, details.endDate);
			details.addStay(active.batchId, bull.id!, bull.identification, location);
		} catch {
			enqueueSnackbar('No se pudo leer dónde estaba el toro: indicalo a mano.', { variant: 'warning' });
			details.addStay(active.batchId, bull.id!, bull.identification, null);
		}
	};

	/** What deserves a look and does not block: the state of today does not rule over the past. */
	const warningOf = (row: BullStayRow): string | undefined => {
		const bull = males.find((male) => male.id === row.maleId);
		const health = bullHealth.find((item) => item.caravan_id === row.maleId);
		const notes: string[] = [];

		if (bull && !isSelectable(resolveSireAdmission(bull, health)))
			notes.push('Hoy no está apto para servicio; se registra igual porque el hecho ya ocurrió.');

		if (row.location?.batch_id && row.originBatchId !== '' && row.originBatchId !== row.location.batch_id) {
			const name = batches.find((batch) => batch.id === row.location?.batch_id)?.name ?? 'otro lote';
			notes.push(`Según sus movimientos estaba en ${name}.`);
		}

		if (row.location?.moved_after) notes.push('Tiene movimientos posteriores: su lote actual no cambia.');

		return notes.length > 0 ? notes.join(' ') : undefined;
	};

	const lotHasError = (batchId: number) => {
		const index = lots.findIndex((lot) => lot.batchId === batchId);

		return Object.keys(details.errors).some((field) => field.startsWith(`lots.${index}.bulls`));
	};

	return (
		<Stack spacing={1.5}>
			<Typography
				variant="caption"
				sx={{ color: 'text.secondary' }}
			>
				Por cada toro queda el movimiento de entrada al lote y el de salida, con sus fechas reales. Se precarga
				lo que dicen sus movimientos.
			</Typography>
			{lots.length > 1 && (
				<LotTabs
					lots={lots}
					value={active.batchId}
					onChange={setActiveId}
					flagged={(id) => (details.staysByBatch[id] ?? []).length === 0 || lotHasError(id)}
				/>
			)}
			<Autocomplete<Caravan>
				key={`${active.batchId}-${rows.length}`}
				options={options}
				getOptionLabel={(option) => option.identification}
				onChange={(_, bull) => bull && addBull(bull)}
				sx={{ maxWidth: 360 }}
				renderInput={(params) => (
					<TextField
						{...params}
						variant="filled"
						label="Agregar toro"
						InputProps={{ ...params.InputProps, ...filledInputProps }}
					/>
				)}
			/>
			<BullStaysGrid
				rows={rows}
				batches={batches}
				batchId={active.batchId}
				lotIndex={lots.indexOf(active)}
				errors={details.errors}
				warningOf={warningOf}
				onChange={(maleId, change) => details.updateStay(active.batchId, maleId, change)}
				onRemove={(maleId) => details.removeStay(active.batchId, maleId)}
			/>
		</Stack>
	);
};

export default BullStaysPanel;
