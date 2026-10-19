import { Stack, TextField } from '@mui/material';
import { filledInputProps } from '@/ui/weaning-orders/components/form/formStyles';
import WarehouseSelectField from '../cells/WarehouseSelectField';
import { TransferHeader } from './transferState';

interface TransferHeaderFieldsProps {
	header: TransferHeader;
	onChange: (patch: Partial<TransferHeader>) => void;
	errors: Record<string, string>;
}

const today = (): string => new Date().toISOString().slice(0, 10);

/** From which active warehouse to which, and when (DD7). */
export default function TransferHeaderFields({ header, onChange, errors }: TransferHeaderFieldsProps) {
	return (
		<Stack spacing={2}>
			<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
				<WarehouseSelectField alwaysShow label="Origen" value={header.fromWarehouseId} error={errors.from_warehouse_id}
					onChange={(fromWarehouseId) => onChange({ fromWarehouseId, toWarehouseId: header.toWarehouseId === fromWarehouseId ? null : header.toWarehouseId })} />
				<WarehouseSelectField alwaysShow label="Destino" value={header.toWarehouseId ?? -1} excludeId={header.fromWarehouseId} error={errors.to_warehouse_id}
					onChange={(toWarehouseId) => onChange({ toWarehouseId })} />
			</Stack>
			<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
				<TextField label="Fecha" type="date" variant="filled" fullWidth value={header.occurredAt} InputProps={filledInputProps} InputLabelProps={{ shrink: true }}
					inputProps={{ max: today() }} onChange={(e) => onChange({ occurredAt: e.target.value })} error={!!errors.occurred_at} helperText={errors.occurred_at} />
				<TextField label="Notas" variant="filled" fullWidth value={header.notes} InputProps={filledInputProps} onChange={(e) => onChange({ notes: e.target.value })} />
			</Stack>
		</Stack>
	);
}
