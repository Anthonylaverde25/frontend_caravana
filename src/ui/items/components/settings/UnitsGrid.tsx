import { Fragment } from 'react';
import { TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { SheetGrid } from 'src/components/sheet-grid/SheetGrid';
import { SheetGridTagCell } from 'src/components/sheet-grid/SheetGridTagCell';
import { SheetGridGroupRow } from 'src/components/sheet-grid/SheetGridGroupRow';
import { SheetGridStatusCell } from 'src/components/sheet-grid/SheetGridStatusCell';
import { SheetGridEmptyRow } from 'src/components/sheet-grid/SheetGridEmptyRow';
import { useGridCellStyles } from 'src/components/sheet-grid/useGridCellStyles';
import { UNIT_DIMENSIONS, UnitOfMeasure } from '@/core/items/domain/entities/UnitOfMeasure';
import { baseOf, describeFactor } from '@/core/items/domain/rules/unitConversion';
import RowActionsMenu from './RowActionsMenu';

interface UnitsGridProps {
	units: UnitOfMeasure[];
	/** Every unit, to find each dimension's base. */
	allUnits: UnitOfMeasure[];
	onEdit: (unit: UnitOfMeasure) => void;
	onToggleActive: (unit: UnitOfMeasure) => void;
}

const COLUMNS = 7;

/** Units grouped by dimension; a base has no "Desactivar" (DB2). */
export default function UnitsGrid({ units, allUnits, onEdit, onToggleActive }: UnitsGridProps) {
	const { headSx, indexSx, textCellSx } = useGridCellStyles();
	const groups = UNIT_DIMENSIONS.map((d) => ({ ...d, units: units.filter((u) => u.dimension === d.value) })).filter((g) => g.units.length);
	let row = 0;

	return (
		<SheetGrid minWidth={760} maxHeight={{ xs: 520, lg: 'calc(100vh - 340px)' }}>
			<TableHead>
				<TableRow>
					<TableCell sx={indexSx}>#</TableCell>
					<TableCell sx={{ ...headSx, width: 120 }}>Código</TableCell>
					<TableCell sx={headSx}>Nombre</TableCell>
					<TableCell sx={{ ...headSx, width: 90 }}>Símbolo</TableCell>
					<TableCell sx={{ ...headSx, width: 220 }}>Equivale a</TableCell>
					<TableCell sx={{ ...headSx, width: 80 }} align="right">Ítems</TableCell>
					<TableCell sx={{ ...headSx, width: 48 }} />
				</TableRow>
			</TableHead>
			<TableBody>
				{groups.length === 0 && <SheetGridEmptyRow colSpan={COLUMNS}>Ninguna unidad coincide.</SheetGridEmptyRow>}
				{groups.map((g) => (
					<Fragment key={g.value}>
						<SheetGridGroupRow colSpan={COLUMNS} name={g.label} caption={`${g.units.length}`} />
						{g.units.map((u) => {
							row += 1;
							const muted = u.isActive ? {} : { color: 'text.disabled' };
							return (
								<TableRow key={u.id} hover>
									<TableCell sx={indexSx}>{row}</TableCell>
									<SheetGridTagCell tag={u.code} caption={u.isBase ? 'base' : undefined} />
									<TableCell sx={{ ...textCellSx, fontWeight: 600, ...muted }}>{u.name}</TableCell>
									<TableCell sx={{ ...textCellSx, ...muted }}>{u.symbol}</TableCell>
									<TableCell sx={{ ...textCellSx, ...muted }}>{describeFactor(u, baseOf(allUnits, u.dimension))}</TableCell>
									<TableCell sx={{ ...textCellSx, ...muted }} align="right">{u.itemsCount}</TableCell>
									<SheetGridStatusCell info={u.isActive ? undefined : 'Desactivada'}>
										<RowActionsMenu
											actions={[
												{ label: 'Editar', onClick: () => onEdit(u) },
												...(u.isBase ? [] : [{ label: u.isActive ? 'Desactivar' : 'Reactivar', onClick: () => onToggleActive(u) }])
											]}
										/>
									</SheetGridStatusCell>
								</TableRow>
							);
						})}
					</Fragment>
				))}
			</TableBody>
		</SheetGrid>
	);
}
