import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { BatchAlert, BatchAlertSeverity } from '@/core/batches/domain/entities/BatchOverview';
import SanitaryExposureAlertDialog from '@/ui/gestation/components/sanitary-exposure/SanitaryExposureAlertDialog';
import HerdBatchSection from './summary/HerdBatchSection';
import { orderLink } from '../../utils/herdFormat';

interface HerdBatchNoveltiesTabProps {
	alerts: BatchAlert[];
}

const SEVERITY: Record<BatchAlertSeverity, { icon: string; color: string; label: string }> = {
	error: { icon: 'heroicons-outline:exclamation-circle', color: 'error.main', label: 'Crítica' },
	warning: { icon: 'heroicons-outline:exclamation-triangle', color: 'warning.dark', label: 'Advertencia' },
	info: { icon: 'heroicons-outline:information-circle', color: 'info.main', label: 'Informativa' }
};

/**
 * Dedicated "Novedades" Tab for the batch:
 * Displays active batch alerts, sanitaries, overdue tasks and incidents with direct action links.
 */
export function HerdBatchNoveltiesTab({ alerts = [] }: HerdBatchNoveltiesTabProps) {
	const navigate = useNavigate();
	const [exposureAlertId, setExposureAlertId] = useState<number | null>(null);

	const errorCount = alerts.filter((a) => a.severity === 'error').length;
	const warningCount = alerts.filter((a) => a.severity === 'warning').length;

	return (
		<Box sx={{ flex: 1, bgcolor: 'background.paper' }}>
			<HerdBatchSection
				title="Novedades y alertas del lote"
				actions={
					alerts.length > 0 ? (
						<Stack direction="row" spacing={1.5} alignItems="center">
							{errorCount > 0 && (
								<Typography variant="caption" sx={{ color: 'error.main', fontWeight: 700 }}>
									{errorCount} {errorCount === 1 ? 'crítica' : 'críticas'}
								</Typography>
							)}
							{warningCount > 0 && (
								<Typography variant="caption" sx={{ color: 'warning.dark', fontWeight: 700 }}>
									{warningCount} {warningCount === 1 ? 'advertencia' : 'advertencias'}
								</Typography>
							)}
							<Typography variant="caption" sx={{ color: 'text.secondary' }}>
								{`${alerts.length} pendiente${alerts.length > 1 ? 's' : ''}`}
							</Typography>
						</Stack>
					) : null
				}
			>
				{alerts.length === 0 ? (
					<Paper
						elevation={0}
						sx={{
							p: 6,
							py: 8,
							borderRadius: '8px',
							border: '1px dashed',
							borderColor: 'divider',
							textAlign: 'center',
							bgcolor: 'background.default'
						}}
					>
						<Stack spacing={2} alignItems="center" justifyContent="center">
							<Box
								sx={{
									p: 2,
									bgcolor: 'action.hover',
									color: 'success.main',
									borderRadius: '50%',
									display: 'flex'
								}}
							>
								<FuseSvgIcon size={40}>heroicons-outline:check-circle</FuseSvgIcon>
							</Box>
							<Stack spacing={0.5} maxWidth={460}>
								<Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1.05rem' }}>
									Sin novedades pendientes en este lote
								</Typography>
								<Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
									Todos los eventos sanitarios, reproductivos, movimientos y pesajes se encuentran al día. Cuando surja un desvío o aviso que requiera atención, aparecerá listado aquí.
								</Typography>
							</Stack>
						</Stack>
					</Paper>
				) : (
					<Stack spacing={1.5}>
						{alerts.map((alert, index) => {
							const isExposure = alert.link?.kind === 'sanitary_exposure_alert';
							const target = alert.link && !isExposure ? orderLink(alert.link.kind, alert.link.id) : null;
							const open = isExposure
								? () => setExposureAlertId(alert.link!.id)
								: target
									? () => navigate(target)
									: null;
							const severity = SEVERITY[alert.severity];

							return (
								<Paper
									key={`${alert.type}-${alert.link?.id ?? index}`}
									elevation={0}
									sx={{
										p: 2,
										borderRadius: '8px',
										border: 1,
										borderColor: 'divider',
										borderLeft: '4px solid',
										borderLeftColor: severity.color,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'space-between',
										gap: 2
									}}
								>
									<Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
										<FuseSvgIcon size={20} sx={{ color: severity.color, flexShrink: 0 }}>
											{severity.icon}
										</FuseSvgIcon>
										<Box sx={{ minWidth: 0 }}>
											<Typography sx={{ fontSize: '0.88rem', fontWeight: 600, color: 'text.primary' }}>
												{alert.message}
											</Typography>
											<Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
												{severity.label} · Tipo: {alert.type}
											</Typography>
										</Box>
									</Stack>
									{open && (
										<Button
											size="small"
											variant="outlined"
											onClick={open}
											sx={{
												borderRadius: '6px',
												fontWeight: 700,
												textTransform: 'none',
												whiteSpace: 'nowrap',
												flexShrink: 0
											}}
										>
											{alert.link?.code ?? 'Ver detalle'}
										</Button>
									)}
								</Paper>
							);
						})}
					</Stack>
				)}

				<SanitaryExposureAlertDialog
					alertId={exposureAlertId}
					onClose={() => setExposureAlertId(null)}
				/>
			</HerdBatchSection>
		</Box>
	);
}

export default HerdBatchNoveltiesTab;
