import React, { useState } from 'react';
import { Button, Checkbox, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import SheetGrid from '@/components/sheet-grid/SheetGrid';
import SheetGridEmptyRow from '@/components/sheet-grid/SheetGridEmptyRow';
import SheetGridGroupRow from '@/components/sheet-grid/SheetGridGroupRow';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';
import type { ExitLoadForm } from '../../hooks/useExitLoadForm';
import { EXIT_GRID_COLUMNS, type ExitRow } from './exitRows';
import ExitAnimalRow from './ExitAnimalRow';

interface ExitAnimalsGridProps {
	form: ExitLoadForm;
	/** The rows the search and the filter leave on screen. */
	rows: ExitRow[];
}

interface BatchGroup {
	key: string;
	name: string;
	activityName: string | null;
	rows: ExitRow[];
}

/** The load by batch, in the order each batch first came in. */
const groupByBatch = (rows: ExitRow[]): BatchGroup[] => {
	const groups = new Map<string, BatchGroup>();

	rows.forEach((row) => {
		const key = row.batchId != null ? String(row.batchId) : (row.batchName ?? 'none');
		const group = groups.get(key) ?? {
			key,
			name: row.batchName ?? 'Sin lote',
			activityName: row.activityName,
			rows: []
		};
		group.rows.push(row);
		groups.set(key, group);
	});

	return [...groups.values()];
};

/**
 * The animals of the load in the spreadsheet pattern, grouped by the batch they leave from. A
 * batch comes in whole and marked; the ones that do not go are unmarked, by row or by group, and
 * stay in sight to be marked again.
 */
export const ExitAnimalsGrid: React.FC<ExitAnimalsGridProps> = ({ form, rows }) => {
	const { headSx, indexSx } = useGridCellStyles();
	const [folded, setFolded] = useState<Set<string>>(new Set());
	const allLeave = form.rows.length > 0 && form.rows.every((row) => row.leaves);
	const someLeave = form.rows.some((row) => row.leaves);
	const weightFromLoad = form.pricing.mode === 'PER_KG' && form.pricing.weightSource === 'LOAD';
	const groups = groupByBatch(rows);
	let position = 0;

	const toggleFold = (key: string) =>
		setFolded((current) => {
			const next = new Set(current);

			if (next.has(key)) next.delete(key);
			else next.add(key);

			return next;
		});

	return (
		<SheetGrid
			minWidth={680}
			maxHeight={{ xs: 480, lg: 'calc(100vh - 330px)' }}
		>
			<TableHead>
				<TableRow>
					<TableCell sx={{ ...indexSx, ...headSx, width: 44, textAlign: 'center' }}>
						<Checkbox
							size="small"
							checked={allLeave}
							indeterminate={someLeave && !allLeave}
							disabled={form.rows.length === 0}
							onChange={(e) =>
								form.setLeaves(
									form.rows.map((row) => row.caravanId),
									e.target.checked
								)
							}
							inputProps={{ 'aria-label': 'Marcar todos' }}
						/>
					</TableCell>
					<TableCell sx={{ ...headSx, minWidth: 190 }}>Caravana</TableCell>
					<TableCell sx={{ ...headSx, minWidth: 170 }}>Lote · Actividad</TableCell>
					<TableCell sx={{ ...headSx, width: 130 }}>
						{weightFromLoad ? 'Kg (estimado)' : 'Peso (kg)'}
					</TableCell>
					<TableCell sx={{ ...headSx, width: 150, textAlign: 'right' }}>Importe</TableCell>
					<TableCell sx={{ ...headSx, width: 48, borderRight: 0 }} />
				</TableRow>
			</TableHead>
			<TableBody>
				{rows.length === 0 && (
					<SheetGridEmptyRow colSpan={EXIT_GRID_COLUMNS}>
						{form.rows.length === 0
							? 'Agregá uno o varios lotes completos, buscá una caravana o pegá la lista que te pasaron.'
							: 'Ningún animal coincide con la búsqueda o el filtro.'}
					</SheetGridEmptyRow>
				)}
				{groups.map((group) => {
					const marked = group.rows.filter((row) => row.leaves).length;
					const ids = group.rows.map((row) => row.caravanId);
					const isFolded = folded.has(group.key);

					return (
						<React.Fragment key={group.key}>
							<SheetGridGroupRow
								colSpan={EXIT_GRID_COLUMNS}
								name={group.name}
								caption={`${group.activityName ? `${group.activityName} · ` : ''}${marked} de ${group.rows.length} ${form.mode === 'execute' ? 'subieron' : 'salen'}`}
								check={{
									checked: marked === group.rows.length,
									indeterminate: marked > 0 && marked < group.rows.length,
									onChange: (checked) => form.setLeaves(ids, checked)
								}}
								fold={{ open: !isFolded, onToggle: () => toggleFold(group.key) }}
								trailing={
									form.mode !== 'execute' && (
										<Button
											size="small"
											color="inherit"
											onClick={() => form.removeRows(ids)}
											sx={{
												textTransform: 'none',
												fontWeight: 600,
												color: 'text.secondary',
												py: 0
											}}
										>
											Quitar lote
										</Button>
									)
								}
							/>
							{!isFolded &&
								group.rows.map((row) => (
									<ExitAnimalRow
										key={row.caravanId}
										mode={form.mode}
										row={row}
										index={position++}
										priced={form.priced.get(row.caravanId)}
										weightFromLoad={weightFromLoad}
										calves={form.calves.get(row.caravanId)}
										decision={form.decisions[row.caravanId]}
										errors={form.errors.byRow[row.caravanId]}
										onChange={(patch) => form.updateRow(row.caravanId, patch)}
										onDecision={(decision) => form.setDecision(row.caravanId, decision)}
									/>
								))}
						</React.Fragment>
					);
				})}
			</TableBody>
		</SheetGrid>
	);
};

export default ExitAnimalsGrid;
