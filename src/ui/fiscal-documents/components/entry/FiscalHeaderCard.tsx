import { Alert, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { filledInputProps, sectionTitleSx } from '@/ui/weaning-orders/components/form/formStyles';
import { useSuppliers } from '@/features/suppliers/hooks/useSuppliers';
import { useFiscalDocuments } from '@/features/fiscal/hooks/useFiscalDocuments';
import { FiscalDocumentType } from '@/core/fiscal/domain/entities/FiscalCatalog';
import DocumentNumberField from './DocumentNumberField';
import { FiscalHeaderState } from './fiscalEntryState';

interface FiscalHeaderCardProps {
	header: FiscalHeaderState;
	types: FiscalDocumentType[];
	type: FiscalDocumentType | undefined;
	onChange: (patch: Partial<FiscalHeaderState>) => void;
	errors: Record<string, string>;
}

const today = (): string => new Date().toISOString().slice(0, 10);

/** "1. Comprobante": who issued the paper, which one it is and when; the total printed on it (DS19). */
export default function FiscalHeaderCard({ header, types, type, onChange, errors }: FiscalHeaderCardProps) {
	const { data: providers = [] } = useSuppliers('items');
	const isCreditNote = type?.kind === 'CREDIT_NOTE';
	const { data: invoices } = useFiscalDocuments({ providerId: header.providerId ?? undefined, kind: 'INVOICE' });
	const relatedOptions = isCreditNote && header.providerId ? (invoices?.data ?? []) : [];

	const field = (name: string) => ({ error: !!errors[name], helperText: errors[name] });

	return (
		<Paper variant="outlined" sx={{ p: 2, borderRadius: '8px' }}>
			<Typography sx={sectionTitleSx}>1. Comprobante</Typography>
			<Stack spacing={2} sx={{ mt: 1.5 }}>
				<TextField select label="Proveedor" variant="filled" fullWidth value={header.providerId ?? ''} InputProps={filledInputProps}
					onChange={(e) => onChange({ providerId: Number(e.target.value), relatedId: null })} {...field('provider_id')}>
					{providers.map((p) => (
						<MenuItem key={p.id} value={p.id}>
							{p.name}
						</MenuItem>
					))}
				</TextField>
				<TextField select label="Tipo" variant="filled" fullWidth value={header.typeId ?? ''} InputProps={filledInputProps}
					onChange={(e) => onChange({ typeId: Number(e.target.value) })} {...field('fiscal_document_type_id')}>
					{types.map((t) => (
						<MenuItem key={t.id} value={t.id}>
							{t.name}
						</MenuItem>
					))}
				</TextField>
				<DocumentNumberField
					requiresNumber={type?.requiresNumber ?? true}
					pointOfSale={header.pointOfSale}
					number={header.number}
					reference={header.reference}
					onChange={onChange}
					errors={errors}
				/>
				<Stack direction="row" spacing={1.5}>
					<TextField label="Fecha" type="date" variant="filled" fullWidth value={header.issuedAt} InputProps={filledInputProps}
						inputProps={{ max: today() }} InputLabelProps={{ shrink: true }}
						onChange={(e) => onChange({ issuedAt: e.target.value })} {...field('issued_at')} />
					<TextField label="Total del papel" variant="filled" fullWidth value={header.declaredTotal} InputProps={filledInputProps}
						inputProps={{ inputMode: 'decimal' }} placeholder="Opcional"
						onChange={(e) => onChange({ declaredTotal: e.target.value })} {...field('declared_total')} />
				</Stack>
				{isCreditNote && (
					<TextField select label="Factura que acredita" variant="filled" fullWidth value={header.relatedId ?? ''} InputProps={filledInputProps}
						onChange={(e) => onChange({ relatedId: e.target.value === '' ? null : Number(e.target.value) })}
						disabled={!header.providerId} {...field('related_fiscal_document_id')}>
						<MenuItem value="">Ninguna en particular</MenuItem>
						{relatedOptions.map((d) => (
							<MenuItem key={d.id} value={d.id}>
								{d.label} · {d.issuedAt.split('-').reverse().join('/')}
							</MenuItem>
						))}
					</TextField>
				)}
				<TextField label="Notas" variant="filled" fullWidth multiline minRows={1} value={header.notes} InputProps={filledInputProps}
					onChange={(e) => onChange({ notes: e.target.value })} />
				{type && (
					<Alert severity="info" sx={{ fontSize: '0.8rem', py: 0.5, borderRadius: '6px' }}>
						{type.discriminatesVat
							? `${type.name}: precios netos, con el IVA de cada renglón aparte.`
							: `${type.name}: el precio ya incluye los impuestos; no se discriminan.`}
					</Alert>
				)}
			</Stack>
		</Paper>
	);
}
