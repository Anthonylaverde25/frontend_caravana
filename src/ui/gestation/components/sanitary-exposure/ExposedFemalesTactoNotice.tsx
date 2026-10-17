import { useMemo, useState } from 'react';
import { Alert, Button, Stack } from '@mui/material';
import { useOpenExposuresForFemales, useReviewExposedFemales } from '@/features/gestation/hooks/useSanitaryExposureAlerts';
import SanitaryExposureAlertDialog from './SanitaryExposureAlertDialog';

interface ExposedFemalesTactoNoticeProps {
	femaleIds: number[];
}

/**
 * Pregnancy check of females that served with a bull found positive to a contagious pathogen.
 * Nothing is blocked: the operator checks them as usual and marks them as reviewed.
 */
function ExposedFemalesTactoNotice({ femaleIds }: ExposedFemalesTactoNoticeProps) {
	const { data: exposures = {} } = useOpenExposuresForFemales(femaleIds);
	const review = useReviewExposedFemales();
	const [openAlertId, setOpenAlertId] = useState<number | null>(null);

	// Pending females grouped by alert, so each alert gets one review call.
	const pendingByAlert = useMemo(() => {
		const map = new Map<number, number[]>();
		Object.entries(exposures).forEach(([femaleId, list]) =>
			list.filter((e) => !e.reviewed).forEach((e) => map.set(e.alert_id, [...(map.get(e.alert_id) ?? []), Number(femaleId)]))
		);
		return map;
	}, [exposures]);

	const exposedCount = Object.keys(exposures).length;
	if (exposedCount === 0) return null;

	const pendingCount = new Set(Array.from(pendingByAlert.values()).flat()).size;
	const firstAlertId = Object.values(exposures)[0]?.[0]?.alert_id ?? null;

	const handleReviewAll = () =>
		pendingByAlert.forEach((ids, alertId) => review.mutate({ alertId, femaleIds: ids, note: 'Revisada en el tacto' }));

	return (
		<>
			<Alert
				severity={pendingCount > 0 ? 'error' : 'info'}
				sx={{ fontSize: '0.82rem', alignItems: 'center', mb: 2 }}
				action={
					<Stack direction="row" spacing={1}>
						{firstAlertId !== null && (
							<Button size="small" color="inherit" onClick={() => setOpenAlertId(firstAlertId)} sx={{ textTransform: 'none', fontWeight: 700 }}>
								Ver novedad
							</Button>
						)}
						{pendingCount > 0 && (
							<Button size="small" color="inherit" variant="outlined" onClick={handleReviewAll} disabled={review.isPending} sx={{ textTransform: 'none', fontWeight: 700 }}>
								Marcar {pendingCount} como revisadas
							</Button>
						)}
					</Stack>
				}
			>
				{exposedCount === 1 ? '1 vientre de este tacto estuvo' : `${exposedCount} vientres de este tacto estuvieron`} en servicio con un toro
				positivo a una enfermedad contagiosa.{pendingCount > 0 ? ` ${pendingCount} sin revisar.` : ' Todos revisados.'}
			</Alert>
			<SanitaryExposureAlertDialog alertId={openAlertId} onClose={() => setOpenAlertId(null)} />
		</>
	);
}

export default ExposedFemalesTactoNotice;
