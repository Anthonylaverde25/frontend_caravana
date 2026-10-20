import { Checkbox, IconButton, MenuItem, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { SheetGrid } from 'src/components/sheet-grid/SheetGrid';
import { SheetGridStatusCell } from 'src/components/sheet-grid/SheetGridStatusCell';
import { SheetGridEmptyRow } from 'src/components/sheet-grid/SheetGridEmptyRow';
import { useGridCellStyles } from 'src/components/sheet-grid/useGridCellStyles';

import { formatCuit } from '@/core/shared/domain/cuit';
export interface ProviderRow {
	key: string;
	providerId: number;
	leadTimeDays: string;
	isPreferred: boolean;
}

export interface ProviderOption {
	id: number;
	name: string;
	cuit: string;
}

interface ItemProvidersGridProps {
	rows: ProviderRow[];
	options: ProviderOption[];
	onChange: (key: string, changes: Partial<ProviderRow>) => void;
	onRemove: (key: string) => void;
	/** Errors by row key, from the click on "Guardar". */
	errors: Record<string, string>;
}

/** One provider per row: who, how many days it takes, and the star of the preferred one. */
export default function ItemProvidersGrid({ rows, options, onChange, onRemove, errors }: ItemProvidersGridProps) {
	const { headSx, indexSx, cellSx, inputSx, errorRing } = useGridCellStyles();

	return (
		<SheetGrid minWidth={560} maxHeight={360}>
			<TableHead>
				<TableRow>
					<TableCell sx={indexSx}>#</TableCell>
					<TableCell sx={headSx}>Proveedor</TableCell>
					<TableCell sx={{ ...headSx, width: 120 }}>Demora (días)</TableCell>
					<TableCell sx={{ ...headSx, width: 90 }} align="center">Preferido</TableCell>
					<TableCell sx={{ ...headSx, width: 48 }} />
				</TableRow>
			</TableHead>
			<TableBody>
				{rows.length === 0 && <SheetGridEmptyRow colSpan={5}>Sin proveedores. Agregá uno abajo.</SheetGridEmptyRow>}
				{rows.map((row, index) => {
					const taken = new Set(rows.filter((r) => r.key !== row.key).map((r) => r.providerId));
					return (
						<TableRow key={row.key}>
							<TableCell sx={indexSx}>{index + 1}</TableCell>
							<TableCell sx={{ ...cellSx, ...(errors[row.key] ? errorRing : {}) }}>
								<TextField select fullWidth size="small" value={row.providerId || ''} sx={inputSx}
									onChange={(e) => onChange(row.key, { providerId: Number(e.target.value) })}
									SelectProps={{ displayEmpty: true, renderValue: (v) => options.find((o) => o.id === v)?.name ?? 'Elegí un proveedor' }}>
									{options.map((o) => (
										<MenuItem key={o.id} value={o.id} disabled={taken.has(o.id)}>
											{o.name} · {formatCuit(o.cuit)}
										</MenuItem>
									))}
								</TextField>
							</TableCell>
							<TableCell sx={cellSx}>
								<TextField fullWidth size="small" value={row.leadTimeDays} sx={inputSx} placeholder="—"
									onChange={(e) => onChange(row.key, { leadTimeDays: e.target.value.replace(/[^0-9]/g, '') })} />
							</TableCell>
							<TableCell sx={cellSx} align="center">
								<Checkbox size="small" checked={row.isPreferred} icon={<FuseSvgIcon size={18}>heroicons-outline:star</FuseSvgIcon>}
									checkedIcon={<FuseSvgIcon size={18} sx={{ color: 'warning.main' }}>heroicons-solid:star</FuseSvgIcon>}
									onChange={(e) => onChange(row.key, { isPreferred: e.target.checked })} />
							</TableCell>
							<SheetGridStatusCell error={errors[row.key]}>
								<Tooltip title="Quitar fila">
									<IconButton size="small" onClick={() => onRemove(row.key)}>
										<FuseSvgIcon size={16}>heroicons-outline:x-mark</FuseSvgIcon>
									</IconButton>
								</Tooltip>
							</SheetGridStatusCell>
						</TableRow>
					);
				})}
			</TableBody>
		</SheetGrid>
	);
}
