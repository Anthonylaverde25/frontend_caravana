import React from 'react';
import { Box, Paper, Stack, Typography, alpha, useTheme } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useTransferPalette } from './transferPalette';
import { BatchFigures, averageDelta, formatAverage, formatKg } from './transferMath';

interface TransferSummaryCardsProps {
	sourceName: string;
	destinationName: string | null;
	/** True while the destination is a batch that does not exist yet. */
	isNewDestination: boolean;
	/** False until there is a batch to receive the animals. */
	isDestinationChosen: boolean;
	moved: BatchFigures;
	sourceBefore: BatchFigures;
	sourceAfter: BatchFigures;
	destinationBefore: BatchFigures | null;
	destinationAfter: BatchFigures;
}

interface CardSpec {
	id: string;
	label: string;
	value: string;
	unit?: string;
	icon: string;
	accent: string;
	subtitle: string;
	footer: string;
}

/**
 * Summary KPI Cards following the canonical Pre-Service pattern (/gestation/pre-service).
 */
export const TransferSummaryCards: React.FC<TransferSummaryCardsProps> = ({
	sourceName,
	destinationName,
	isNewDestination,
	isDestinationChosen,
	moved,
	sourceBefore,
	sourceAfter,
	destinationBefore,
	destinationAfter
}) => {
	const theme = useTheme();
	const isDark = theme.palette.mode === 'dark';
	const palette = useTransferPalette();

	const sourceDelta = averageDelta(sourceBefore.average, sourceAfter.average);
	const destinationDelta = isNewDestination
		? null
		: averageDelta(destinationBefore?.average ?? null, destinationAfter.average);

	const deltaLine = (delta: number | null): string => {
		if (delta == null || Math.abs(delta) < 0.05) return 'Sin cambio en el promedio';

		return `${delta > 0 ? '▲' : '▼'} ${formatAverage(Math.abs(delta))} kg/cab · ${delta > 0 ? 'sube' : 'baja'}`;
	};

	const deltaColor = (delta: number | null): string => {
		if (delta == null || Math.abs(delta) < 0.05) return palette.neutral;

		return delta > 0 ? palette.success : palette.warning;
	};

	const totalKg = sourceBefore.kg + (destinationBefore?.kg ?? 0);

	const cards: CardSpec[] = [
		{
			id: 'selection',
			label: 'Seleccionados',
			value: String(moved.count),
			unit: moved.count === 1 ? 'cabeza' : 'cabezas',
			icon: 'heroicons-outline:check-circle',
			accent: palette.active,
			subtitle:
				moved.count === 0
					? 'Marcá los animales a mover'
					: `${formatKg(moved.kg)} kg · ${formatAverage(moved.average)} kg/cab`,
			footer: `de ${sourceBefore.count} cabezas de ${sourceName}`
		},
		{
			id: 'source',
			label: 'Origen al transferir',
			value: sourceAfter.average != null ? formatAverage(sourceAfter.average) : '0',
			unit: 'kg/cab',
			icon:
				sourceAfter.count === 0
					? 'heroicons-outline:archive-box-x-mark'
					: sourceDelta != null && sourceDelta < 0
						? 'heroicons-outline:arrow-trending-down'
						: 'heroicons-outline:arrow-trending-up',
			accent: sourceAfter.count === 0 ? palette.warning : deltaColor(sourceDelta),
			subtitle: sourceAfter.count === 0 ? 'El lote queda vacío' : deltaLine(sourceDelta),
			footer: `${sourceName} queda con ${sourceAfter.count} cab · ${formatKg(sourceAfter.kg)} kg`
		},
		{
			id: 'destination',
			label: isNewDestination ? 'Lote nuevo · peso base' : 'Destino al recibir',
			value: isDestinationChosen && destinationAfter.average != null ? formatAverage(destinationAfter.average) : '—',
			unit: isDestinationChosen ? 'kg/cab' : undefined,
			icon: isNewDestination ? 'heroicons-outline:cube' : 'heroicons-outline:arrow-trending-up',
			accent: isNewDestination ? palette.success : palette.active,
			subtitle: !isDestinationChosen
				? 'Elegí el lote de destino'
				: isNewDestination
					? `${moved.count} cab · curva arranca acá`
					: deltaLine(destinationDelta),
			footer: !isDestinationChosen
				? 'Todavía no hay destino'
				: isNewDestination
					? 'Primer peso registrado del lote'
					: `${destinationName} pasa a ${destinationAfter.count} cab`
		},
		{
			id: 'total',
			label: 'Kilos en juego',
			value: formatKg(totalKg),
			unit: 'kg',
			icon: 'heroicons-outline:scale',
			accent: palette.neutral,
			subtitle: 'Conservación de masa',
			footer: 'Ningún animal gana ni pierde peso'
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
				gap: 2
			}}
		>
			{cards.map((card) => (
				<Paper
					key={card.id}
					elevation={0}
					sx={{
						p: 2.25,
						borderRadius: '8px',
						border: '1px solid',
						borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
						bgcolor: isDark ? '#1e293b' : '#ffffff',
						boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
						transition: 'transform 0.15s ease, box-shadow 0.15s ease',
						'&:hover': {
							transform: 'translateY(-2px)',
							boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.25)' : '0 4px 12px rgba(0,0,0,0.06)'
						}
					}}
				>
					<Stack
						direction="row"
						justifyContent="space-between"
						alignItems="flex-start"
					>
						<Box>
							<Typography
								variant="caption"
								sx={{
									color: 'text.secondary',
									fontWeight: 600,
									textTransform: 'uppercase',
									letterSpacing: '0.04em',
									fontSize: '0.68rem'
								}}
							>
								{card.label}
							</Typography>
							<Stack
								direction="row"
								alignItems="baseline"
								spacing={0.75}
								sx={{ mt: 0.5 }}
							>
								<Typography
									variant="h4"
									sx={{
										fontWeight: 700,
										color: 'text.primary',
										letterSpacing: '-0.02em',
										lineHeight: 1.1
									}}
								>
									{card.value}
								</Typography>
								{card.unit && (
									<Typography
										variant="caption"
										sx={{
											fontWeight: 600,
											color: 'text.secondary',
											fontSize: '0.78rem'
										}}
									>
										{card.unit}
									</Typography>
								)}
							</Stack>
						</Box>

						<Box
							sx={{
								p: 1,
								borderRadius: '8px',
								bgcolor: alpha(card.accent, 0.12),
								color: card.accent,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								flexShrink: 0
							}}
						>
							<FuseSvgIcon size={22}>{card.icon}</FuseSvgIcon>
						</Box>
					</Stack>

					<Box
						sx={{
							mt: 2,
							pt: 1.25,
							borderTop: '1px solid',
							borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9'
						}}
					>
						<Typography
							variant="caption"
							sx={{
								fontSize: '0.72rem',
								fontWeight: 600,
								color: card.accent,
								display: 'block',
								lineHeight: 1.3
							}}
						>
							{card.subtitle}
						</Typography>
						<Typography
							variant="caption"
							sx={{
								fontSize: '0.7rem',
								color: 'text.secondary',
								mt: 0.25,
								display: 'block',
								lineHeight: 1.3
							}}
						>
							{card.footer}
						</Typography>
					</Box>
				</Paper>
			))}
		</Box>
	);
};

export default TransferSummaryCards;
