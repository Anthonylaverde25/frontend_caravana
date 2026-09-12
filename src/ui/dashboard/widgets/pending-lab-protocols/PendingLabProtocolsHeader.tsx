import React from 'react';
import { Box, Typography, Stack, Chip, Button, IconButton, Tooltip, useTheme, alpha } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useNavigate } from 'react-router';
import { PendingLabMetrics } from './types';

interface PendingLabProtocolsHeaderProps {
	metrics: PendingLabMetrics;
	isExpanded: boolean;
	onToggleExpand: () => void;
}

export const PendingLabProtocolsHeader: React.FC<PendingLabProtocolsHeaderProps> = ({
	metrics,
	isExpanded,
	onToggleExpand
}) => {
	const theme = useTheme();
	const isDark = theme.palette.mode === 'dark';
	const navigate = useNavigate();

	const hasOverdue = metrics.overdueCount > 0;

	return (
		<Box
			sx={{
				px: 3,
				py: 2,
				background: hasOverdue
					? isDark
						? 'rgba(220, 38, 38, 0.08)'
						: 'rgba(220, 38, 38, 0.04)'
					: isDark
						? 'rgba(2, 132, 199, 0.08)'
						: 'rgba(2, 132, 199, 0.04)',
				borderBottom: '1px solid',
				borderColor: theme.palette.divider,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				flexWrap: 'wrap',
				gap: 1.5
			}}
		>
			{/* Title & Icon */}
			<Stack
				direction="row"
				spacing={1.5}
				alignItems="center"
			>
				<Box
					sx={{
						width: 38,
						height: 38,
						borderRadius: '8px',
						bgcolor: hasOverdue
							? alpha(theme.palette.error.main, 0.12)
							: alpha(theme.palette.primary.main, 0.12),
						color: hasOverdue ? 'error.main' : 'primary.main',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						flexShrink: 0
					}}
				>
					<FuseSvgIcon size={22}>heroicons-outline:beaker</FuseSvgIcon>
				</Box>

				<Box>
					<Typography
						variant="subtitle1"
						sx={{
							fontWeight: 800,
							color: 'text.primary',
							fontSize: '0.95rem',
							lineHeight: 1.2
						}}
					>
						Protocolos de Laboratorio en Espera de Resultado
					</Typography>
					<Typography
						variant="caption"
						sx={{ color: 'text.secondary', fontSize: '0.74rem' }}
					>
						Muestras de torada en proceso analítico — pendientes de informe y cierre sanitario
					</Typography>
				</Box>
			</Stack>

			{/* Badges & Actions */}
			<Stack
				direction="row"
				spacing={1}
				alignItems="center"
			>
				<Chip
					label={`${metrics.totalProtocols} protocolo${metrics.totalProtocols !== 1 ? 's' : ''}`}
					size="small"
					sx={{
						fontWeight: 700,
						bgcolor: alpha(theme.palette.primary.main, 0.1),
						color: 'primary.main',
						fontSize: '0.74rem',
						height: 24
					}}
				/>

				<Chip
					label={`${metrics.totalPendingSamples} tubo${metrics.totalPendingSamples !== 1 ? 's' : ''}`}
					size="small"
					sx={{
						fontWeight: 700,
						bgcolor: alpha(theme.palette.info.main, 0.1),
						color: 'info.dark',
						fontSize: '0.74rem',
						height: 24
					}}
				/>

				{hasOverdue && (
					<Tooltip title="Protocolos con más de 14 días esperando resultado de laboratorio">
						<Chip
							label={`${metrics.overdueCount} demorado${metrics.overdueCount !== 1 ? 's' : ''}`}
							size="small"
							sx={{
								fontWeight: 700,
								bgcolor: alpha(theme.palette.error.main, 0.12),
								color: 'error.main',
								fontSize: '0.74rem',
								height: 24
							}}
						/>
					</Tooltip>
				)}

				<Button
					size="small"
					variant="outlined"
					onClick={() => navigate('/gestation/diagnostic-protocols')}
					startIcon={<FuseSvgIcon size={14}>heroicons-outline:document-magnifying-glass</FuseSvgIcon>}
					sx={{
						textTransform: 'none',
						fontSize: '0.74rem',
						fontWeight: 700,
						borderRadius: '6px',
						px: 1.5,
						py: 0.5,
						borderColor: theme.palette.divider,
						color: 'text.primary',
						'&:hover': {
							borderColor: 'primary.main',
							bgcolor: alpha(theme.palette.primary.main, 0.04),
							color: 'primary.main'
						}
					}}
				>
					Ver Módulo
				</Button>

				<Tooltip title={isExpanded ? 'Plegar listado' : 'Desplegar listado'}>
					<IconButton
						size="small"
						onClick={onToggleExpand}
						sx={{
							color: 'text.secondary',
							border: '1px solid',
							borderColor: theme.palette.divider,
							borderRadius: '6px',
							p: 0.6,
							'&:hover': {
								bgcolor: 'action.hover',
								borderColor: 'text.primary'
							}
						}}
					>
						<FuseSvgIcon size={18}>
							{isExpanded ? 'heroicons-outline:chevron-up' : 'heroicons-outline:chevron-down'}
						</FuseSvgIcon>
					</IconButton>
				</Tooltip>
			</Stack>
		</Box>
	);
};

export default PendingLabProtocolsHeader;
