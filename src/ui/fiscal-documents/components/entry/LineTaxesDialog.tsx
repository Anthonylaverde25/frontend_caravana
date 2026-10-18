import { useEffect, useState } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, IconButton, MenuItem, Stack, TextField, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Tax } from '@/core/fiscal/domain/entities/FiscalCatalog';
import { OtherTax } from './fiscalEntryState';

interface LineTaxesDialogProps {
	open: boolean;
	itemName: string;
	/** Line taxes other than VAT: fuel tax, internal taxes. */
	taxes: Tax[];
	value: OtherTax[];
	onClose: () => void;
	onSave: (value: OtherTax[]) => void;
}

const filled = { disableUnderline: true, sx: { borderRadius: '6px', bgcolor: 'action.hover' } } as const;

/**
 * "Otros impuestos del renglón" (DS16): the amounts printed on the paper for this line besides VAT.
 * The ones that are not recoverable become part of the line's cost (DS17).
 */
export default function LineTaxesDialog({ open, itemName, taxes, value, onClose, onSave }: LineTaxesDialogProps) {
	const [rows, setRows] = useState<OtherTax[]>(value);
	useEffect(() => setRows(value), [value, open]);

	const free = taxes.filter((t) => !rows.some((r) => r.taxId === t.id));

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '8px', boxShadow: 1, bgcolor: 'background.paper' } }}>
			<Box sx={{ p: 2, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
				<Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
					Otros impuestos · {itemName}
				</Typography>
				<IconButton onClick={onClose} sx={{ color: 'primary.main' }}>
					<FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
				</IconButton>
			</Box>
			<DialogContent>
				<Stack spacing={2}>
					{rows.map((row, index) => {
						const tax = taxes.find((t) => t.id === row.taxId);
						return (
							<Stack key={row.taxId} direction="row" spacing={1.5} alignItems="flex-start">
								<TextField select label="Impuesto" variant="filled" fullWidth value={row.taxId} InputProps={filled}
									helperText={tax ? (tax.isRecoverable ? 'Recuperable: no suma al costo.' : 'No recuperable: suma al costo del renglón.') : ' '}
									onChange={(e) => setRows(rows.map((r, i) => (i === index ? { ...r, taxId: Number(e.target.value) } : r)))}>
									{[tax, ...free].filter((t): t is Tax => !!t).map((t) => (
										<MenuItem key={t.id} value={t.id}>
											{t.name}
										</MenuItem>
									))}
								</TextField>
								<TextField label="Importe" variant="filled" value={row.amount} InputProps={filled} inputProps={{ inputMode: 'decimal' }} sx={{ width: 160 }}
									onChange={(e) => setRows(rows.map((r, i) => (i === index ? { ...r, amount: e.target.value } : r)))} />
								<IconButton onClick={() => setRows(rows.filter((_, i) => i !== index))} sx={{ mt: 1 }}>
									<FuseSvgIcon size={18}>heroicons-outline:trash</FuseSvgIcon>
								</IconButton>
							</Stack>
						);
					})}
					{free.length > 0 && (
						<Button onClick={() => setRows([...rows, { taxId: free[0].id, amount: '' }])} startIcon={<FuseSvgIcon size={16}>heroicons-outline:plus</FuseSvgIcon>}
							sx={{ alignSelf: 'flex-start', textTransform: 'none', fontWeight: 600 }}>
							Agregar impuesto
						</Button>
					)}
					<Alert severity="info" sx={{ fontSize: '0.8rem', py: 0.5 }}>
						El IVA va en su columna. Las percepciones van en "4. Impuestos del comprobante".
					</Alert>
				</Stack>
			</DialogContent>
			<DialogActions sx={{ p: 2, px: 3, bgcolor: 'background.default', borderTop: 1, borderColor: 'divider', justifyContent: 'space-between' }}>
				<Button onClick={onClose} sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}>
					Cancelar
				</Button>
				<Button variant="contained" onClick={() => onSave(rows)}
					sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', px: 3.5, fontWeight: 700, borderRadius: '6px', textTransform: 'none', boxShadow: 'none', '&:hover': { bgcolor: 'primary.dark' } }}>
					Aplicar
				</Button>
			</DialogActions>
		</Dialog>
	);
}
