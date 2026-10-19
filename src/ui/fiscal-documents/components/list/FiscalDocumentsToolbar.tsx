import { Chip, InputAdornment, Stack, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { FiscalDocumentFilters, FiscalRegisterSummary } from '@/core/fiscal/domain/entities/FiscalDocument';

export type KindFilter = 'ALL' | 'INVOICE' | 'CREDIT_NOTE' | 'TICKET' | 'DELIVERY_NOTE';

interface FiscalDocumentsToolbarProps {
	search: string;
	onSearch: (value: string) => void;
	kind: KindFilter;
	onKind: (value: KindFilter) => void;
	status: NonNullable<FiscalDocumentFilters['status']>;
	onStatus: (value: NonNullable<FiscalDocumentFilters['status']>) => void;
	from: string;
	to: string;
	onDates: (from: string, to: string) => void;
	/** How many papers each filter would show (lienzo: FiscalDocumentsList). */
	summary: FiscalRegisterSummary | null;
}

const KINDS: { value: KindFilter; label: string }[] = [
	{ value: 'ALL', label: 'Todos' },
	{ value: 'INVOICE', label: 'Facturas' },
	{ value: 'CREDIT_NOTE', label: 'Notas de crédito' },
	{ value: 'TICKET', label: 'Tickets' },
	{ value: 'DELIVERY_NOTE', label: 'Remitos' }
];

const TOGGLES_SX = { flexWrap: 'wrap', '& .MuiToggleButton-root': { textTransform: 'none', fontWeight: 600, px: 1.5, gap: 0.75 } } as const;

const Count = ({ n }: { n: number | undefined }) => (
	<Chip label={n ?? 0} size="small" sx={{ height: 18, fontSize: '0.68rem', fontWeight: 700, '& .MuiChip-label': { px: 0.75 } }} />
);

/** Search by provider, CUIT or number, the kind of paper and whether it is voided, each with its count, and a date range. */
export default function FiscalDocumentsToolbar(props: FiscalDocumentsToolbarProps) {
	const { search, onSearch, kind, onKind, status, onStatus, from, to, onDates, summary } = props;
	const byKind = summary?.byKind ?? {};
	const all = Object.values(byKind).reduce((a, b) => a + (b ?? 0), 0);

	return (
		<Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} alignItems={{ lg: 'center' }} flexWrap="wrap" useFlexGap>
			<TextField size="small" placeholder="Proveedor, CUIT o número" value={search} onChange={(e) => onSearch(e.target.value)} sx={{ minWidth: 260 }}
				InputProps={{ startAdornment: <InputAdornment position="start"><FuseSvgIcon size={18}>heroicons-outline:magnifying-glass</FuseSvgIcon></InputAdornment> }} />
			<ToggleButtonGroup size="small" exclusive value={kind} onChange={(_, value) => value && onKind(value)} sx={TOGGLES_SX} aria-label="Clase">
				{KINDS.map((k) => (
					<ToggleButton key={k.value} value={k.value}>
						{k.label} <Count n={k.value === 'ALL' ? all : byKind[k.value]} />
					</ToggleButton>
				))}
			</ToggleButtonGroup>
			<ToggleButtonGroup size="small" exclusive value={status} onChange={(_, value) => value && onStatus(value)} sx={TOGGLES_SX} aria-label="Estado">
				<ToggleButton value="REGISTERED">Registrados <Count n={summary?.byStatus.REGISTERED} /></ToggleButton>
				<ToggleButton value="VOIDED">Anulados <Count n={summary?.byStatus.VOIDED} /></ToggleButton>
			</ToggleButtonGroup>
			<TextField size="small" type="date" label="Desde" value={from} onChange={(e) => onDates(e.target.value, to)} InputLabelProps={{ shrink: true }} />
			<TextField size="small" type="date" label="Hasta" value={to} onChange={(e) => onDates(from, e.target.value)} InputLabelProps={{ shrink: true }} />
		</Stack>
	);
}
