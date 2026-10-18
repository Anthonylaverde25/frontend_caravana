import { Alert, ListSubheader, MenuItem, Stack, TextField } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { UNIT_DIMENSIONS, UnitOfMeasure } from '@/core/items/domain/entities/UnitOfMeasure';
import { ItemBehavior, behaviorInfo } from '@/core/items/domain/rules/itemBehavior';

const CREATE = -1;

interface ItemUnitFieldProps {
	value: number;
	onChange: (unitId: number) => void;
	onCreate: () => void;
	units: UnitOfMeasure[];
	behavior: ItemBehavior;
	error?: string;
	/** The item has movements: its unit is frozen (plan 4.10). */
	locked?: boolean;
}

/** Active units grouped by dimension, the D17 warning, and "Crear unidad…" at the end. */
export default function ItemUnitField({ value, onChange, onCreate, units, behavior, error, locked = false }: ItemUnitFieldProps) {
	const groups = UNIT_DIMENSIONS.map((d) => ({ ...d, units: units.filter((u) => u.dimension === d.value && u.isActive) })).filter(
		(g) => g.units.length > 0
	);

	return (
		<Stack spacing={1}>
			<TextField
				select
				label="Unidad *"
				variant="filled"
				fullWidth
				value={value || ''}
				onChange={(e) => (Number(e.target.value) === CREATE ? onCreate() : onChange(Number(e.target.value)))}
				error={!!error}
				helperText={error}
				disabled={locked}
				sx={{ bgcolor: 'action.hover' }}
			>
				{groups.flatMap((g) => [
					<ListSubheader key={`h-${g.value}`}>{g.label}</ListSubheader>,
					...g.units.map((u) => (
						<MenuItem key={u.id} value={u.id}>
							{u.name} ({u.symbol})
						</MenuItem>
					))
				])}
				<MenuItem value={CREATE} sx={{ color: 'primary.main', fontWeight: 600, borderTop: 1, borderColor: 'divider' }}>
					<FuseSvgIcon size={16} sx={{ mr: 1 }}>
						heroicons-outline:plus
					</FuseSvgIcon>
					Crear unidad…
				</MenuItem>
			</TextField>
			<Alert severity="info" sx={{ fontSize: '0.8rem', py: 0.5 }}>
				{locked
					? 'Tiene movimientos: la unidad ya no se puede cambiar.'
					: `La unidad no se podrá cambiar cuando el ítem tenga movimientos. ${behaviorInfo(behavior).unitHint}`}
			</Alert>
		</Stack>
	);
}
