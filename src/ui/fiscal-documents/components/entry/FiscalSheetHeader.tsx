import { Box, Chip, IconButton, MenuItem, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { filledInputProps } from '@/ui/weaning-orders/components/form/formStyles';
import { useSuppliers } from '@/features/suppliers/hooks/useSuppliers';
import { useFiscalDocuments } from '@/features/fiscal/hooks/useFiscalDocuments';
import { FiscalDocumentType } from '@/core/fiscal/domain/entities/FiscalCatalog';
import { InvoiceDraft } from '@/core/fiscal/domain/entities/DeliveryNote';
import { sheetSubtleBg } from '../sheet/sheetStyles';
import { EntryMode, FiscalHeaderState } from './fiscalEntryState';
import ConversionOriginCard from './ConversionOriginCard';
import DocumentNumberField from './DocumentNumberField';
import DeliveryNotePricingToggle from './DeliveryNotePricingToggle';
import PendingDeliveryNotesNotice from './PendingDeliveryNotesNotice';

interface FiscalSheetHeaderProps {
	header: FiscalHeaderState;
	types: FiscalDocumentType[];
	type: FiscalDocumentType | undefined;
	onChange: (patch: Partial<FiscalHeaderState>) => void;
	errors: Record<string, string>;
	mode: EntryMode;
	/** A conversion: what the notes declared (provider, notes), read-only. */
	draft: InvoiceDraft | null;
	canClearProvider?: boolean;
}

/** What the paper of each type says about its taxes. */
const typeHint = (type: FiscalDocumentType): string =>
	type.kind === 'DELIVERY_NOTE'
		? 'Remito: sólo artículos con stock, sin impuestos ni total; van en la factura.'
		: type.discriminatesVat
			? `${type.name}: precios netos, con el IVA de cada renglón aparte.`
			: `${type.name}: el precio ya incluye los impuestos; no se discriminan.`;

const today = (): string => new Date().toISOString().slice(0, 10);

/**
 * The top of the sheet, as the paper prints it: who issued it on the left, which paper it is on the
 * right (lienzo: FiscalDocumentEditor). A delivery note says whether it carries prices; a conversion
 * inherits provider and notes (DC5); a credit note names the invoice it credits.
 */
export default function FiscalSheetHeader({
	header,
	types,
	type,
	onChange,
	errors,
	mode,
	draft,
	canClearProvider = true
}: FiscalSheetHeaderProps) {
	const { data: providers = [] } = useSuppliers('items');
	const provider = providers.find((p) => p.id === (draft?.provider.id ?? header.providerId));
	const isCreditNote = type?.kind === 'CREDIT_NOTE';
	const { data: invoices } = useFiscalDocuments({ providerId: header.providerId ?? undefined, kind: 'INVOICE' });
	const relatedOptions = isCreditNote && header.providerId ? (invoices?.data ?? []) : [];
	const field = (name: string) => ({ error: !!errors[name], helperText: errors[name] });

	return (
		<Box
			component="section"
			sx={{
				p: { xs: 1.5, sm: 2 },
				px: { xs: 2, sm: 2.5 },
				borderBottom: 1,
				borderColor: 'divider',
				bgcolor: 'background.paper',
				display: 'flex',
				flexDirection: 'column',
				gap: 1.5
			}}
		>
			<Box
				sx={{
					display: 'grid',
					gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
					gap: 1.5,
					alignItems: 'flex-start'
				}}
			>
				{/* 1. Proveedor / Remitos de origen */}
				<Box
					sx={{
						gridColumn: { xs: 'span 12', md: 'span 4' },
						display: 'flex',
						flexDirection: 'column'
					}}
				>
					{mode === 'conversion' && draft ? (
						<ConversionOriginCard draft={draft} />
					) : provider ? (
						<>
							<Box
								sx={{
									bgcolor: sheetSubtleBg,
									height: 56,
									px: 1.75,
									borderRadius: '8px',
									border: 1,
									borderColor: 'divider',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'space-between',
									boxSizing: 'border-box'
								}}
							>
								<Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden', mr: 1 }}>
									<Typography
										sx={{
											fontSize: '0.65rem',
											fontWeight: 800,
											color: 'text.secondary',
											textTransform: 'uppercase',
											letterSpacing: '0.04em',
											lineHeight: 1.2
										}}
									>
										Razón social
									</Typography>
									<Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
										<Tooltip title={provider.name}>
											<Typography
												sx={{
													fontSize: '0.90rem',
													fontWeight: 700,
													color: 'text.primary',
													whiteSpace: 'nowrap',
													overflow: 'hidden',
													textOverflow: 'ellipsis',
													minWidth: 0
												}}
											>
												{provider.name}
											</Typography>
										</Tooltip>
										{provider.cuit && (
											<Chip
												size="small"
												label={`CUIT: ${provider.cuit}`}
												sx={{
													fontFamily: 'monospace',
													fontWeight: 600,
													fontSize: '0.68rem',
													height: 20,
													bgcolor: 'background.paper',
													border: 1,
													borderColor: 'divider',
													flexShrink: 0
												}}
											/>
										)}
									</Stack>
								</Box>
								{canClearProvider && (
									<Tooltip title="Desmarcar proveedor">
										<IconButton
											size="small"
											aria-label="Desmarcar proveedor"
											onClick={() => onChange({ providerId: null, relatedId: null })}
											sx={{
												color: 'text.secondary',
												bgcolor: (theme) =>
													theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
												border: 1,
												borderColor: 'divider',
												width: 28,
												height: 28,
												p: 0,
												ml: 1,
												flexShrink: 0,
												borderRadius: '6px',
												boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
												transition: 'all 0.15s ease-in-out',
												'&:hover': {
													color: 'error.main',
													bgcolor: (theme) => alpha(theme.palette.error.main, 0.12),
													borderColor: (theme) => alpha(theme.palette.error.main, 0.35),
													transform: 'scale(1.05)'
												}
											}}
										>
											<FuseSvgIcon size={14}>heroicons-outline:x-mark</FuseSvgIcon>
										</IconButton>
									</Tooltip>
								)}
							</Box>
							{provider.location && (
								<Tooltip title={provider.location}>
									<Box
										sx={{
											display: 'flex',
											alignItems: 'center',
											gap: 0.5,
											mt: 0.5,
											px: 0.75,
											minHeight: 18,
											overflow: 'hidden'
										}}
									>
										<FuseSvgIcon size={12} sx={{ color: 'text.secondary', flexShrink: 0 }}>
											heroicons-outline:map-pin
										</FuseSvgIcon>
										<Typography
											sx={{
												fontSize: '0.72rem',
												color: 'text.secondary',
												whiteSpace: 'nowrap',
												overflow: 'hidden',
												textOverflow: 'ellipsis'
											}}
										>
											{provider.location}
										</Typography>
									</Box>
								</Tooltip>
							)}
						</>
					) : (
						<TextField
							select
							label="Razón social"
							variant="filled"
							fullWidth
							value=""
							InputProps={filledInputProps}
							onChange={(e) => {
								const val = e.target.value;
								onChange({
									providerId: val === '' || val === null ? null : Number(val),
									relatedId: null
								});
							}}
							{...field('provider_id')}
						>
							{providers.map((p) => (
								<MenuItem key={p.id} value={p.id}>
									{p.name}
								</MenuItem>
							))}
						</TextField>
					)}
				</Box>

				{/* 2. Tipo de comprobante */}
				<Box
					sx={{
						gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 3' },
						display: 'flex',
						flexDirection: 'column',
						gap: 0.75
					}}
				>
					<TextField
						select
						label="Tipo"
						variant="filled"
						fullWidth
						value={header.typeId ?? ''}
						InputProps={filledInputProps}
						onChange={(e) => onChange({ typeId: Number(e.target.value) })}
						{...field('fiscal_document_type_id')}
					>
						{(mode === 'conversion' ? types.filter((t) => t.kind === 'INVOICE') : types).map((t) => (
							<MenuItem key={t.id} value={t.id}>
								{t.name}
							</MenuItem>
						))}
					</TextField>
					{type && (
						<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', px: 0.5 }}>
							{typeHint(type)}
						</Typography>
					)}
				</Box>

				{/* 3. Punto de venta y Número */}
				<Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 3' } }}>
					<DocumentNumberField
						requiresNumber={type?.requiresNumber ?? true}
						pointOfSale={header.pointOfSale}
						number={header.number}
						reference={header.reference}
						onChange={onChange}
						errors={errors}
					/>
				</Box>

				{/* 4. Fecha de emisión */}
				<Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 2' } }}>
					<TextField
						label="Fecha de emisión"
						type="date"
						variant="filled"
						fullWidth
						value={header.issuedAt}
						InputProps={filledInputProps}
						inputProps={{ max: today() }}
						InputLabelProps={{ shrink: true }}
						onChange={(e) => onChange({ issuedAt: e.target.value })}
						{...field('issued_at')}
					/>
				</Box>

				{/* 5. Si es nota de crédito: Factura que acredita */}
				{isCreditNote && (
					<Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6', lg: 'span 4' } }}>
						<TextField
							select
							label="Factura que acredita"
							variant="filled"
							fullWidth
							value={header.relatedId ?? ''}
							InputProps={filledInputProps}
							onChange={(e) =>
								onChange({ relatedId: e.target.value === '' ? null : Number(e.target.value) })
							}
							disabled={!header.providerId}
							{...field('related_fiscal_document_id')}
						>
							<MenuItem value="">Ninguna en particular</MenuItem>
							{relatedOptions.map((d) => (
								<MenuItem key={d.id} value={d.id}>
									{d.label} · {d.issuedAt.split('-').reverse().join('/')}
								</MenuItem>
							))}
						</TextField>
					</Box>
				)}

				{/* 6. Si es remito: Toggle de precios */}
				{mode === 'delivery-note' && (
					<Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6', lg: 'span 4' } }}>
						<DeliveryNotePricingToggle
							value={header.isValued}
							onChange={(isValued) => onChange({ isValued })}
							error={errors.is_valued}
						/>
					</Box>
				)}

				{/* 7. Alerta de remitos pendientes para el proveedor */}
				{mode === 'document' && type?.kind === 'INVOICE' && (
					<Box sx={{ gridColumn: 'span 12' }}>
						<PendingDeliveryNotesNotice
							providerId={header.providerId}
							providerName={provider?.name ?? null}
						/>
					</Box>
				)}
			</Box>
		</Box>
	);
}
