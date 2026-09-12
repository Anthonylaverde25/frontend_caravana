import React from 'react';
import { Box, Typography, Stack, Chip, Button, Tooltip, useTheme, alpha } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useNavigate } from 'react-router';
import { PendingProtocolItem, LabUrgencyLevel } from './types';

interface PendingLabProtocolRowProps {
	item: PendingProtocolItem;
}

function UrgencyChip({ urgency, days }: { urgency: LabUrgencyLevel; days: number }) {
	if (urgency === 'OVERDUE') {
		return (
			<Chip
				size="small"
				icon={<FuseSvgIcon size={12}>heroicons-outline:exclamation-triangle</FuseSvgIcon>}
				label={`${days}d — DEMORADO`}
				sx={{
					bgcolor: '#fee2e2',
					color: '#b91c1c',
					fontWeight: 700,
					fontSize: '0.66rem',
					height: 22,
					borderRadius: '4px'
				}}
			/>
		);
	}

	if (urgency === 'ATTENTION') {
		return (
			<Chip
				size="small"
				icon={<FuseSvgIcon size={12}>heroicons-outline:clock</FuseSvgIcon>}
				label={`${days}d — EN PLAZO`}
				sx={{
					bgcolor: '#ffedd5',
					color: '#c2410c',
					fontWeight: 700,
					fontSize: '0.66rem',
					height: 22,
					borderRadius: '4px'
				}}
			/>
		);
	}

	return (
		<Chip
			size="small"
			icon={<FuseSvgIcon size={12}>heroicons-outline:check-circle</FuseSvgIcon>}
			label={`${days}d — RECIENTE`}
			sx={{
				bgcolor: '#f0fdf4',
				color: '#15803d',
				fontWeight: 700,
				fontSize: '0.66rem',
				height: 22,
				borderRadius: '4px'
			}}
		/>
	);
}

export const PendingLabProtocolRow: React.FC<PendingLabProtocolRowProps> = ({ item }) => {
	const theme = useTheme();
	const isDark = theme.palette.mode === 'dark';
	const navigate = useNavigate();

	const { protocol, daysWaiting, urgency, pendingSamples, isDerived, destinationLabel, veterinarianDisplay } = item;

	const handleNavigateToProtocols = () => {
		navigate('/gestation/diagnostic-protocols');
	};

	const isExtractionAct = protocol.protocol_type === 'EXTRACTION_ACT';

	return (
		<Box
			sx={{
				display: 'grid',
				gridTemplateColumns: {
					xs: '1fr',
					sm: '1.4fr 1.2fr 1fr auto'
				},
				gap: 1.5,
				alignItems: 'center',
				px: 2,
				py: 1.25,
				borderRadius: '6px',
				border: '1px solid',
				borderColor: urgency === 'OVERDUE' ? alpha(theme.palette.error.main, 0.25) : theme.palette.divider,
				bgcolor: isDark ? 'rgba(255, 255, 255, 0.015)' : '#fafafa',
				transition: 'all 0.15s ease',
				'&:hover': {
					bgcolor: isDark ? 'rgba(255, 255, 255, 0.035)' : '#f3f4f6',
					borderColor: urgency === 'OVERDUE' ? theme.palette.error.main : theme.palette.primary.main
				}
			}}
		>
			{/* 1. Protocol Identifier & Document Type */}
			<Stack
				spacing={0.5}
				alignItems="flex-start"
			>
				<Stack
					direction="row"
					spacing={1}
					alignItems="center"
				>
					<Typography
						sx={{
							fontFamily: 'monospace',
							fontWeight: 700,
							color: 'text.primary',
							fontSize: '0.85rem',
							letterSpacing: '0.02em'
						}}
					>
						{protocol.protocol_number}
					</Typography>

					<Chip
						size="small"
						label={isExtractionAct ? 'Acta Manga' : 'Protocolo'}
						sx={{
							height: 18,
							fontSize: '0.62rem',
							fontWeight: 700,
							bgcolor: isExtractionAct
								? alpha(theme.palette.primary.main, 0.1)
								: alpha(theme.palette.info.main, 0.1),
							color: isExtractionAct ? 'primary.main' : 'info.main',
							borderRadius: '3px'
						}}
					/>
				</Stack>

				<Stack
					direction="row"
					spacing={1}
					alignItems="center"
				>
					<Typography
						variant="caption"
						sx={{ color: 'text.secondary', fontSize: '0.72rem' }}
					>
						Muestreo: {protocol.sample_date}
					</Typography>
					<UrgencyChip
						urgency={urgency}
						days={daysWaiting}
					/>
				</Stack>
			</Stack>

			{/* 2. Professional and Center */}
			<Stack spacing={0.25}>
				<Typography
					variant="body2"
					noWrap
					sx={{
						fontWeight: 600,
						fontSize: '0.78rem',
						color: 'text.primary'
					}}
				>
					{veterinarianDisplay}
				</Typography>

				<Tooltip title={destinationLabel}>
					<Chip
						size="small"
						icon={
							<FuseSvgIcon size={12}>
								{isDerived ? 'heroicons-outline:truck' : 'heroicons-outline:home-modern'}
							</FuseSvgIcon>
						}
						label={destinationLabel}
						sx={{
							height: 20,
							fontSize: '0.65rem',
							fontWeight: 600,
							bgcolor: isDerived
								? isDark
									? 'rgba(167, 139, 250, 0.15)'
									: 'rgba(124, 58, 237, 0.08)'
								: isDark
									? 'rgba(56, 189, 248, 0.15)'
									: 'rgba(2, 132, 199, 0.08)',
							color: isDerived ? (isDark ? '#c4b5fd' : '#7c3aed') : isDark ? '#7dd3fc' : '#0284c7',
							borderRadius: '4px',
							maxWidth: 220,
							justifyContent: 'flex-start',
							'& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' }
						}}
					/>
				</Tooltip>
			</Stack>

			{/* 3. Determinations / Pending Samples count */}
			<Stack
				spacing={0.25}
				alignItems={{ xs: 'flex-start', sm: 'center' }}
			>
				<Typography
					variant="body2"
					sx={{
						fontWeight: 800,
						fontSize: '0.85rem',
						color: pendingSamples > 0 ? 'warning.dark' : 'text.primary'
					}}
				>
					{pendingSamples} {pendingSamples === 1 ? 'muestra' : 'muestras'}
				</Typography>
				<Typography
					variant="caption"
					sx={{
						color: 'text.secondary',
						fontSize: '0.66rem',
						textTransform: 'uppercase',
						letterSpacing: 0.3
					}}
				>
					En análisis de lab
				</Typography>
			</Stack>

			{/* 4. Action button */}
			<Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
				<Button
					size="small"
					variant="outlined"
					onClick={handleNavigateToProtocols}
					startIcon={<FuseSvgIcon size={14}>heroicons-outline:arrow-top-right-on-square</FuseSvgIcon>}
					sx={{
						textTransform: 'none',
						fontSize: '0.74rem',
						fontWeight: 700,
						borderRadius: '6px',
						px: 1.5,
						py: 0.4,
						borderColor: theme.palette.divider,
						color: 'text.primary',
						'&:hover': {
							borderColor: 'primary.main',
							bgcolor: alpha(theme.palette.primary.main, 0.04),
							color: 'primary.main'
						}
					}}
				>
					Gestionar
				</Button>
			</Box>
		</Box>
	);
};

export default PendingLabProtocolRow;
