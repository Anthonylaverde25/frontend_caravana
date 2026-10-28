import { useState } from 'react';
import { Divider, MenuItem, Stack, TextField } from '@mui/material';
import { Warehouse } from '@/core/stock/domain/entities/ItemStock';
import { defaultSuffix, warehouseLabel } from '@/core/stock/domain/rules/warehouseRules';
import { usePartners } from '@/features/partners/hooks/usePartners';
import { Partner } from '@/core/partners/domain/entities/Partner';
import { filledInputProps } from '@/ui/weaning-orders/components/form/formStyles';
import CreatePartnerDialog from '@/ui/partners/components/CreatePartnerDialog';
import WarehouseFormDialog from '@/ui/warehouses/components/WarehouseFormDialog';
import { SemenReceiptHeader } from './receiptState';
import { ITEM_SELLERS } from '@/core/partners/domain/entities/PartnerRole';

interface SemenReceiptHeaderFieldsProps {
	header: SemenReceiptHeader;
	tanks: Warehouse[];
	errors: Record<string, string>;
	onChange: (patch: Partial<SemenReceiptHeader>) => void;
}

const NEW = '__new';
const today = (): string => new Date().toISOString().slice(0, 10);

/**
 * Date, tank (active tanks only, "+ Nuevo termo" when there is none or another is needed, SW3) and the
 * provider the semen came from: existing or created right here, only as origin (no document).
 */
export default function SemenReceiptHeaderFields({ header, tanks, errors, onChange }: SemenReceiptHeaderFieldsProps) {
	const { data: providers = [] } = usePartners(ITEM_SELLERS);
	const [creatingTank, setCreatingTank] = useState(false);
	const [creatingProvider, setCreatingProvider] = useState(false);

	return (
		<Stack spacing={2}>
			<TextField label="Fecha" type="date" variant="filled" fullWidth value={header.occurredAt} InputProps={filledInputProps} InputLabelProps={{ shrink: true }}
				inputProps={{ max: today() }} onChange={(e) => onChange({ occurredAt: e.target.value })} error={!!errors.occurred_at} helperText={errors.occurred_at} />
			<TextField select label="Termo" variant="filled" fullWidth value={header.warehouseId ?? ''} InputProps={filledInputProps}
				onChange={(e) => (e.target.value === NEW ? setCreatingTank(true) : onChange({ warehouseId: Number(e.target.value) }))}
				error={!!errors.warehouse_id} helperText={errors.warehouse_id ?? (tanks.length === 0 ? 'Todavía no hay termos: creá el primero.' : undefined)}>
				{tanks.map((t) => (
					<MenuItem key={t.id} value={t.id}>{warehouseLabel(t)}{defaultSuffix(t)}</MenuItem>
				))}
				{tanks.length > 0 && <Divider />}
				<MenuItem value={NEW} sx={{ fontWeight: 700, color: 'primary.main' }}>+ Nuevo termo…</MenuItem>
			</TextField>
			<TextField select label="Proveedor (opcional)" variant="filled" fullWidth value={header.providerId ?? ''} InputProps={filledInputProps}
				SelectProps={{ displayEmpty: true }} InputLabelProps={{ shrink: true }}
				onChange={(e) => (e.target.value === NEW ? setCreatingProvider(true) : onChange({ providerId: e.target.value === '' ? null : Number(e.target.value) }))}
				error={!!errors.provider_id} helperText={errors.provider_id ?? 'El centro de IA o la cabaña. Vacío: semen propio o que ya estaba.'}>
				<MenuItem value="">Sin proveedor</MenuItem>
				{providers.map((p: Partner) => (
					<MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
				))}
				<Divider />
				<MenuItem value={NEW} sx={{ fontWeight: 700, color: 'primary.main' }}>+ Nuevo proveedor…</MenuItem>
			</TextField>
			<TextField label="Notas" variant="filled" fullWidth multiline value={header.notes} InputProps={filledInputProps} onChange={(e) => onChange({ notes: e.target.value })} />

			<WarehouseFormDialog open={creatingTank} defaultKind="CRYO_TANK" onClose={() => setCreatingTank(false)} onSaved={(w) => onChange({ warehouseId: w.id })} />
			<CreatePartnerDialog open={creatingProvider} onClose={() => setCreatingProvider(false)} defaultRoles={['SUPPLIER_ITEMS']}
				onSuccess={(created?: Partner) => created?.id && onChange({ providerId: created.id })} />
		</Stack>
	);
}
