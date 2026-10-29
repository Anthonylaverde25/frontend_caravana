import React, { useState } from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { sectionTitleSx } from '@/ui/weaning-orders/components/form/formStyles';
import type { ExitLoadForm } from '../../hooks/useExitLoadForm';
import type { ExitCandidate } from '../../hooks/useExitCandidates';
import AddExitAnimalsBar from './AddExitAnimalsBar';
import ExitGridToolbar, { ExitGridFilter } from './ExitGridToolbar';
import ExitAnimalsGrid from './ExitAnimalsGrid';
import { rowError } from './exitRows';

interface ExitAnimalsSectionProps {
	form: ExitLoadForm;
	candidates: ExitCandidate[];
	batches: { id: number; name: string; count: number }[];
}

/** A load this long needs search and filters; a shorter one is read at a glance. */
const LONG_LOAD = 8;

const SUBTITLES = {
	issue: 'Agregá lotes completos o caravanas sueltas y desmarcá las que no van. El peso y el precio se cargan el día de la carga.',
	execute: 'Marcá los que subieron al camión y su peso. Los que no suben quedan pendientes en la orden.',
	register: 'Agregá lotes completos o caravanas sueltas y desmarcá las que no salieron. El peso, si lo tenés.'
} as const;

const normalize = (value: string): string => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** The animals of the load, on the right of the sheet: how they get in, and the ones that go. */
export const ExitAnimalsSection: React.FC<ExitAnimalsSectionProps> = ({ form, candidates, batches }) => {
	const [search, setSearch] = useState('');
	const [filter, setFilter] = useState<ExitGridFilter>('ALL');
	const hasError = (row: (typeof form.rows)[number]) => !!rowError(form.errors.byRow[row.caravanId]);
	const canFillWeights =
		form.mode !== 'issue' &&
		!(form.pricing.mode === 'PER_KG' && form.pricing.weightSource === 'LOAD') &&
		form.rows.some((row) => row.leaves && row.weight === '' && row.lastWeight != null);
	const longLoad = form.rows.length > LONG_LOAD;

	const term = normalize(search.trim());
	const visible = form.rows.filter(
		(row) =>
			(filter === 'ALL' || (filter === 'UNMARKED' && !row.leaves) || (filter === 'NOTICE' && hasError(row))) &&
			(term === '' ||
				[row.label, row.batchName ?? '', row.categoryName ?? ''].some((text) => normalize(text).includes(term)))
	);

	return (
		<Paper
			variant="outlined"
			sx={{ p: { xs: 2, md: 2.5 }, borderRadius: '8px' }}
		>
			<Box sx={{ mb: 1.5 }}>
				<Typography sx={{ ...sectionTitleSx, mb: 0.5 }}>
					Animales {form.mode === 'issue' ? 'que van a salir' : 'que salieron'}
				</Typography>
				<Typography
					variant="caption"
					color="text.secondary"
				>
					{SUBTITLES[form.mode]}
				</Typography>
			</Box>
			<Stack spacing={1.5}>
				{form.mode !== 'execute' && (
					<AddExitAnimalsBar
						candidates={candidates}
						batches={batches}
						selectedIds={form.rows.map((row) => row.caravanId)}
						onAdd={form.addRows}
						onRemove={form.removeRows}
					/>
				)}
				{(longLoad || canFillWeights) && (
					<ExitGridToolbar
						mode={form.mode}
						showFilters={longLoad}
						search={search}
						onSearchChange={setSearch}
						filter={filter}
						onFilterChange={setFilter}
						counts={{
							ALL: form.rows.length,
							NOTICE: form.rows.filter(hasError).length,
							UNMARKED: form.rows.filter((row) => !row.leaves).length
						}}
						onFillWeights={canFillWeights ? form.fillLastWeights : undefined}
					/>
				)}
				<ExitAnimalsGrid
					form={form}
					rows={visible}
				/>
			</Stack>
		</Paper>
	);
};

export default ExitAnimalsSection;
