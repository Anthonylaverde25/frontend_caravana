import { Box, IconButton, TableBody, TableCell, TableHead, TableRow, Tooltip } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { SheetGrid } from 'src/components/sheet-grid/SheetGrid';
import { SheetGridStatusCell } from 'src/components/sheet-grid/SheetGridStatusCell';
import { SheetGridEmptyRow } from 'src/components/sheet-grid/SheetGridEmptyRow';
import { useGridCellStyles } from 'src/components/sheet-grid/useGridCellStyles';
import { CategoryNode } from '@/core/items/domain/rules/categoryTree';
import RowActionsMenu from './RowActionsMenu';

interface CategoryTreeGridProps {
	/** Depth-first rows already filtered by the tab. */
	rows: CategoryNode[];
	folded: Set<number>;
	onToggleFold: (id: number) => void;
	onAddChild: (category: CategoryNode) => void;
	onEdit: (category: CategoryNode) => void;
	onToggleActive: (category: CategoryNode) => void;
}

const COLUMNS = 4;

/** The category tree as grid rows: indentation by level and a chevron to fold a branch. */
export default function CategoryTreeGrid({ rows, folded, onToggleFold, onAddChild, onEdit, onToggleActive }: CategoryTreeGridProps) {
	const { headSx, indexSx, textCellSx, cellSx } = useGridCellStyles();

	return (
		<SheetGrid minWidth={560} maxHeight={{ xs: 520, lg: 'calc(100vh - 340px)' }}>
			<TableHead>
				<TableRow>
					<TableCell sx={indexSx}>#</TableCell>
					<TableCell sx={headSx}>Categoría</TableCell>
					<TableCell sx={{ ...headSx, width: 80 }} align="right">Ítems</TableCell>
					<TableCell sx={{ ...headSx, width: 48 }} />
				</TableRow>
			</TableHead>
			<TableBody>
				{rows.length === 0 && <SheetGridEmptyRow colSpan={COLUMNS}>Ninguna categoría coincide.</SheetGridEmptyRow>}
				{rows.map((c, index) => {
					const muted = c.isActive ? {} : { color: 'text.disabled' };
					return (
						<TableRow key={c.id} hover>
							<TableCell sx={indexSx}>{index + 1}</TableCell>
							<TableCell sx={{ ...cellSx, height: 40 }}>
								<Box sx={{ display: 'flex', alignItems: 'center', pl: 0.5 + c.depth * 3 }}>
									{c.children.length > 0 ? (
										<IconButton size="small" onClick={() => onToggleFold(c.id)}>
											<FuseSvgIcon size={16}>{folded.has(c.id) ? 'heroicons-outline:chevron-right' : 'heroicons-outline:chevron-down'}</FuseSvgIcon>
										</IconButton>
									) : (
										<Box sx={{ width: 34 }} />
									)}
									<Box component="span" sx={{ fontSize: '0.85rem', fontWeight: c.depth === 0 ? 700 : 500, ...muted }}>
										{c.name}
									</Box>
									{c.isSystem && (
										<Tooltip title="Categoría del sistema: no se edita ni se desactiva">
											<Box component="span" sx={{ display: 'inline-flex', ml: 0.75, color: 'text.secondary' }}>
												<FuseSvgIcon size={14}>heroicons-outline:lock-closed</FuseSvgIcon>
											</Box>
										</Tooltip>
									)}
								</Box>
							</TableCell>
							<TableCell sx={{ ...textCellSx, ...muted }} align="right">{c.itemsCount}</TableCell>
							<SheetGridStatusCell info={c.isActive ? undefined : 'Desactivada: no se ofrece para nuevos ítems'}>
								<RowActionsMenu
									actions={[
										{ label: 'Agregar subcategoría', onClick: () => onAddChild(c), disabled: !c.isActive },
										...(c.isSystem
											? []
											: [
													{ label: 'Editar', onClick: () => onEdit(c) },
													{ label: c.isActive ? 'Desactivar' : 'Reactivar', onClick: () => onToggleActive(c) }
												])
									]}
								/>
							</SheetGridStatusCell>
						</TableRow>
					);
				})}
			</TableBody>
		</SheetGrid>
	);
}
