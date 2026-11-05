import React, { useMemo } from 'react';
import { Alert, Stack, Typography } from '@mui/material';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';
import { findRiskyMatings } from '../inbreedingRisk';
import { LotFemales } from '../lotFemales';
import { SelectedBatchState } from '../types';

const SHOWN = 5;

interface ServiceOrderInbreedingNoticeProps {
	lots: SelectedBatchState[];
	bullsByBatch: Record<number, number[]>;
	femalesByBatch: Map<number, LotFemales>;
	caravans: Caravan[];
}

/**
 * The risky crosses of the order, before it is confirmed. It warns and does not stop: the operator
 * knows the herd, and with animals without recorded parents the system cannot see every kinship.
 */
export const ServiceOrderInbreedingNotice: React.FC<ServiceOrderInbreedingNoticeProps> = ({
	lots,
	bullsByBatch,
	femalesByBatch,
	caravans
}) => {
	const risky = useMemo(
		() => findRiskyMatings(lots, bullsByBatch, femalesByBatch, caravans),
		[lots, bullsByBatch, femalesByBatch, caravans]
	);

	if (risky.length === 0) return null;

	return (
		<Alert
			severity="warning"
			sx={{ borderRadius: '6px', fontSize: '0.8rem', py: 0.5 }}
		>
			<Typography
				variant="body2"
				sx={{ fontSize: '0.8rem', fontWeight: 700 }}
			>
				{risky.length === 1
					? '1 vientre con riesgo de consanguinidad'
					: `${risky.length} vientres con riesgo de consanguinidad`}
			</Typography>
			<Stack sx={{ my: 0.5 }}>
				{risky.slice(0, SHOWN).map((mating) => (
					<span key={`${mating.batchName}-${mating.femaleTag}`}>
						{mating.femaleTag} × {mating.bullTag} · Fx {mating.fx}%{' '}
						{mating.risk === 'CRITICAL' ? '(crítico)' : '(alto)'} · {mating.batchName}
					</span>
				))}
				{risky.length > SHOWN && <span>y {risky.length - SHOWN} más.</span>}
			</Stack>
			Se puede confirmar igual. Para evitarlo, volvé y cambiá el toro o dejá esos vientres afuera con Parcial.
		</Alert>
	);
};

export default ServiceOrderInbreedingNotice;
