import React from 'react';
import { Box, Paper, Stack, Typography, useTheme, alpha } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { PendingLabMetrics } from './types';

export type MetricFilterType = 'ALL' | 'IN_SITU' | 'DERIVED' | 'OVERDUE';

interface MetricCardItem {
	id: MetricFilterType;
	title: string;
	value: number;
	subtitle: string;
	icon: string;
	color: string;
	bgColor: string;
	highlight?: boolean;
}

interface PendingLabProtocolsMetricsProps {
	metrics: PendingLabMetrics;
	onSelectFilter?: (filterType: MetricFilterType) => void;
	activeFilter?: MetricFilterType;
}

export const PendingLabProtocolsMetrics: React.FC<PendingLabProtocolsMetricsProps> = ({
	metrics,
	onSelectFilter,
	activeFilter = 'ALL'
}) => {
	const theme = useTheme();
	const isDark = theme.palette.mode === 'dark';

	const cards: MetricCardItem[] = [
		{
			id: 'ALL',
			title: 'Protocolos en Espera',
			value: metrics.totalProtocols,
			subtitle: `${metrics.totalPendingSamples} muestras en análisis`,
			icon: 'heroicons-outline:document-text',
			color: theme.palette.primary.main,
			bgColor: isDark ? alpha(theme.palette.primary.main, 0.12) : alpha(theme.palette.primary.main, 0.08)
		},
		{
			id: 'IN_SITU',
			title: 'Procesamiento In Situ',
			value: metrics.inSituCount,
			subtitle: 'Laboratorio de campo / propio',
			icon: 'heroicons-outline:home-modern',
			color: isDark ? '#38bdf8' : '#0284c7',
			bgColor: isDark ? alpha('#38bdf8', 0.12) : alpha('#0284c7', 0.08)
		},
		{
			id: 'DERIVED',
			title: 'Derivación Externa',
			value: metrics.derivedCount,
			subtitle: 'Enviados a centro externo',
			icon: 'heroicons-outline:truck',
			color: isDark ? '#a78bfa' : '#7c3aed',
			bgColor: isDark ? alpha('#a78bfa', 0.12) : alpha('#7c3aed', 0.08)
		},
		{
			id: 'OVERDUE',
			title: 'Demorados (+14 días)',
			value: metrics.overdueCount,
			subtitle: metrics.overdueCount > 0 ? 'Requiere reclamo urgente' : 'Dentro de ventana normal',
			icon: 'heroicons-outline:clock',
			color: metrics.overdueCount > 0 ? (isDark ? '#f87171' : '#dc2626') : isDark ? '#34d399' : '#15803d',
			bgColor:
				metrics.overdueCount > 0
					? isDark
						? alpha('#f87171', 0.12)
						: alpha('#dc2626', 0.08)
					: isDark
						? alpha('#34d399', 0.12)
						: alpha('#15803d', 0.08),
			highlight: metrics.overdueCount > 0
		}
	];

	return (
		<Box
			sx={{
				display: 'grid',
				gridTemplateColumns: {
					xs: '1fr',
					sm: 'repeat(2, 1fr)',
					lg: 'repeat(4, 1fr)'
				},
				gap: 1.5,
				p: 2
			}}
		>
			{cards.map((card) => {
				const isSelected = activeFilter === card.id;

				return (
					<Paper
						key={card.id}
						elevation={0}
						onClick={() => onSelectFilter?.(card.id)}
						sx={{
							p: 1.75,
							borderRadius: '8px',
							border: '1px solid',
							borderColor: isSelected
								? card.color
								: card.highlight
									? alpha(card.color, 0.4)
									: theme.palette.divider,
							bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#ffffff',
							cursor: onSelectFilter ? 'pointer' : 'default',
							transition: 'all 0.15s ease-in-out',
							boxShadow: isSelected ? `0 0 0 1px ${card.color}` : 'none',
							'&:hover': {
								bgcolor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
								borderColor: card.color
							}
						}}
					>
						<Stack
							direction="row"
							spacing={1.5}
							alignItems="center"
						>
							<Box
								sx={{
									width: 40,
									height: 40,
									borderRadius: '8px',
									bgcolor: card.bgColor,
									color: card.color,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									flexShrink: 0
								}}
							>
								<FuseSvgIcon size={20}>{card.icon}</FuseSvgIcon>
							</Box>

							<Box sx={{ minWidth: 0, flex: 1 }}>
								<Typography
									variant="caption"
									noWrap
									sx={{
										fontSize: '0.68rem',
										fontWeight: 700,
										textTransform: 'uppercase',
										letterSpacing: '0.03em',
										color: 'text.secondary',
										display: 'block'
									}}
								>
									{card.title}
								</Typography>
								<Typography
									variant="h6"
									sx={{
										fontWeight: 800,
										fontSize: '1.25rem',
										color: card.highlight ? card.color : 'text.primary',
										lineHeight: 1.1,
										my: 0.25
									}}
								>
									{card.value}
								</Typography>
								<Typography
									variant="caption"
									noWrap
									sx={{
										fontSize: '0.68rem',
										color: card.highlight ? card.color : 'text.secondary',
										fontWeight: card.highlight ? 600 : 500,
										display: 'block'
									}}
								>
									{card.subtitle}
								</Typography>
							</Box>
						</Stack>
					</Paper>
				);
			})}
		</Box>
	);
};

export default PendingLabProtocolsMetrics;
