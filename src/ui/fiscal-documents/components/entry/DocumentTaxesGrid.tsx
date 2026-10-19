import {
	Button,
	IconButton,
	MenuItem,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	TextField,
	Tooltip,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { SheetGrid } from 'src/components/sheet-grid/SheetGrid';
import { SheetGridEmptyRow } from 'src/components/sheet-grid/SheetGridEmptyRow';
import { SheetGridStatusCell } from 'src/components/sheet-grid/SheetGridStatusCell';
import { useGridCellStyles } from 'src/components/sheet-grid/useGridCellStyles';
import SheetSection from '../sheet/SheetSection';
import { Tax } from '@/core/fiscal/domain/entities/FiscalCatalog';
import { DocumentTaxState } from './fiscalEntryState';

interface DocumentTaxesGridProps {
	rows: DocumentTaxState[];
	taxes: Tax[];
	errors: Record<string, string>;
	onAdd: () => void;
	onChange: (key: string, patch: Partial<DocumentTaxState>) => void;
	onRemove: (key: string) => void;
}

/** "4. Impuestos del comprobante": perceptions as printed on the paper (DS16). Letter A only. */
export default function DocumentTaxesGrid({ rows, taxes, errors, onAdd, onChange, onRemove }: DocumentTaxesGridProps) {
	const { headSx, indexSx, cellSx, inputSx, errorRing } = useGridCellStyles();
	const options = taxes.filter((t) => t.appliesTo === 'DOCUMENT');
	const input = (row: DocumentTaxState, name: 'rate' | 'taxableBase' | 'amount', width: number) => (
		<TableCell sx={{ ...cellSx, width }}>
			<TextField
				fullWidth
				size="small"
				value={row[name]}
				sx={inputSx}
				inputProps={{ inputMode: 'decimal' }}
				onChange={(e) => onChange(row.key, { [name]: e.target.value })}
			/>
		</TableCell>
	);

	return (
		<SheetSection
			label="Percepciones y otros tributos"
			aside={
				<Button
					size="small"
					onClick={onAdd}
					startIcon={<FuseSvgIcon size={16}>heroicons-outline:plus</FuseSvgIcon>}
					sx={{ textTransform: 'none', fontWeight: 600 }}
				>
					Agregar
				</Button>
			}
		>
			<SheetGrid
				minWidth={640}
				maxHeight={240}
			>
				<TableHead>
					<TableRow>
						<TableCell sx={indexSx}>#</TableCell>
						<TableCell sx={headSx}>Impuesto</TableCell>
						<TableCell sx={{ ...headSx, width: 100 }}>Alícuota %</TableCell>
						<TableCell sx={{ ...headSx, width: 130 }}>Base</TableCell>
						<TableCell sx={{ ...headSx, width: 130 }}>Importe</TableCell>
						<TableCell sx={{ ...headSx, width: 48 }} />
					</TableRow>
				</TableHead>
				<TableBody>
					{rows.length === 0 && (
						<SheetGridEmptyRow colSpan={6}>
							Sin percepciones. Agregalas si el papel las trae.
						</SheetGridEmptyRow>
					)}
					{rows.map((row, index) => (
						<TableRow key={row.key}>
							<TableCell sx={indexSx}>{index + 1}</TableCell>
							<TableCell sx={{ ...cellSx, ...(errors[row.key] ? errorRing : {}) }}>
								<TextField
									select
									fullWidth
									size="small"
									value={row.taxId ?? ''}
									sx={inputSx}
									onChange={(e) => onChange(row.key, { taxId: Number(e.target.value) })}
									SelectProps={{
										displayEmpty: true,
										renderValue: (v) => options.find((t) => t.id === v)?.name ?? 'Elegí el impuesto'
									}}
								>
									{options.map((t) => (
										<MenuItem
											key={t.id}
											value={t.id}
											disabled={rows.some((r) => r.key !== row.key && r.taxId === t.id)}
											sx={{ fontSize: '0.85rem' }}
										>
											{t.name}
										</MenuItem>
									))}
								</TextField>
							</TableCell>
							{input(row, 'rate', 100)}
							{input(row, 'taxableBase', 130)}
							{input(row, 'amount', 130)}
							<SheetGridStatusCell error={errors[row.key]}>
								<Tooltip title="Quitar">
									<IconButton
										size="small"
										onClick={() => onRemove(row.key)}
									>
										<FuseSvgIcon size={16}>heroicons-outline:x-mark</FuseSvgIcon>
									</IconButton>
								</Tooltip>
							</SheetGridStatusCell>
						</TableRow>
					))}
				</TableBody>
			</SheetGrid>
		</SheetSection>
	);
}
