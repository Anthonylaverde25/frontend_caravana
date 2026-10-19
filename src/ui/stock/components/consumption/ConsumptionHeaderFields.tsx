import { useState } from 'react';
import { Alert, Button, Stack, TextField, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { Batch } from '@/core/batches/domain/entities/Batch';
import OwnBatchPickerDialog from '@/ui/batches/components/external/OwnBatchPickerDialog';
import { filledInputProps } from '@/ui/weaning-orders/components/form/formStyles';
import WarehouseSelectField from '../cells/WarehouseSelectField';
import { ConsumptionHeader } from './consumptionState';

interface ConsumptionHeaderFieldsProps {
	header: ConsumptionHeader;
	onChange: (patch: Partial<ConsumptionHeader>) => void;
	batches: Batch[];
	/** Opened from the batch (/herd): it stays fixed. */
	fixedBatch: boolean;
	errors: Record<string, string>;
}

const today = (): string => new Date().toISOString().slice(0, 10);

/** Which batch received it and how many heads (D22, declared: DS9), and when. Without a batch it is general use. */
export default function ConsumptionHeaderFields({ header, onChange, batches, fixedBatch, errors }: ConsumptionHeaderFieldsProps) {
	const [picking, setPicking] = useState(false);
	const batch = batches.find((b) => b.id === header.batchId);
	const batchHeads = batch?.head_count ?? null;
	const declared = Number(header.heads) || 0;

	return (
		<Stack spacing={2}>
			<Stack spacing={0.5}>
				<Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
					Lote
				</Typography>
				<Stack direction="row" spacing={1} alignItems="center">
					<Button variant="outlined" disabled={fixedBatch} onClick={() => setPicking(true)}
						startIcon={<FuseSvgIcon size={16}>heroicons-outline:rectangle-stack</FuseSvgIcon>}
						sx={{ flex: 1, justifyContent: 'flex-start', textTransform: 'none', fontWeight: 600, borderRadius: '6px', borderColor: errors.batch_id ? 'error.main' : undefined }}>
						{header.batchId ? `${header.batchName}${batchHeads !== null ? ` · ${batchHeads} cab.` : ''}` : 'Sin lote (uso general)'}
					</Button>
					{header.batchId && !fixedBatch && (
						<Button onClick={() => onChange({ batchId: null, batchName: null, heads: '' })} sx={{ textTransform: 'none', fontWeight: 600 }}>
							Quitar lote
						</Button>
					)}
				</Stack>
				{errors.batch_id && <Typography variant="caption" color="error">{errors.batch_id}</Typography>}
			</Stack>
			<WarehouseSelectField value={header.warehouseId} onChange={(warehouseId) => onChange({ warehouseId })} error={errors.warehouse_id} />
			<Stack direction="row" spacing={1.5}>
				<TextField label="Cabezas tratadas" variant="filled" fullWidth value={header.heads} disabled={!header.batchId} InputProps={filledInputProps}
					inputProps={{ inputMode: 'numeric' }} onChange={(e) => onChange({ heads: e.target.value.replace(/\D/g, '') })}
					error={!!errors.heads_treated} helperText={errors.heads_treated} />
				<TextField label="Fecha" type="date" variant="filled" fullWidth value={header.occurredAt} InputProps={filledInputProps} InputLabelProps={{ shrink: true }}
					inputProps={{ max: today() }} onChange={(e) => onChange({ occurredAt: e.target.value })} error={!!errors.occurred_at} helperText={errors.occurred_at} />
			</Stack>
			{header.batchId && batchHeads !== null && declared > 0 && declared !== batchHeads && (
				<Alert severity="warning" sx={{ fontSize: '0.8rem', py: 0.5 }}>
					{declared} de {batchHeads} cabezas del lote. Se registra igual: las cabezas son las que recibieron el consumo.
				</Alert>
			)}
			<OwnBatchPickerDialog open={picking} batches={batches} selectedId={header.batchId ?? ''} subtitle="Lote que recibe el consumo"
				onClose={() => setPicking(false)}
				onPick={(b) => {
					onChange({ batchId: b.id, batchName: b.name, heads: b.head_count ? String(b.head_count) : '' });
					setPicking(false);
				}} />
		</Stack>
	);
}
