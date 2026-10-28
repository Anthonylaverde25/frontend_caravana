import { Chip, IconButton, Stack, TableBody, TableCell, TableHead, TableRow, Tooltip } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import SheetGrid from '@/components/sheet-grid/SheetGrid';
import SheetGridEmptyRow from '@/components/sheet-grid/SheetGridEmptyRow';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';
import { PartnerContact } from '@/core/partners/domain/entities/PartnerContact';

interface PartnerContactsTableProps {
	contacts: PartnerContact[];
	busy: boolean;
	onEdit: (contact: PartnerContact) => void;
	onMakeDefault: (contact: PartnerContact) => void;
	onRemove: (contact: PartnerContact) => void;
}

const COLUMNS = [
	{ key: 'name', label: 'Nombre', width: 150 },
	{ key: 'position', label: 'Cargo', width: 110 },
	{ key: 'phone', label: 'Teléfono', width: 130 },
	{ key: 'email', label: 'Email', width: 180 },
	{ key: 'default', label: 'Predeterminado', width: 130 }
] as const;

/** The contact persons of a partner, the default one first (spreadsheet grid look). */
export default function PartnerContactsTable({
	contacts,
	busy,
	onEdit,
	onMakeDefault,
	onRemove
}: PartnerContactsTableProps) {
	const { headSx, indexSx, textCellSx: gridTextSx, cellSx, zebraBg } = useGridCellStyles();
	// One value per line: a long email scrolls the grid sideways instead of wrapping the row.
	const textCellSx = { ...gridTextSx, whiteSpace: 'nowrap' } as const;

	return (
		<SheetGrid
			minWidth={44 + COLUMNS.reduce((sum, column) => sum + column.width, 0) + 88}
			maxHeight={320}
		>
			<TableHead>
				<TableRow>
					<TableCell sx={indexSx}>#</TableCell>
					{COLUMNS.map((column) => (
						<TableCell
							key={column.key}
							sx={{ ...headSx, width: column.width }}
						>
							{column.label}
						</TableCell>
					))}
					<TableCell sx={{ ...headSx, width: 88 }} />
				</TableRow>
			</TableHead>
			<TableBody>
				{contacts.length === 0 ? (
					<SheetGridEmptyRow colSpan={COLUMNS.length + 2}>
						Sin personas de contacto. Agregá la primera: quedará como predeterminada.
					</SheetGridEmptyRow>
				) : (
					contacts.map((contact, index) => (
						<TableRow
							key={contact.id}
							sx={{ bgcolor: index % 2 === 1 ? zebraBg : undefined }}
						>
							<TableCell sx={indexSx}>{index + 1}</TableCell>
							<TableCell sx={{ ...textCellSx, fontWeight: 600 }}>{contact.name}</TableCell>
							<TableCell sx={textCellSx}>{contact.position ?? '—'}</TableCell>
							<TableCell sx={{ ...textCellSx, fontVariantNumeric: 'tabular-nums' }}>
								{contact.phone}
							</TableCell>
							<TableCell sx={textCellSx}>{contact.email ?? '—'}</TableCell>
							<TableCell sx={textCellSx}>
								{contact.is_default ? (
									<Chip
										label="Predeterminado"
										size="small"
										color="primary"
										sx={{ fontWeight: 600, fontSize: '0.7rem', height: 22 }}
									/>
								) : (
									<Chip
										label="Marcar como predeterminado"
										size="small"
										variant="outlined"
										disabled={busy}
										onClick={() => onMakeDefault(contact)}
										sx={{ fontSize: '0.7rem', height: 22 }}
									/>
								)}
							</TableCell>
							<TableCell sx={{ ...cellSx, px: 0.5 }}>
								<Stack
									direction="row"
									justifyContent="center"
								>
									<Tooltip title="Editar">
										<IconButton
											size="small"
											onClick={() => onEdit(contact)}
										>
											<FuseSvgIcon size={16}>heroicons-outline:pencil-square</FuseSvgIcon>
										</IconButton>
									</Tooltip>
									<Tooltip title="Quitar">
										<IconButton
											size="small"
											disabled={busy}
											onClick={() => onRemove(contact)}
										>
											<FuseSvgIcon size={16}>heroicons-outline:trash</FuseSvgIcon>
										</IconButton>
									</Tooltip>
								</Stack>
							</TableCell>
						</TableRow>
					))
				)}
			</TableBody>
		</SheetGrid>
	);
}
