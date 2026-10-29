import React from 'react';
import {
	Alert,
	Box,
	Button,
	Chip,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	Divider,
	IconButton,
	Paper,
	Stack,
	Typography
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Partner } from '@/core/partners/domain/entities/Partner';
import { formatCuit } from '@/core/shared/domain/cuit';
import PartnerRoleChips from '@/ui/partners/components/PartnerRoleChips';
import type { ExitLoadForm } from '../../hooks/useExitLoadForm';
import { formatDate, formatKg, formatMoney } from '../exitOrderFormat';
import { PRICING_LABELS } from './exitPricing';

interface ExitOrderPreviewDialogProps {
	open: boolean;
	onClose: () => void;
	form: ExitLoadForm;
	partner?: Partner | null;
	orderCode?: string;
	/** The primary action of the sheet, offered again from the summary. */
	confirmLabel: string;
	onConfirm: () => void;
	busy?: boolean;
}

const InfoRow: React.FC<{ icon: string; label: string; value: React.ReactNode }> = ({ icon, label, value }) => (
	<Stack
		direction="row"
		spacing={1.5}
		alignItems="flex-start"
	>
		<Box sx={{ color: 'text.secondary', display: 'flex', mt: 0.3 }}>
			<FuseSvgIcon size={18}>{icon}</FuseSvgIcon>
		</Box>
		<Box sx={{ minWidth: 0, flex: 1 }}>
			<Typography
				variant="caption"
				color="text.secondary"
				sx={{ fontWeight: 600, display: 'block', lineHeight: 1.2 }}
			>
				{label}
			</Typography>
			<Typography sx={{ fontSize: '0.88rem', fontWeight: 500, color: 'text.primary', mt: 0.2 }}>
				{value}
			</Typography>
		</Box>
	</Stack>
);

/**
 * Full preview modal for exit orders and sales.
 * Consolidates animals, client, DTE, pricing condition, and destination before confirming.
 */
export const ExitOrderPreviewDialog: React.FC<ExitOrderPreviewDialogProps> = ({
	open,
	onClose,
	form,
	partner,
	orderCode,
	confirmLabel,
	onConfirm,
	busy = false
}) => {
	const { totals, mode, dte, pricing } = form;
	const sells = mode !== 'issue';
	const defaultContact = partner?.default_contact;

	return (
		<Dialog
			open={open}
			onClose={onClose}
			fullWidth
			maxWidth="sm"
			PaperProps={{
				sx: {
					borderRadius: '8px',
					boxShadow: 1,
					bgcolor: 'background.paper'
				}
			}}
		>
			<Box
				sx={{
					p: 2,
					px: 3,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					borderBottom: 1,
					borderColor: 'divider',
					bgcolor: 'background.paper'
				}}
			>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
					<Typography
						variant="h6"
						sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'text.primary' }}
					>
						Previsualización de Orden
					</Typography>
					{orderCode && (
						<Chip
							size="small"
							label={orderCode}
							sx={{ fontWeight: 700, borderRadius: '6px', fontSize: '0.75rem' }}
						/>
					)}
				</Box>
				<IconButton
					onClick={onClose}
					size="small"
					sx={{ color: 'primary.main' }}
					aria-label="Cerrar"
				>
					<FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
				</IconButton>
			</Box>

			<DialogContent sx={{ p: 3, bgcolor: 'background.paper' }}>
				<Stack spacing={2.5}>
					{/* 1. Hacienda y Despacho */}
					<Typography
						sx={{
							fontSize: '0.82rem',
							fontWeight: 700,
							color: 'text.secondary',
							textTransform: 'uppercase',
							letterSpacing: '0.5px'
						}}
					>
						Hacienda y Despacho
					</Typography>

					<Paper
						variant="outlined"
						sx={{ p: 2, borderRadius: '8px', bgcolor: 'background.default' }}
					>
						<Stack
							direction={{ xs: 'column', sm: 'row' }}
							spacing={2}
							justifyContent="space-between"
						>
							<Box>
								<Typography
									variant="caption"
									color="text.secondary"
									sx={{ fontWeight: 600 }}
								>
									Total de cabezas
								</Typography>
								<Typography
									sx={{
										fontSize: '1.15rem',
										fontWeight: 800,
										color: totals.heads > 0 ? 'text.primary' : 'error.main'
									}}
								>
									{totals.heads > 0 ? `${totals.heads} cabeza(s)` : 'Sin animales seleccionados'}
								</Typography>
							</Box>
							{totals.weightKg > 0 && (
								<Box>
									<Typography
										variant="caption"
										color="text.secondary"
										sx={{ fontWeight: 600 }}
									>
										Kilos {totals.weightEstimated ? 'estimados' : 'totales'}
									</Typography>
									<Typography sx={{ fontSize: '1.15rem', fontWeight: 800 }}>
										{formatKg(totals.weightKg)}
									</Typography>
								</Box>
							)}
							<Box>
								<Typography
									variant="caption"
									color="text.secondary"
									sx={{ fontWeight: 600 }}
								>
									{mode === 'issue' ? 'Fecha de carga' : 'Fecha de egreso'}
								</Typography>
								<Typography sx={{ fontSize: '1.15rem', fontWeight: 800 }}>
									{formatDate(form.header.exitDate)}
								</Typography>
							</Box>
						</Stack>
					</Paper>

					<Divider />

					{/* 2. Cliente / Comprador */}
					<Typography
						sx={{
							fontSize: '0.82rem',
							fontWeight: 700,
							color: 'text.secondary',
							textTransform: 'uppercase',
							letterSpacing: '0.5px'
						}}
					>
						Cliente / Comprador
					</Typography>

					{!partner ? (
						<Alert
							severity="warning"
							sx={{ borderRadius: '6px', fontSize: '0.82rem' }}
						>
							Todavía no se seleccionó un comprador. Elegilo en el formulario para asignarlo a la orden.
						</Alert>
					) : (
						<Stack spacing={1.75}>
							<Paper
								variant="outlined"
								sx={{ p: 2, borderRadius: '8px' }}
							>
								<Stack
									direction="row"
									spacing={2}
									alignItems="center"
								>
									<Box
										sx={{
											p: 1.25,
											borderRadius: '8px',
											bgcolor: 'action.hover',
											color: 'text.primary',
											display: 'flex'
										}}
									>
										<FuseSvgIcon size={24}>heroicons-outline:building-office-2</FuseSvgIcon>
									</Box>
									<Box sx={{ minWidth: 0, flex: 1 }}>
										<Typography sx={{ fontWeight: 700, fontSize: '0.96rem', lineHeight: 1.2 }}>
											{partner.name}
										</Typography>
										{partner.commercial_name && partner.commercial_name !== partner.name && (
											<Typography
												variant="caption"
												color="text.secondary"
												sx={{ display: 'block', mt: 0.2 }}
											>
												{partner.commercial_name}
											</Typography>
										)}
									</Box>
									{partner.roles.length > 0 && (
										<Box sx={{ alignSelf: 'flex-start' }}>
											<PartnerRoleChips roles={partner.roles} />
										</Box>
									)}
								</Stack>
							</Paper>

							<Stack
								spacing={1.25}
								sx={{ pl: 0.5 }}
							>
								<InfoRow
									icon="heroicons-outline:identification"
									label="CUIT"
									value={formatCuit(partner.cuit)}
								/>
								<InfoRow
									icon="heroicons-outline:map-pin"
									label="Domicilio / Localidad"
									value={partner.location || 'Sin domicilio registrado'}
								/>
								{defaultContact && (
									<InfoRow
										icon="heroicons-outline:phone"
										label={`Contacto: ${defaultContact.name}${defaultContact.position ? ` · ${defaultContact.position}` : ''}`}
										value={`${defaultContact.phone}${defaultContact.email ? ` · ${defaultContact.email}` : ''}`}
									/>
								)}
							</Stack>
						</Stack>
					)}

					<Divider />

					{/* 3. Condición Comercial y Cobro */}
					{sells && (
						<>
							<Typography
								sx={{
									fontSize: '0.82rem',
									fontWeight: 700,
									color: 'text.secondary',
									textTransform: 'uppercase',
									letterSpacing: '0.5px'
								}}
							>
								Condición de Cobro y Facturación
							</Typography>

							<Stack spacing={1.5}>
								<InfoRow
									icon="heroicons-outline:banknotes"
									label="Modalidad"
									value={PRICING_LABELS[pricing.mode]}
								/>
								<InfoRow
									icon="heroicons-outline:currency-dollar"
									label="Total liquidación"
									value={
										totals.amount > 0 ? (
											<Typography
												component="span"
												sx={{ fontWeight: 700, fontSize: '1rem', color: 'primary.main' }}
											>
												{formatMoney(totals.amount)}
											</Typography>
										) : (
											'Sin importe calculado'
										)
									}
								/>
								{form.pricingGap && totals.heads > 0 && (
									<Alert
										severity="warning"
										sx={{ borderRadius: '6px', fontSize: '0.78rem', py: 0.5 }}
									>
										{form.pricingGap}
									</Alert>
								)}
							</Stack>

							<Divider />
						</>
					)}

					{/* 4. Documento de Tránsito (DTE) */}
					{sells && (
						<>
							<Typography
								sx={{
									fontSize: '0.82rem',
									fontWeight: 700,
									color: 'text.secondary',
									textTransform: 'uppercase',
									letterSpacing: '0.5px'
								}}
							>
								Documento de Tránsito (DTE)
							</Typography>

							<Stack spacing={1.25}>
								<InfoRow
									icon="heroicons-outline:document-text"
									label="Estado DTE"
									value={
										dte.number.trim() ? (
											<Stack
												direction="row"
												spacing={1}
												alignItems="center"
											>
												<Typography sx={{ fontWeight: 700 }}>
													DTE N° {dte.number.trim()}
												</Typography>
												<Typography
													variant="caption"
													color="text.secondary"
												>
													· {formatDate(dte.date)} ({dte.heads || totals.heads} cab.)
												</Typography>
											</Stack>
										) : (
											<Typography
												color="warning.main"
												sx={{ fontWeight: 600 }}
											>
												Sale sin DTE (Recomendado. Se puede cargar después)
											</Typography>
										)
									}
								/>
							</Stack>

							<Divider />
						</>
					)}

					{/* 5. Nota operativa sobre el destino */}
					{sells && (
						<Box sx={{ bgcolor: 'action.hover', p: 1.5, borderRadius: '6px', textAlign: 'center' }}>
							<Typography
								variant="caption"
								color="text.secondary"
								sx={{ fontWeight: 500 }}
							>
								Los animales pasan al <strong>Lote de Egresos</strong> con la fecha indicada.
							</Typography>
						</Box>
					)}
				</Stack>
			</DialogContent>

			<DialogActions
				sx={{
					p: 2,
					px: 3,
					bgcolor: 'background.default',
					borderTop: 1,
					borderColor: 'divider',
					justifyContent: 'flex-end',
					gap: 1
				}}
			>
				<Button
					onClick={onClose}
					variant="text"
					sx={{ fontWeight: 600, color: 'text.primary', textTransform: 'none' }}
				>
					Volver a editar
				</Button>
				<Button
					onClick={onConfirm}
					variant="contained"
					disabled={busy}
					startIcon={
						busy ? (
							<CircularProgress
								size={14}
								color="inherit"
							/>
						) : undefined
					}
					sx={{
						bgcolor: 'primary.main',
						color: 'primary.contrastText',
						px: 3.5,
						fontWeight: 700,
						borderRadius: '6px',
						textTransform: 'none',
						boxShadow: 'none',
						'&:hover': { bgcolor: 'primary.dark' }
					}}
				>
					{confirmLabel}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default ExitOrderPreviewDialog;
