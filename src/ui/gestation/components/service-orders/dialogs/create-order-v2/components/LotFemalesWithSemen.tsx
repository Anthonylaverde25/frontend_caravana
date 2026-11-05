import React, { useMemo } from 'react';
import { Alert, Stack } from '@mui/material';
import { useSemenOptions } from '@/features/semen/hooks/useSemenOptions';
import SemenCoverageAlert from '@/ui/semen/components/coverage/SemenCoverageAlert';
import { OrderSheetDetails } from '../useOrderSheetDetails';
import { SelectedBatchState } from '../types';
import LotFemalesSelector, { LotFemalesSelectorProps } from './LotFemalesSelector';
import LotSemenAssignBar from './LotSemenAssignBar';

interface LotFemalesWithSemenProps extends Omit<LotFemalesSelectorProps, 'toolbar' | 'semen'> {
	lots: SelectedBatchState[];
	details: OrderSheetDetails;
}

/** The selector of an AI order: each picked female may take its planned semen right on her row. */
export const LotFemalesWithSemen: React.FC<LotFemalesWithSemenProps> = ({ lots, details, ...selector }) => {
	const semen = useSemenOptions();

	const plannedStraws = useMemo(() => {
		const straws: Record<number, number> = {};
		lots.flatMap((lot) => lot.selectedCaravanIds).forEach((id) => {
			const itemId = details.plannedSemen[id];

			if (itemId) straws[itemId] = (straws[itemId] ?? 0) + 1;
		});
		return straws;
	}, [lots, details.plannedSemen]);

	return (
		<LotFemalesSelector
			{...selector}
			semen={{
				options: semen.options,
				valueOf: (id) => details.plannedSemen[id] ?? null,
				onChange: (id, itemId) => details.planSemen([id], itemId)
			}}
			toolbar={
				<Stack spacing={1}>
					{semen.options.length === 0 && !semen.isLoading && (
						<Alert
							severity="info"
							sx={{ fontSize: '0.8rem', py: 0.5 }}
						>
							Todavía no hay semen cargado en stock.
						</Alert>
					)}
					{lots.length > 0 && (
						<LotSemenAssignBar
							lots={lots}
							options={semen.options}
							plannedStraws={plannedStraws}
							onAssign={details.planSemen}
						/>
					)}
					<SemenCoverageAlert
						straws={plannedStraws}
						byId={semen.byId}
					/>
				</Stack>
			}
		/>
	);
};

export default LotFemalesWithSemen;
