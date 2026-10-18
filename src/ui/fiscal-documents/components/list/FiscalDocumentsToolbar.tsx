import { InputAdornment, MenuItem, Stack, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { FiscalDocumentFilters } from '@/core/fiscal/domain/entities/FiscalDocument';

export type KindFilter = 'ALL' | 'INVOICE' | 'CREDIT_NOTE' | 'TICKET';

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
}

const KINDS: { value: KindFilter; label: string }[] = [
	{ value: 'ALL', label: 'Todos' },
	{ value: 'INVOICE', label: 'Facturas' },
	{ value: 'CREDIT_NOTE', label: 'Notas de crédito' },
	{ value: 'TICKET', label: 'Tickets' }
];

/** Search by provider or number, the kind of paper, registered or voided, and a date range. */
export default function FiscalDocumentsToolbar(props: FiscalDocumentsToolbarProps) {
	const { search, onSearch, kind, onKind, status, onStatus, from, to, onDates } = props;

	return (
		<Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} alignItems={{ lg: 'center' }} flexWrap="wrap" useFlexGap>
			<TextField size="small" placeholder="Proveedor o número" value={search} onChange={(e) => onSearch(e.target.value)} sx={{ minWidth: 240 }}
				InputProps={{ startAdornment: <InputAdornment position="start"><FuseSvgIcon size={18}>heroicons-outline:magnifying-glass</FuseSvgIcon></InputAdornment> }} />
			<ToggleButtonGroup size="small" exclusive value={kind} onChange={(_, value) => value && onKind(value)}
				sx={{ '& .MuiToggleButton-root': { textTransform: 'none', fontWeight: 600, px: 1.5 } }}>
				{KINDS.map((k) => (
					<ToggleButton key={k.value} value={k.value}>
						{k.label}
					</ToggleButton>
				))}
			</ToggleButtonGroup>
			<TextField select size="small" value={status} onChange={(e) => onStatus(e.target.value as 'REGISTERED' | 'VOIDED')} sx={{ minWidth: 150 }}>
				<MenuItem value="REGISTERED">Registrados</MenuItem>
				<MenuItem value="VOIDED">Anulados</MenuItem>
			</TextField>
			<TextField size="small" type="date" label="Desde" value={from} onChange={(e) => onDates(e.target.value, to)} InputLabelProps={{ shrink: true }} />
			<TextField size="small" type="date" label="Hasta" value={to} onChange={(e) => onDates(from, e.target.value)} InputLabelProps={{ shrink: true }} />
		</Stack>
	);
}
