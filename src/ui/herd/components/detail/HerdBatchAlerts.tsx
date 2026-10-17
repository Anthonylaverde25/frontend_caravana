import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Alert, Button, Paper, Stack, Typography } from '@mui/material';
import type { BatchAlert } from '@/core/batches/domain/entities/BatchOverview';
import SanitaryExposureAlertDialog from '@/ui/gestation/components/sanitary-exposure/SanitaryExposureAlertDialog';
import { orderLink } from '../../utils/herdFormat';

interface HerdBatchAlertsProps {
	alerts: BatchAlert[];
}

/**
 * What needs attention in the batch, most serious first (the server sorts them). Each alert opens
 * the document that explains it.
 */
export function HerdBatchAlerts({ alerts }: HerdBatchAlertsProps) {
	const navigate = useNavigate();
	// A sanitary exposure is not an order: it opens its own dialog in place.
	const [exposureAlertId, setExposureAlertId] = useState<number | null>(null);

	return (
		<Paper
			elevation={0}
			sx={{ p: 2, borderRadius: '8px', border: 1, borderColor: 'divider', height: '100%' }}
		>
			<Typography
				variant="subtitle2"
				sx={{ fontWeight: 800, mb: 1.5 }}
			>
				Novedades
			</Typography>
			{alerts.length === 0 ? (
				<Alert
					severity="success"
					sx={{ fontSize: '0.8rem', py: 0.5 }}
				>
					Sin novedades pendientes en este lote.
				</Alert>
			) : (
				<Stack spacing={1}>
					{alerts.map((alert, index) => {
						const isExposure = alert.link?.kind === 'sanitary_exposure_alert';
						const target = alert.link && !isExposure ? orderLink(alert.link.kind, alert.link.id) : null;
						const open = isExposure ? () => setExposureAlertId(alert.link!.id) : target ? () => navigate(target) : null;

						return (
							<Alert
								key={`${alert.type}-${alert.link?.id ?? index}`}
								severity={alert.severity}
								sx={{ fontSize: '0.8rem', py: 0.25, alignItems: 'center' }}
								action={
									open ? (
										<Button
											size="small"
											color="inherit"
											onClick={open}
											sx={{ fontWeight: 700, textTransform: 'none', whiteSpace: 'nowrap' }}
										>
											{alert.link?.code ?? 'Ver'}
										</Button>
									) : undefined
								}
							>
								{alert.message}
							</Alert>
						);
					})}
				</Stack>
			)}
			<SanitaryExposureAlertDialog alertId={exposureAlertId} onClose={() => setExposureAlertId(null)} />
		</Paper>
	);
}

export default HerdBatchAlerts;
