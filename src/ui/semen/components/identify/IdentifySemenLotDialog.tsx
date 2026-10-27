import { useEffect, useState } from 'react';
import { Alert, MenuItem, Stack, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { SheetGrid } from 'src/components/sheet-grid/SheetGrid';
import { useGridCellStyles } from 'src/components/sheet-grid/useGridCellStyles';
import { useIdentifySemenLot, useSemenLots, useSemenUnidentified } from '@/features/semen/hooks/useSemen';
import { straws } from '@/core/semen/domain/rules/semenLabels';
import { formatDate } from '@/core/stock/domain/rules/quantityFormat';
import CatalogDialogFrame from '@/ui/items/components/CatalogDialogFrame';
import { readApiErrors } from '@/ui/items/components/apiErrors';
import IdentifyShareRow, { IdentifyShare, emptyShare } from './IdentifyShareRow';

export interface IdentifyTarget {
	itemId: number;
	itemName: string;
	warehouseId: number;
	warehouseCode: string | null;
}

/**
 * "Identificar partida" (SU3–SU5): the straws an entry brought without lot go to one or more lots,
 * existing or new, in parts if needed. The ledger is not touched; each lot's balance in the tank is.
 */
export default function IdentifySemenLotDialog({ target, onClose }: { target: IdentifyTarget; onClose: () => void }) {
	const { headSx, indexSx } = useGridCellStyles();
	const { enqueueSnackbar } = useSnackbar();
	const { data: entries = [] } = useSemenUnidentified(target.itemId, target.warehouseId);
	const { data: lots = [] } = useSemenLots(target.itemId, target.warehouseId);
	const { mutateAsync, isPending } = useIdentifySemenLot();
	const [entryId, setEntryId] = useState<number | null>(null);
	const [shares, setShares] = useState<IdentifyShare[]>([emptyShare()]);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [domain, setDomain] = useState<string | null>(null);
	const entry = entries.find((e) => e.id === entryId) ?? entries[0] ?? null;
	const assigned = shares.reduce((t, s) => t + (Number(s.quantity) || 0), 0);

	useEffect(() => {
		if (entry && entryId === null) {
			setEntryId(entry.id);
			setShares([{ ...emptyShare(), quantity: String(Number(entry.pendingQuantity)) }]);
		}
	}, [entry, entryId]);

	const submit = async () => {
		if (!entry) return;
		const sent = shares.filter((s) => s.quantity.trim() !== '');
		try {
			const result = await mutateAsync({
				entryId: entry.id,
				lots: sent.map((s) => (s.lotId !== null ? { semen_lot_id: s.lotId, quantity: s.quantity } : { lot_code: s.newCode, collection_date: s.collectionDate || null, quantity: s.quantity }))
			});
			enqueueSnackbar(result.status === 'RESOLVED' ? 'Partida identificada: la novedad quedó resuelta.' : `Identificadas. Quedan ${straws(result.pendingQuantity)} por identificar.`, { variant: 'success' });
			onClose();
		} catch (error) {
			const { fields, domain: message } = readApiErrors(error, 'No se pudo identificar la partida.');
			setErrors(fields);
			setDomain(message ?? fields.lots ?? null);
		}
	};

	return (
		<CatalogDialogFrame open title={`Identificar partida · ${target.itemName}`} onClose={onClose} onSubmit={submit} submitLabel="Identificar" pending={isPending} error={domain} maxWidth="md">
			<Stack spacing={2}>
				{entries.length === 0 ? (
					<Alert severity="success" sx={{ fontSize: '0.8rem', py: 0.5 }}>No quedan pajuelas sin partida en {target.warehouseCode}.</Alert>
				) : (
					<TextField select label="Pajuelas sin partida" variant="filled" fullWidth value={entry?.id ?? ''} InputProps={{ sx: { bgcolor: 'action.hover' } }}
						onChange={(e) => {
							const next = entries.find((x) => x.id === Number(e.target.value));
							setEntryId(Number(e.target.value));
							setShares([{ ...emptyShare(), quantity: next ? String(Number(next.pendingQuantity)) : '' }]);
						}}>
						{entries.map((e) => (
							<MenuItem key={e.id} value={e.id}>
								{e.direction > 0 ? 'Ingreso' : 'Salida'} N.º {e.document.number} · {formatDate(e.document.occurredAt)} · quedan {straws(e.pendingQuantity)} en {e.warehouse.code}
							</MenuItem>
						))}
					</TextField>
				)}
				{entry && (
					<>
						<SheetGrid minWidth={560} maxHeight={260}>
							<TableHead>
								<TableRow>
									<TableCell sx={indexSx}>#</TableCell>
									<TableCell sx={headSx}>Partida</TableCell>
									<TableCell sx={{ ...headSx, width: 150 }}>Colección</TableCell>
									<TableCell sx={{ ...headSx, width: 110 }}>Pajuelas</TableCell>
									<TableCell sx={{ ...headSx, width: 48 }} />
								</TableRow>
							</TableHead>
							<TableBody>
								{shares.map((share, index) => (
									<IdentifyShareRow key={share.key} index={index} share={share} lots={lots} errors={errors}
										onChange={(patch) => setShares((cur) => cur.map((s) => (s.key === share.key ? { ...s, ...patch } : s)))}
										onRemove={shares.length > 1 ? () => setShares((cur) => cur.filter((s) => s.key !== share.key)) : undefined} />
								))}
							</TableBody>
						</SheetGrid>
						<Stack direction="row" justifyContent="space-between" alignItems="center">
							<Typography component="button" onClick={() => setShares((cur) => [...cur, emptyShare()])}
								sx={{ border: 0, bgcolor: 'transparent', color: 'primary.main', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', p: 0 }}>
								+ Otra partida
							</Typography>
							<Typography sx={{ fontSize: '0.85rem', color: assigned > Number(entry.pendingQuantity) ? 'error.main' : 'text.secondary' }}>
								Asignadas {straws(assigned)} de {straws(entry.pendingQuantity)}
							</Typography>
						</Stack>
					</>
				)}
			</Stack>
		</CatalogDialogFrame>
	);
}
