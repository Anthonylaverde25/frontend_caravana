import React from 'react';
import { TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { SheetGrid } from 'src/components/sheet-grid/SheetGrid';
import { SheetGridEmptyRow } from 'src/components/sheet-grid/SheetGridEmptyRow';
import { SheetGridGroupRow } from 'src/components/sheet-grid/SheetGridGroupRow';
import { useGridCellStyles } from 'src/components/sheet-grid/useGridCellStyles';
import { PendingDeliveryNote } from '@/core/fiscal/domain/entities/DeliveryNote';
import PendingDeliveryNoteRow from './PendingDeliveryNoteRow';

interface PendingDeliveryNotesGridProps {
	notes: PendingDeliveryNote[];
	loading: boolean;
	selected: number[];
	onSelect: (ids: number[]) => void;
	onOpen: (note: PendingDeliveryNote) => void;
}

const COLUMNS = 9;

/** "Remitos a facturar", grouped by provider: an invoice joins notes of one provider (DC5). */
export default function PendingDeliveryNotesGrid({
	notes,
	loading,
	selected,
	onSelect,
	onOpen
}: PendingDeliveryNotesGridProps) {
	const { headSx, indexSx } = useGridCellStyles();
	const providers = [...new Map(notes.map((n) => [n.providerId, n.providerName])).entries()];
	const toggle = (ids: number[], on: boolean) =>
		onSelect(on ? [...new Set([...selected, ...ids])] : selected.filter((id) => !ids.includes(id)));
	const head = (label: string, width?: number, align?: 'right') => (
		<TableCell
			sx={{ ...headSx, ...(width ? { width } : {}) }}
			align={align}
		>
			{label}
		</TableCell>
	);

	let index = 0;

	return (
		<SheetGrid
			minWidth={980}
			maxHeight={{ xs: 520, lg: 'calc(100vh - 330px)' }}
		>
			<TableHead>
				<TableRow>
					<TableCell sx={indexSx} />
					{head('Remito', 170)}
					{head('Fecha', 110)}
					{head('Días', 70, 'right')}
					{head('Precios', 90)}
					{head('Renglones', 100, 'right')}
					{head('Neto', 140, 'right')}
					{head('Sin valorizar')}
					<TableCell sx={{ ...headSx, width: 48 }} />
				</TableRow>
			</TableHead>
			<TableBody>
				{loading && <SheetGridEmptyRow colSpan={COLUMNS}>Cargando remitos…</SheetGridEmptyRow>}
				{!loading && notes.length === 0 && (
					<SheetGridEmptyRow colSpan={COLUMNS}>No hay remitos esperando factura.</SheetGridEmptyRow>
				)}
				{providers.map(([providerId, name]) => {
					const group = notes.filter((n) => n.providerId === providerId);
					const ids = group.map((n) => n.id);
					const marked = ids.filter((id) => selected.includes(id)).length;
					return (
						<React.Fragment key={providerId}>
							<SheetGridGroupRow
								colSpan={COLUMNS}
								name={name ?? 'Proveedor'}
								caption={`${group.length} remito(s)`}
								check={{
									checked: marked === ids.length,
									indeterminate: marked > 0 && marked < ids.length,
									onChange: (on) => toggle(ids, on)
								}}
							/>
							{group.map((note) => (
								<PendingDeliveryNoteRow
									key={note.id}
									note={note}
									index={index++}
									selected={selected.includes(note.id)}
									onToggle={() => toggle([note.id], !selected.includes(note.id))}
									onOpen={() => onOpen(note)}
								/>
							))}
						</React.Fragment>
					);
				})}
			</TableBody>
		</SheetGrid>
	);
}
