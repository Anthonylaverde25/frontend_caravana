import React from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useNavigate } from 'react-router';
import { useCriticalAlerts } from '../../hooks/useCriticalAlerts';
import { StackedBar } from '../primitives/StackedBar';
import { formatNumber } from '../../theme/formatters';

import { BoardWidgetInstance, WidgetRenderProps, getEffectiveDimensions } from '../../types/dashboard.types';

export interface CriticalAlertsAsideProps {
	className?: string;
	instance?: BoardWidgetInstance;
}

/**
 * Minimalist executive aside component for system alerts and operational updates.
 * Adopts the exact same design language and tokens as KpiCard.
 * Functions both as an embedded dashboard widget (movable & resizable) and as a standalone aside.
 */
export function CriticalAlertsAside({ className, instance }: CriticalAlertsAsideProps) {
	const navigate = useNavigate();
	const { alerts, hasAlerts, isLoading } = useCriticalAlerts();

	if (isLoading && alerts.length === 0) {
		return null;
	}

	const { colSpan } = instance ? getEffectiveDimensions(instance) : { colSpan: 2 };

	const errorCount = alerts.filter((a) => a.severity === 'error').length;
	const warningCount = alerts.filter((a) => a.severity === 'warning').length;
	const infoCount = alerts.filter((a) => a.severity === 'info').length;

	const segments = [
		{ label: 'Crítico', value: errorCount, color: '#EF4444' },
		{ label: 'Advertencia', value: warningCount, color: '#F59E0B' },
		{ label: 'Informativo', value: infoCount, color: '#3B82F6' }
	].filter((s) => s.value > 0);

	const toneColor = errorCount > 0 ? 'error.main' : warningCount > 0 ? 'warning.main' : 'primary.main';

	return (
		<Paper
			elevation={0}
			component="aside"
			aria-label="Centro de Atención y Novedades"
			className={className}
			sx={{
				height: '100%',
				p: { xs: 2, sm: 2.25 },
				display: 'flex',
				flexDirection: 'column',
				gap: 1.25,
				border: 1,
				borderColor: 'divider',
				borderRadius: '10px',
				bgcolor: 'background.paper',
				transition: 'all 160ms ease-in-out',
				'&:hover': {
					borderColor: 'divider',
					boxShadow: (theme) =>
						theme.palette.mode === 'dark'
							? '0 4px 16px rgba(0,0,0,0.28)'
							: '0 4px 14px rgba(0,0,0,0.03)'
				}
			}}
		>
			{/* Header with Title and Status Badge */}
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
				<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.875 }}>
					<Box
						sx={{
							width: 24,
							height: 24,
							borderRadius: '6px',
							bgcolor: hasAlerts
								? (theme) => (theme.palette.mode === 'dark' ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.08)')
								: (theme) => (theme.palette.mode === 'dark' ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.08)'),
							color: hasAlerts ? 'warning.main' : 'success.main',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							flexShrink: 0
						}}
					>
						<FuseSvgIcon size={14}>
							{hasAlerts ? 'heroicons-outline:bell-alert' : 'heroicons-outline:check-circle'}
						</FuseSvgIcon>
					</Box>
					<Typography
						sx={{
							fontSize: '0.78125rem',
							fontWeight: 600,
							letterSpacing: '-0.01em',
							color: 'text.secondary',
							lineHeight: 1.2
						}}
					>
						Centro de Atención y Novedades
					</Typography>
				</Box>

				<Box
					sx={{
						fontSize: '0.6875rem',
						fontWeight: 600,
						color: hasAlerts ? toneColor : 'success.main',
						bgcolor: hasAlerts
							? (theme) =>
									errorCount > 0
										? theme.palette.mode === 'dark'
											? 'rgba(239,68,68,0.15)'
											: 'rgba(239,68,68,0.08)'
										: theme.palette.mode === 'dark'
											? 'rgba(245,158,11,0.15)'
											: 'rgba(245,158,11,0.08)'
							: (theme) => (theme.palette.mode === 'dark' ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.08)'),
						px: 0.875,
						py: 0.25,
						borderRadius: '4px',
						display: 'inline-flex',
						alignItems: 'center',
						gap: 0.5
					}}
				>
					<Box
						sx={{
							width: 5,
							height: 5,
							borderRadius: '50%',
							bgcolor: hasAlerts ? toneColor : 'success.main'
						}}
					/>
					{hasAlerts ? `${alerts.length} ${alerts.length === 1 ? 'novedad' : 'novedades'}` : 'Al día'}
				</Box>
			</Box>

			{/* Large Metric Row */}
			<Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
				<Typography
					sx={{
						fontSize: { xs: '1.75rem', sm: '2rem' },
						fontWeight: 700,
						letterSpacing: '-0.03em',
						lineHeight: 1.1,
						fontVariantNumeric: 'tabular-nums',
						color: hasAlerts ? 'text.primary' : 'success.main'
					}}
				>
					{formatNumber(alerts.length)}
				</Typography>
				<Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: 'text.secondary' }}>
					{hasAlerts
						? alerts.length === 1
							? 'asunto requiere atención'
							: 'asuntos requieren atención'
						: 'pendientes · Rodeo y operaciones al día'}
				</Typography>
			</Box>

			{/* Micro-track visual bar (4px) */}
			{hasAlerts ? (
				<StackedBar height={4} showLegend={false} segments={segments} />
			) : (
				<Box
					sx={{
						height: 4,
						borderRadius: 999,
						bgcolor: (theme) =>
							theme.palette.mode === 'dark' ? 'rgba(16,185,129,0.3)' : 'rgba(16,185,129,0.2)'
					}}
				/>
			)}

			{/* Novelty Feed */}
			<Box
				sx={{
					display: 'grid',
					gridTemplateColumns: {
						xs: '1fr',
						sm: colSpan >= 3 ? 'repeat(2, minmax(0, 1fr))' : '1fr',
						lg: colSpan === 4 ? 'repeat(2, minmax(0, 1fr))' : '1fr'
					},
					gap: 1,
					pt: 0.25,
					flex: 1
				}}
			>
				{hasAlerts ? (
					alerts.map((alert, idx) => {
						const dotColor =
							alert.severity === 'error'
								? '#EF4444'
								: alert.severity === 'warning'
									? '#F59E0B'
									: '#3B82F6';

						return (
							<Box
								key={alert.id}
								sx={{
									display: 'flex',
									alignItems: 'flex-start',
									justifyContent: 'space-between',
									gap: 1.25,
									py: 0.875,
									px: 1,
									borderRadius: '6px',
									transition: 'background-color 140ms ease-in-out',
									'&:hover': {
										bgcolor: (theme) =>
											theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'
									},
									borderTop: colSpan >= 3 ? 'none' : idx > 0 ? '1px solid' : 'none',
									border: colSpan >= 3 ? 1 : undefined,
									borderColor: (theme) =>
										theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
								}}
							>
								<Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flex: 1, minWidth: 0 }}>
									<Box
										sx={{
											width: 6,
											height: 6,
											borderRadius: '50%',
											bgcolor: dotColor,
											mt: 0.625,
											flexShrink: 0
										}}
									/>
									<Box sx={{ flex: 1, minWidth: 0 }}>
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
											<Typography
												sx={{
													fontSize: '0.78125rem',
													fontWeight: 600,
													color: 'text.primary',
													lineHeight: 1.3
												}}
											>
												{alert.title}
											</Typography>
											<Box
												sx={{
													fontSize: '0.65625rem',
													fontWeight: 600,
													color: 'text.secondary',
													bgcolor: (theme) =>
														theme.palette.mode === 'dark'
															? 'rgba(255,255,255,0.06)'
															: 'rgba(0,0,0,0.04)',
													px: 0.625,
													py: 0.125,
													borderRadius: '3px',
													fontVariantNumeric: 'tabular-nums'
												}}
											>
												{alert.countText}
											</Box>
										</Box>
										<Typography
											sx={{
												fontSize: '0.71875rem',
												color: 'text.secondary',
												mt: 0.25,
												lineHeight: 1.35
											}}
										>
											{alert.description}
										</Typography>
									</Box>
								</Box>

								<Button
									size="small"
									variant="text"
									onClick={() => navigate(alert.actionUrl)}
									endIcon={<FuseSvgIcon size={12}>heroicons-outline:arrow-right</FuseSvgIcon>}
									sx={{
										textTransform: 'none',
										fontSize: '0.71875rem',
										fontWeight: 600,
										py: 0.25,
										px: 0.75,
										minWidth: 'auto',
										flexShrink: 0,
										color: 'primary.main',
										'&:hover': {
											bgcolor: (theme) =>
												theme.palette.mode === 'dark'
													? 'rgba(37,99,235,0.12)'
													: 'rgba(37,99,235,0.08)'
										}
									}}
								>
									{alert.actionLabel}
								</Button>
							</Box>
						);
					})
				) : (
					<Box sx={{ py: 1.5, px: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
						<Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'success.main', flexShrink: 0 }} />
						<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', lineHeight: 1.4 }}>
							Sin demoras en guías DTe, protocolos de laboratorio o hacienda sin asignar a lotes.
						</Typography>
					</Box>
				)}
			</Box>

			{/* Footnote */}
			<Box
				sx={{
					mt: 'auto',
					pt: 1,
					borderTop: '1px solid',
					borderColor: (theme) =>
						theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
					fontSize: '0.6875rem',
					color: 'text.secondary',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					gap: 1
				}}
			>
				<span>Manga, laboratorio y SENASA</span>
				<span>Actualizado en tiempo real</span>
			</Box>
		</Paper>
	);
}

/**
 * First-class Dashboard Widget wrapper for CriticalAlertsAside.
 * Enables direct dragging (desplazar), resizing (ajustar), and removal in edit mode.
 */
export function CriticalAlertsWidget({ instance }: WidgetRenderProps) {
	return <CriticalAlertsAside instance={instance} />;
}

export default CriticalAlertsAside;

