import { Box, CircularProgress, Drawer, IconButton, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useNavigate } from 'react-router';
import { useSemenLot } from '@/features/semen/hooks/useSemen';
import { straws } from '@/core/semen/domain/rules/semenLabels';
import { formatDate, formatUnitCost } from '@/core/stock/domain/rules/quantityFormat';

interface SemenLotDrawerProps {
	lotId: number | null;
	onClose: () => void;
}

const section = { fontSize: '0.75rem', fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase', color: 'text.secondary' } as const;
const cell = { fontSize: '0.8rem', py: 0.75 } as const;

/** Read-only traceability of a lot (plan 5.7): balance per tank, movements and identifications. */
export default function SemenLotDrawer({ lotId, onClose }: SemenLotDrawerProps) {
	const navigate = useNavigate();
	const { data: lot, isLoading } = useSemenLot(lotId);

	return (
		<Drawer anchor="right" open={lotId !== null} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 520 } } }}>
			<Box sx={{ p: 2, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
				<Box>
					<Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>Partida {lot?.code ?? ''}</Typography>
					<Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{lot?.item.name ?? ''}</Typography>
				</Box>
				<IconButton onClick={onClose} sx={{ color: 'primary.main' }}>
					<FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
				</IconButton>
			</Box>
			{isLoading || !lot ? (
				<Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress size={24} /></Box>
			) : (
				<Stack spacing={3} sx={{ p: 3 }}>
					<Stack spacing={0.5}>
						<Typography sx={section}>Datos</Typography>
						<Typography sx={{ fontSize: '0.85rem' }}>Colección: {lot.collectionDate ? formatDate(lot.collectionDate) : '—'}{lot.collectionCode ? ` · código ${lot.collectionCode}` : ''}</Typography>
						{lot.notes && <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>{lot.notes}</Typography>}
					</Stack>
					<Stack spacing={0.5}>
						<Typography sx={section}>Saldo por termo</Typography>
						{lot.balances.length === 0 && <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>Sin pajuelas.</Typography>}
						{lot.balances.map((b) => (
							<Typography key={b.warehouse.id} sx={{ fontSize: '0.85rem' }}>
								<b>{b.warehouse.code}</b> · {b.warehouse.name}: {straws(b.quantity)}
							</Typography>
						))}
					</Stack>
					<Stack spacing={1}>
						<Typography sx={section}>Movimientos</Typography>
						<Table size="small">
							<TableHead>
								<TableRow>
									<TableCell sx={cell}>Fecha</TableCell>
									<TableCell sx={cell}>Operación</TableCell>
									<TableCell sx={cell}>Termo</TableCell>
									<TableCell sx={cell} align="right">Pajuelas</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{lot.movements.map((m, i) => (
									<TableRow key={i} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/item-documents/${m.document.id}`)}>
										<TableCell sx={cell}>{formatDate(m.document.occurredAt)}</TableCell>
										<TableCell sx={cell}>
											{m.document.typeLabel} N.º {m.document.number}
											{m.provider && <Typography component="div" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>{m.provider}{m.unitCost ? ` · ${formatUnitCost(m.unitCost)} c/u` : ''}</Typography>}
										</TableCell>
										<TableCell sx={cell}>{m.warehouseCode}</TableCell>
										<TableCell sx={{ ...cell, color: m.direction > 0 ? 'success.dark' : 'error.dark', fontWeight: 600 }} align="right">
											{m.direction > 0 ? '+' : '−'}{straws(m.quantity)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</Stack>
					{lot.identifications.length > 0 && (
						<Stack spacing={0.5}>
							<Typography sx={section}>Identificadas después</Typography>
							{lot.identifications.map((i, index) => (
								<Typography key={index} sx={{ fontSize: '0.8rem' }}>
									{straws(i.quantity)} de {i.document.typeLabel} N.º {i.document.number} ({i.warehouseCode})
									{i.identifiedBy ? ` · ${i.identifiedBy}` : ''}{i.identifiedAt ? ` · ${formatDate(i.identifiedAt)}` : ''}
								</Typography>
							))}
						</Stack>
					)}
				</Stack>
			)}
		</Drawer>
	);
}
