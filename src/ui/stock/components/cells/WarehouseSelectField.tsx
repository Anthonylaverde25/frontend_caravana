import { MenuItem, TextField } from '@mui/material';
import { useWarehouses } from '@/features/stock/hooks/useWarehouses';
import { activeWarehouses, defaultSuffix, defaultWarehouse, needsWarehousePicker, warehouseLabel } from '@/core/stock/domain/rules/warehouseRules';
import { filledInputProps } from '@/ui/weaning-orders/components/form/formStyles';

interface WarehouseSelectFieldProps {
	/** Null: the company's default (DD6). */
	value: number | null;
	onChange: (warehouseId: number) => void;
	label?: string;
	error?: string;
	/** Left out of the options (the origin, in a transfer's destination). */
	excludeId?: number | null;
	/** A transfer always shows its warehouses; a load hides the field with a single active one. */
	alwaysShow?: boolean;
}

/**
 * The warehouse an internal operation declares (DD6): active ones only, preloaded with the default,
 * and not drawn at all while the company has a single active warehouse.
 */
export default function WarehouseSelectField({ value, onChange, label = 'Almacén', error, excludeId, alwaysShow = false }: WarehouseSelectFieldProps) {
	const { data: warehouses = [] } = useWarehouses();

	if (!alwaysShow && !needsWarehousePicker(warehouses)) return null;

	const options = activeWarehouses(warehouses).filter((w) => w.id !== excludeId);
	const selected = value ?? defaultWarehouse(warehouses)?.id ?? '';

	return (
		<TextField select label={label} variant="filled" fullWidth value={options.some((w) => w.id === selected) ? selected : ''}
			InputProps={filledInputProps} onChange={(e) => onChange(Number(e.target.value))} error={!!error} helperText={error}>
			{options.map((w) => (
				<MenuItem key={w.id} value={w.id}>
					{warehouseLabel(w)}{w.kind === 'CRYO_TANK' && !w.isDefault ? ' (termo)' : ''}{defaultSuffix(w)}
				</MenuItem>
			))}
		</TextField>
	);
}
