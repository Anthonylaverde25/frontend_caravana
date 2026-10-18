import { useMemo, useState } from 'react';
import { Button, FormControlLabel, InputAdornment, Stack, Switch, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { UNIT_DIMENSIONS, UnitDimension, UnitOfMeasure } from '@/core/items/domain/entities/UnitOfMeasure';
import { useSetUnitOfMeasureActive, useUnitsOfMeasure } from '@/features/items/hooks/useUnitsOfMeasure';
import UnitsGrid from './UnitsGrid';
import UnitOfMeasureDialog from './UnitOfMeasureDialog';
import SetActiveDialog from '../dialogs/SetActiveDialog';

/** Units of measure of the company: search, dimension filter with counts, create, edit, deactivate. */
export default function UnitsTab() {
	const [includeInactive, setIncludeInactive] = useState(false);
	const { data: all = [] } = useUnitsOfMeasure(true);
	const { mutateAsync: setActive } = useSetUnitOfMeasureActive();
	const [search, setSearch] = useState('');
	const [dimension, setDimension] = useState<UnitDimension | 'ALL'>('ALL');
	const [editing, setEditing] = useState<UnitOfMeasure | null | undefined>(undefined);
	const [toggling, setToggling] = useState<UnitOfMeasure | null>(null);

	const listed = useMemo(() => {
		const term = search.trim().toLowerCase();
		return all
			.filter((u) => includeInactive || u.isActive)
			.filter((u) => !term || `${u.code} ${u.name} ${u.symbol}`.toLowerCase().includes(term));
	}, [all, includeInactive, search]);
	const visible = dimension === 'ALL' ? listed : listed.filter((u) => u.dimension === dimension);

	return (
		<Stack spacing={2}>
			<Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ md: 'center' }}>
				<TextField size="small" placeholder="Buscar" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ minWidth: 220 }}
					InputProps={{ startAdornment: <InputAdornment position="start"><FuseSvgIcon size={18}>heroicons-outline:magnifying-glass</FuseSvgIcon></InputAdornment> }} />
				<ToggleButtonGroup size="small" exclusive value={dimension} onChange={(_, v) => v && setDimension(v)}
					sx={{ flexWrap: 'wrap', '& .MuiToggleButton-root': { textTransform: 'none', fontWeight: 600, px: 1.5 } }}>
					<ToggleButton value="ALL">Todas {listed.length}</ToggleButton>
					{UNIT_DIMENSIONS.map((d) => (
						<ToggleButton key={d.value} value={d.value}>{d.label} {listed.filter((u) => u.dimension === d.value).length}</ToggleButton>
					))}
				</ToggleButtonGroup>
				<FormControlLabel control={<Switch size="small" checked={includeInactive} onChange={(e) => setIncludeInactive(e.target.checked)} />}
					label="Desactivadas" sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.85rem' } }} />
				<Stack sx={{ flexGrow: 1 }} />
				<Button variant="contained" startIcon={<FuseSvgIcon size={18}>heroicons-outline:plus-circle</FuseSvgIcon>} onClick={() => setEditing(null)}
					sx={{ borderRadius: '6px', fontWeight: 700, textTransform: 'none', boxShadow: 'none' }}>
					Nueva unidad
				</Button>
			</Stack>

			<UnitsGrid units={visible} allUnits={all} onEdit={setEditing} onToggleActive={setToggling} />

			<UnitOfMeasureDialog open={editing !== undefined} unit={editing ?? undefined} onClose={() => setEditing(undefined)} />
			<SetActiveDialog
				open={!!toggling}
				onClose={() => setToggling(null)}
				subject={toggling ? `la unidad ${toggling.name}` : ''}
				activate={!toggling?.isActive}
				consequence={
					toggling?.isActive
						? 'Deja de ofrecerse para nuevos ítems. Los ítems que ya la usan no cambian.'
						: 'Vuelve a ofrecerse para nuevos ítems.'
				}
				onConfirm={() => setActive({ id: toggling!.id, active: !toggling!.isActive })}
			/>
		</Stack>
	);
}
