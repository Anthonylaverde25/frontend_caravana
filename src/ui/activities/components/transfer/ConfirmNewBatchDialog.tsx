import React from 'react';
import { Box, Button, Dialog, Stack, Typography, alpha } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useTransferPalette } from './transferPalette';
import { BatchFigures, formatAverage, formatKg } from './transferMath';

interface ConfirmNewBatchDialogProps {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
	isPending: boolean;
	name: string;
	typeName: string | null;
	typeColor?: string | null;
	activityName: string | null;
	/** `null` when the destination stage does not ask for it. */
	isConfined: boolean | null;
	sourceName: string;
	moved: BatchFigures;
	sourceAfter: BatchFigures;
}

/**
 * Last stop before a batch exists.
 *
 * Transferring into an open batch is undone by transferring back; creating one leaves a
 * new entity on the production sheet. This is the only place where the two effects are
 * read together: what gets created, and what moves into it.
 */
export const ConfirmNewBatchDialog: React.FC<ConfirmNewBatchDialogProps> = ({
	open,
	onClose,
	onConfirm,
	isPending,
	name,
	typeName,
	typeColor,
	activityName,
	isConfined,
	sourceName,
	moved,
	sourceAfter
}) => {
	const palette = useTransferPalette();

	const row = (label: string, value: React.ReactNode) => (
		<>
			<Typography
				variant="body2"
				sx={{ fontSize: '0.8rem', color: 'text.secondary' }}
			>
				{label}
			</Typography>
			<Box sx={{ fontSize: '0.8rem' }}>{value}</Box>
		</>
	);

	return (
		<Dialog
			open={open}
			onClose={isPending ? undefined : onClose}
			fullWidth
			maxWidth="sm"
			PaperProps={{ sx: { borderRadius: '12px', bgcolor: palette.cardBg } }}
		>
			<Stack
				direction="row"
				spacing={1.5}
				alignItems="center"
				sx={{ px: 2.5, py: 2, borderBottom: '1px solid', borderColor: palette.softBorder }}
			>
				<Box
					sx={{
						width: 36,
						height: 36,
						flexShrink: 0,
						borderRadius: '8px',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						color: palette.active,
						bgcolor: alpha(palette.active, 0.12)
					}}
				>
					<FuseSvgIcon size={20}>heroicons-outline:cube</FuseSvgIcon>
				</Box>
				<Box>
					<Typography
						variant="h6"
						sx={{ fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.25 }}
					>
						Crear lote y transferir
					</Typography>
					<Typography
						variant="caption"
						color="text.secondary"
					>
						Revisá lo que se va a crear y lo que se mueve
					</Typography>
				</Box>
			</Stack>

			<Stack
				spacing={2}
				sx={{ px: 2.5, py: 2.5 }}
			>
				<Box>
					<Typography
						variant="caption"
						sx={{
							display: 'block',
							mb: 1,
							fontSize: '0.68rem',
							fontWeight: 700,
							letterSpacing: '0.05em',
							textTransform: 'uppercase',
							color: 'text.secondary'
						}}
					>
						Se crea el lote
					</Typography>

					<Box sx={{ borderRadius: '8px', border: '1px solid', borderColor: palette.cardBorder }}>
						<Stack
							direction="row"
							spacing={1.25}
							alignItems="center"
							sx={{
								px: 1.75,
								py: 1.375,
								borderBottom: '1px solid',
								borderColor: palette.softBorder,
								bgcolor: palette.softBg
							}}
						>
							<Box
								sx={{
									width: 9,
									height: 9,
									borderRadius: '50%',
									flexShrink: 0,
									bgcolor: typeColor || 'text.disabled'
								}}
							/>
							<Typography
								variant="subtitle2"
								sx={{ fontWeight: 700, fontSize: '0.92rem' }}
							>
								{name}
							</Typography>
							<Typography
								variant="caption"
								sx={{
									fontSize: '0.65rem',
									fontWeight: 700,
									textTransform: 'uppercase',
									letterSpacing: '0.04em',
									color: palette.active,
									bgcolor: alpha(palette.active, 0.12),
									borderRadius: '5px',
									px: 0.875,
									py: 0.25
								}}
							>
								nuevo
							</Typography>
						</Stack>

						<Box
							sx={{
								px: 1.75,
								py: 1.5,
								display: 'grid',
								gridTemplateColumns: 'auto 1fr',
								columnGap: 2,
								rowGap: 1,
								alignItems: 'center'
							}}
						>
							{row(
								'Etapa',
								<Typography
									variant="body2"
									sx={{ fontSize: '0.8rem' }}
								>
									{activityName ?? '—'}
								</Typography>
							)}
							{row(
								'Tipo de lote',
								<Typography
									variant="body2"
									sx={{ fontSize: '0.8rem' }}
								>
									{typeName ?? '—'}
								</Typography>
							)}
							{isConfined != null &&
								row(
									'Sistema de manejo',
									<Stack
										direction="row"
										spacing={0.75}
										alignItems="center"
										sx={{
											display: 'inline-flex',
											px: 1.125,
											py: 0.5,
											borderRadius: '6px',
											fontSize: '0.72rem',
											fontWeight: 600,
											color: isConfined ? palette.warning : palette.success,
											bgcolor: alpha(isConfined ? palette.warning : palette.success, 0.12)
										}}
									>
										<FuseSvgIcon
											size={14}
											color="inherit"
										>
											{isConfined ? 'heroicons-outline:home' : 'heroicons-outline:sun'}
										</FuseSvgIcon>
										{isConfined ? 'A corral' : 'A campo'}
									</Stack>
								)}
						</Box>
					</Box>
				</Box>

				<Box>
					<Typography
						variant="caption"
						sx={{
							display: 'block',
							mb: 1,
							fontSize: '0.68rem',
							fontWeight: 700,
							letterSpacing: '0.05em',
							textTransform: 'uppercase',
							color: 'text.secondary'
						}}
					>
						Y se trasladan
					</Typography>
					<Stack
						direction="row"
						spacing={1.25}
						alignItems="center"
						sx={{
							px: 1.75,
							py: 1.5,
							borderRadius: '8px',
							border: '1px solid',
							borderColor: palette.cardBorder,
							fontVariantNumeric: 'tabular-nums'
						}}
					>
						<Typography
							variant="body2"
							sx={{ fontWeight: 700 }}
						>
							{moved.count} {moved.count === 1 ? 'cabeza' : 'cabezas'}
						</Typography>
						<Typography
							variant="body2"
							color="text.disabled"
						>
							·
						</Typography>
						<Typography
							variant="body2"
							sx={{ fontWeight: 700 }}
						>
							{formatKg(moved.kg)} kg
						</Typography>
						<Box sx={{ flexGrow: 1 }} />
						<Typography
							variant="caption"
							color="text.secondary"
						>
							desde{' '}
							<Box
								component="strong"
								sx={{ color: 'text.primary' }}
							>
								{sourceName}
							</Box>
						</Typography>
					</Stack>
				</Box>

				<Stack
					direction="row"
					spacing={1.25}
					alignItems="flex-start"
					sx={{
						px: 1.75,
						py: 1.5,
						borderRadius: '8px',
						border: '1px solid',
						borderColor: alpha(palette.active, 0.2),
						bgcolor: alpha(palette.active, 0.06)
					}}
				>
					<Box sx={{ color: palette.active, display: 'flex', flexShrink: 0, mt: 0.125 }}>
						<FuseSvgIcon
							size={17}
							color="inherit"
						>
							heroicons-outline:information-circle
						</FuseSvgIcon>
					</Box>
					<Typography
						variant="caption"
						sx={{ fontSize: '0.75rem', lineHeight: 1.55 }}
					>
						El lote nuevo arranca su curva de peso en{' '}
						<Box
							component="strong"
							sx={{ fontWeight: 700 }}
						>
							{formatAverage(moved.average)} kg/cab
						</Box>
						, el promedio de los animales que entran. {sourceName} queda con {sourceAfter.count} cabezas y{' '}
						{formatAverage(sourceAfter.average)} kg/cab.
					</Typography>
				</Stack>
			</Stack>

			<Stack
				direction="row"
				spacing={1.5}
				justifyContent="flex-end"
				sx={{ px: 2.5, py: 2, borderTop: '1px solid', borderColor: palette.softBorder }}
			>
				<Button
					onClick={onClose}
					disabled={isPending}
					variant="outlined"
					color="inherit"
					sx={{ fontWeight: 600, textTransform: 'none', borderRadius: '6px', px: 2 }}
				>
					Cancelar
				</Button>
				<Button
					onClick={onConfirm}
					disabled={isPending}
					variant="contained"
					startIcon={<FuseSvgIcon size={18}>heroicons-outline:plus</FuseSvgIcon>}
					sx={{
						fontWeight: 600,
						textTransform: 'none',
						borderRadius: '6px',
						px: 2.5,
						bgcolor: palette.active,
						'&:hover': { bgcolor: palette.isDark ? '#3b82f6' : '#0854a0' }
					}}
				>
					{isPending ? 'Creando...' : 'Crear y transferir'}
				</Button>
			</Stack>
		</Dialog>
	);
};

export default ConfirmNewBatchDialog;
